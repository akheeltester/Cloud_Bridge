# Runbook — customer-c (NovaRetail) → Azure App Service

Phase 7 multi-cloud expansion. Deploys the NovaRetail retail API to Azure App
Service (Linux, F1 Free plan) in `australiaeast`. The container image is
published to a PUBLIC ghcr.io package so no paid Azure Container Registry is
needed.

> Status: DEFERRED (Azure signup requires a payment card, which is unavailable).
> IaC prepared and validated locally (`terraform validate` passed); kept for a
> future Azure engagement. NovaRetail was deployed to a free-tier GCP VM instead
> — see `customer-c-gcp-vm.md`.

## Prerequisites

- `az` CLI installed and logged in (`az login`).
- `docker` logged in to ghcr.io (`docker login ghcr.io` with a PAT, `write:packages`).
- `terraform` >= 1.9.
- The ghcr.io package `ghcr.io/<owner>/novaretail` must be set to PUBLIC for the
  free App Service pull to work without registry credentials.

## Components

| Component | Resource |
|---|---|
| Application | Linux Web App `cloudbridge-novaretail-<unique>` (container port 8000) |
| Plan | App Service Plan F1 (Free), `always_on = false` |
| Resource group | `rg-cloudbridge-novaretail` |
| Health probe | `/api/health` |
| IaC | `terraform/azure/environments/customer-c` + `modules/appservice` |

## Steps

1. Confirm subscription and region availability:
   ```sh
   az account show
   az account set --subscription SUBSCRIPTION_ID
   ```
2. Build + push the image, then plan (no resources created):
   ```sh
   SUBSCRIPTION_ID=SUBSCRIPTION_ID APP_NAME=cloudbridge-novaretail-xyz \
     ./scripts/deploy/deploy-customer-c-azure.sh
   ```
3. Review the plan. Apply only with explicit approval:
   ```sh
   SUBSCRIPTION_ID=SUBSCRIPTION_ID APP_NAME=cloudbridge-novaretail-xyz \
     ./scripts/deploy/deploy-customer-c-azure.sh --apply
   ```
4. Validate (F1 cold start can take ~30s):
   ```sh
   curl -fsS https://<app>.azurewebsites.net/api/health
   curl -fsS https://<app>.azurewebsites.net/api/products
   ```

## Cost notes

- F1 is free but has daily compute-minute quotas and no always-on; the app sleeps
  when idle. This is acceptable for a portfolio demo.
- NovaRetail uses embedded SQLite. On F1 the filesystem is not durable across
  restarts; data re-seeds on cold start. For persistence, mount Azure Storage or
  move to Azure Database for PostgreSQL (adds cost — approve separately).

## Rollback

```sh
cd terraform/azure/environments/customer-c
terraform destroy   # explicit approval required
```
