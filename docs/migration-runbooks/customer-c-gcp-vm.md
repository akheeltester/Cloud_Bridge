# Runbook — customer-c (NovaRetail) → GCP Compute Engine VM

Phase 7 multi-cloud expansion (Azure replaced: no card available for Azure
signup). Deploys the NovaRetail retail API to a free-tier-eligible Compute
Engine VM in `us-central1`.

> Status: prepared and validated locally. Deployment requires explicit approval
> of the public-IPv4 cost (~$3.60/month — see below).

## Cost breakdown (verified against cloud.google.com/vpc/network-pricing)

| Item | Cost |
|---|---|
| e2-micro VM (us-central1/us-east1/us-west1) | $0 — always-free grant (1 per month) |
| 30GB pd-standard boot disk | $0 — included in the grant |
| Public IPv4 (in use, standard VM) | ~$0.005/hr ≈ $3.60/month — NOT in the grant |
| Egress (Standard tier) | 200GB/month free per region |
| Artifact Registry image storage | within 0.5GB/month free grant |

The VM and disk are free; the public IPv4 is the only recurring charge. It is
unavoidable for a publicly reachable VM (IPv6-only would be free but most
visitors can't reach it). Stop/destroy the VM when not needed to stop the charge
(note: a reserved static IP keeps billing when unused — this stack uses an
ephemeral IP, which is released on destroy).

## Components

| Component | Resource |
|---|---|
| VM | `cloudbridge-novaretail`, e2-micro, us-central1-a, Container-Optimized OS |
| App | Docker container, port 80 → 8000, `--restart always` |
| Data | SQLite on stateful disk `/var/lib/cloudbridge-novaretail` (survives reboots) |
| Image | Artifact Registry `cloudbridge-us/novaretail` (us-central1) |
| Identity | VM service account with `roles/artifactregistry.reader` (no static keys) |
| Firewall | tcp:80 from 0.0.0.0/0 to the instance tag only |
| IaC | `terraform/gcp/environments/customer-c` + `modules/compute-vm` |

## Steps

1. Plan (no resources created):
   ```sh
   PROJECT_ID=iconic-being-431804-c2 ./scripts/deploy/deploy-customer-c-gcp.sh
   ```
2. Review the plan and the IPv4 cost note. Apply only with explicit approval:
   ```sh
   PROJECT_ID=iconic-being-431804-c2 ./scripts/deploy/deploy-customer-c-gcp.sh --apply
   ```
3. The script waits for `/api/health` (VM boot + image pull takes 2-4 minutes).
4. Validate:
   ```sh
   curl -fsS http://<IP>/api/health
   curl -fsS http://<IP>/api/products
   curl -fsS -X POST http://<IP>/api/orders -H 'Content-Type: application/json' \
     -d '{"product_id":1,"quantity":1}'
   ```

## Operations

- SSH: `gcloud compute ssh cloudbridge-novaretail --zone us-central1-a --project iconic-being-431804-c2`
- Logs on the VM: `docker logs cloudbridge-novaretail`
- Update the app: re-run the deploy script (rebuilds/pushes image, then
  `docker rm -f` + `docker run` via a new instance revision or manual restart).
- No TLS: plain HTTP on port 80 (no domain). For HTTPS, add a domain + Caddy or
  a Cloudflare tunnel later.

## Rollback / stop-cost

```sh
cd terraform/gcp/environments/customer-c
terraform destroy   # explicit approval required; releases the ephemeral IP
```
