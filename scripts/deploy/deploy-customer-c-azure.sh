#!/usr/bin/env bash
# CloudBridge — deploy customer-c (NovaRetail) to Azure App Service (F1 Free).
#
# Plan-first by default. Pass --apply to actually provision (explicit approval).
# Free-tier posture: F1 free plan; image published to PUBLIC ghcr.io (no paid ACR).
#
# Prerequisites: az (logged in), docker (logged in to ghcr.io), terraform.
# Usage:
#   SUBSCRIPTION_ID=... APP_NAME=cloudbridge-novaretail-xyz ./deploy-customer-c-azure.sh
#   SUBSCRIPTION_ID=... APP_NAME=... ./deploy-customer-c-azure.sh --apply
set -euo pipefail

LOCATION="${LOCATION:-australiaeast}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-cloudbridge-novaretail}"
GH_OWNER="${GH_OWNER:-akheeltester}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
APPLY="false"
[[ "${1:-}" == "--apply" ]] && APPLY="true"

: "${SUBSCRIPTION_ID:?Set SUBSCRIPTION_ID}"
: "${APP_NAME:?Set APP_NAME to a globally unique web app name}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT/customers/customer-c"
TF_DIR="$ROOT/terraform/azure/environments/customer-c"
IMAGE="ghcr.io/${GH_OWNER}/novaretail:${IMAGE_TAG}"

command -v az >/dev/null || { echo "az CLI not found — install it and run 'az login'"; exit 1; }
command -v docker >/dev/null || { echo "docker not found"; exit 1; }
command -v terraform >/dev/null || { echo "terraform not found"; exit 1; }

echo "==> Subscription: $SUBSCRIPTION_ID  App: $APP_NAME  Image: $IMAGE"
az account set --subscription "$SUBSCRIPTION_ID"

echo "==> Building NovaRetail image…"
docker build -t "$IMAGE" "$APP_DIR"

echo "==> Pushing to ghcr.io (must be a PUBLIC package for free App Service pull)…"
echo "    Ensure 'docker login ghcr.io' has been run with a PAT (write:packages)."
docker push "$IMAGE"

echo "==> Terraform init + plan…"
cd "$TF_DIR"
[[ -f terraform.tfvars ]] || cp terraform.tfvars.example terraform.tfvars
terraform init -input=false
terraform plan -input=false \
  -var "subscription_id=$SUBSCRIPTION_ID" \
  -var "resource_group_name=$RESOURCE_GROUP" \
  -var "location=$LOCATION" \
  -var "app_name=$APP_NAME" \
  -var "image=$IMAGE" \
  -out=tfplan

if [[ "$APPLY" != "true" ]]; then
  echo "==> Plan complete. Re-run with --apply to deploy (explicit approval required)."
  exit 0
fi

echo "==> Applying…"
terraform apply -input=false tfplan
URL="$(terraform output -raw app_url)"
echo "==> Deployed: $URL"
echo "==> Smoke test (App Service cold start may take ~30s):"
sleep 20
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "$URL/api/health" || echo "smoke request failed"
