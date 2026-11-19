# Runbook — customer-a (Jigsaw) → GCP Cloud Run

Phase 7 multi-cloud expansion. Deploys the ACME/Jigsaw Node application to GCP
Cloud Run in `australia-southeast1`. Free-tier posture: scale-to-zero, one
instance cap, 512Mi memory, request-based CPU billing.

> Status: DEPLOYED and live-verified (2026-11-19).
> Live URL: https://cloudbridge-jigsaw-j2qhkxzfka-ts.a.run.app
> Project: iconic-being-431804-c2 · Region: australia-southeast1
> Verified: `/`, `/login`, `/portal` HTTP 200; auth sign-up HTTP 200 (real
> embedded-DB write). Free-tier posture: scale-to-zero, 1 instance, 512Mi.

## Prerequisites

- `gcloud` authenticated (`gcloud auth list`) with access to a billing-enabled project.
- `docker` running.
- `terraform` >= 1.9.
- Cloud Run free tier applies within monthly quotas; a billing-enabled project is
  still required. Confirm quotas before applying.

## Components

| Component | Resource |
|---|---|
| Application | Cloud Run service `cloudbridge-jigsaw` (container port 8080) |
| Image registry | Artifact Registry repo `cloudbridge` (DOCKER) |
| Public access | `roles/run.invoker` for `allUsers` (demo) |
| IaC | `terraform/gcp/environments/customer-a` + `modules/cloudrun` |

## Steps

1. Select the project and confirm billing is enabled:
   ```sh
   gcloud config set project PROJECT_ID
   gcloud billing projects describe PROJECT_ID   # billingEnabled: true
   ```
2. Plan (no resources created):
   ```sh
   PROJECT_ID=PROJECT_ID ./scripts/deploy/deploy-customer-a-gcp.sh
   ```
   The script enables the Run + Artifact Registry APIs, creates the repo,
   builds and pushes the Jigsaw image, then runs `terraform plan`.
3. Review the plan. Apply only with explicit approval:
   ```sh
   PROJECT_ID=PROJECT_ID ./scripts/deploy/deploy-customer-a-gcp.sh --apply
   ```
4. Validate:
   ```sh
   curl -fsS https://<service-url>/api/...   # app routes
   curl -fsS -o /dev/null -w '%{http_code}\n' https://<service-url>/
   ```
   The script prints the service URL and runs an HTTP smoke check.

## Notes

- Jigsaw uses an embedded PGlite fallback when `DATABASE_URL` is unset. That is
  suitable for a demo only — not durable storage. For a persistent deployment,
  attach a managed PostgreSQL (e.g. Cloud SQL) and set `DATABASE_URL`; this adds
  cost and must be approved separately.
- To require authentication instead of public access, set
  `allow_unauthenticated = false` in `terraform.tfvars`.

## Pitfalls encountered (fixed in this repo)

- **PGlite runtime assets**: nitro drops `pglite.data`, `pglite.wasm`, and
  `initdb.wasm` from the bundle. The Dockerfile copies all three into
  `.output/server/_libs/`. Without them, pages serve 200 but the DB is dead.
- **Reserved env var**: Cloud Run rejects a manual `PORT` env var (it sets it
  automatically). Do not include `PORT` in `env_vars`.
- **Registry pre-created by the script**: the deploy script creates the
  Artifact Registry repo before `terraform apply` so the image push works; it
  then `terraform import`s the repo into state to avoid a 409 conflict.
- **Auth origin**: better-auth rejects sign-in/sign-up with "Invalid origin"
  unless `BETTER_AUTH_URL` equals the public Cloud Run URL. It is set in the
  environment's `env_vars`; update it if the service URL ever changes.
- **Billing**: the project's original billing account was closed; deployment
  required linking an open billing account (`gcloud billing projects link`).

## Rollback

```sh
cd terraform/gcp/environments/customer-a
terraform destroy   # explicit approval required
```
Or roll the Cloud Run traffic to a previous revision in the console.
