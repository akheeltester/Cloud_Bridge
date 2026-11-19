#!/usr/bin/env bash
# CloudBridge — deploy customer-c (NovaRetail) to a GCP Compute Engine VM.
#
# Free-tier posture: e2-micro + 30GB pd-standard in us-central1 (always-free
# grant). COST NOTE: the public IPv4 is billed ~$0.005/hr (~$3.60/month) and is
# NOT part of the free VM grant — explicit approval required before --apply.
#
# Plan-first by default. Pass --apply to provision.
# Prerequisites: gcloud (authenticated), docker, terraform.
# Usage:
#   PROJECT_ID=my-project ./deploy-customer-c-gcp.sh           # plan only
#   PROJECT_ID=my-project ./deploy-customer-c-gcp.sh --apply   # deploy
set -euo pipefail

REGION="${REGION:-us-central1}"
ZONE="${ZONE:-us-central1-a}"
INSTANCE_NAME="${INSTANCE_NAME:-cloudbridge-novaretail}"
REPOSITORY_ID="${REPOSITORY_ID:-cloudbridge-us}"
IMAGE_NAME="${IMAGE_NAME:-novaretail}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
APPLY="false"
[[ "${1:-}" == "--apply" ]] && APPLY="true"

: "${PROJECT_ID:?Set PROJECT_ID to a billing-enabled GCP project}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT/customers/customer-c"
TF_DIR="$ROOT/terraform/gcp/environments/customer-c"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_ID}/${IMAGE_NAME}:${IMAGE_TAG}"

command -v gcloud >/dev/null || { echo "gcloud not found"; exit 1; }
command -v docker >/dev/null || { echo "docker not found"; exit 1; }
command -v terraform >/dev/null || { echo "terraform not found"; exit 1; }

echo "==> Project: $PROJECT_ID  Region: $REGION  Image: $IMAGE"

echo "==> Enabling required APIs (free)…"
gcloud services enable compute.googleapis.com artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

echo "==> Ensuring Artifact Registry repository exists…"
gcloud artifacts repositories describe "$REPOSITORY_ID" \
  --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1 || \
gcloud artifacts repositories create "$REPOSITORY_ID" \
  --repository-format=docker --location "$REGION" --project "$PROJECT_ID" \
  --description="CloudBridge customer-c images"

echo "==> Configuring Docker credential helper…"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building NovaRetail image…"
docker build -t "$IMAGE" "$APP_DIR"

echo "==> Pushing image…"
docker push "$IMAGE"

echo "==> Terraform init + plan…"
cd "$TF_DIR"
[[ -f terraform.tfvars ]] || cp terraform.tfvars.example terraform.tfvars
terraform init -input=false
# Repo pre-created above for the push; adopt into state (idempotent).
terraform import google_artifact_registry_repository.nova \
  "projects/${PROJECT_ID}/locations/${REGION}/repositories/${REPOSITORY_ID}" >/dev/null 2>&1 || true
terraform plan -input=false \
  -var "project_id=$PROJECT_ID" \
  -var "region=$REGION" \
  -var "zone=$ZONE" \
  -var "instance_name=$INSTANCE_NAME" \
  -var "repository_id=$REPOSITORY_ID" \
  -var "image_name=$IMAGE_NAME" \
  -var "image_tag=$IMAGE_TAG" \
  -out=tfplan

if [[ "$APPLY" != "true" ]]; then
  echo "==> Plan complete. Re-run with --apply to deploy (explicit approval required)."
  echo "==> Reminder: public IPv4 costs ~\$3.60/month (not in the free VM grant)."
  exit 0
fi

echo "==> Applying…"
terraform apply -input=false tfplan
URL="$(terraform output -raw app_url)"
echo "==> Deployed: $URL (VM boot + image pull can take 2-4 minutes)"
echo "==> Waiting for the app to come up…"
for i in $(seq 1 24); do
  if curl -fsS --max-time 10 "$URL/api/health" >/dev/null 2>&1; then
    echo "==> Health check:"
    curl -fsS "$URL/api/health"; echo
    exit 0
  fi
  sleep 10
done
echo "==> App not healthy yet — check: $(terraform output -raw ssh_command)"
exit 1
