# Runbook — customer-a (Jigsaw) → GCP Cloud Run

Phase 7 multi-cloud expansion. Deploys the ACME/Jigsaw Node application to GCP
Cloud Run in `australia-southeast1`. Free-tier posture: scale-to-zero, one
instance cap, 512Mi memory, request-based CPU billing.

> Status: prepared and validated locally (`terraform validate` passed). Actual
> deployment requires a billing-enabled GCP project and explicit cost approval.

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

## Rollback

```sh
cd terraform/gcp/environments/customer-a
terraform destroy   # explicit approval required
```
Or roll the Cloud Run traffic to a previous revision in the console.
