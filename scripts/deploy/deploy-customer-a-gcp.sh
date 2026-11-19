#!/usr/bin/env bash
# CloudBridge — deploy customer-a (Jigsaw) to GCP Cloud Run.
#
# Plan-first by default. Pass --apply to actually provision (requires explicit
# approval). Free-tier posture is enforced by the Terraform module
# (scale-to-zero, 1 instance cap, 512Mi, request-based CPU).
#
# Prerequisites: gcloud (authenticated), docker, terraform.
# Usage:
#   PROJECT_ID=my-billing-project ./deploy-customer-a-gcp.sh           # plan only
#   PROJECT_ID=my-billing-project ./deploy-customer-a-gcp.sh --apply   # deploy
set -euo pipefail

REGION="${REGION:-australia-southeast1}"
SERVICE_NAME="${SERVICE_NAME:-cloudbridge-jigsaw}"
REPOSITORY_ID="${REPOSITORY_ID:-cloudbridge}"
IMAGE_NAME="${IMAGE_NAME:-jigsaw}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
APPLY="false"
[[ "${1:-}" == "--apply" ]] && APPLY="true"

: "${PROJECT_ID:?Set PROJECT_ID to a billing-enabled GCP project}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
APP_DIR="$ROOT/customers/customer-a"
TF_DIR="$ROOT/terraform/gcp/environments/customer-a"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_ID}/${IMAGE_NAME}:${IMAGE_TAG}"

command -v gcloud >/dev/null || { echo "gcloud not found"; exit 1; }
command -v docker >/dev/null || { echo "docker not found"; exit 1; }
command -v terraform >/dev/null || { echo "terraform not found"; exit 1; }

echo "==> Project: $PROJECT_ID  Region: $REGION  Image: $IMAGE"

echo "==> Enabling required APIs (free)…"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
  --project "$PROJECT_ID"

echo "==> Ensuring Artifact Registry repository exists…"
gcloud artifacts repositories describe "$REPOSITORY_ID" \
  --location "$REGION" --project "$PROJECT_ID" >/dev/null 2>&1 || \
gcloud artifacts repositories create "$REPOSITORY_ID" \
  --repository-format=docker --location "$REGION" --project "$PROJECT_ID" \
  --description="CloudBridge customer-a images"

echo "==> Configuring Docker credential helper for Artifact Registry…"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Building Jigsaw image…"
docker build -t "$IMAGE" "$APP_DIR"

echo "==> Pushing image…"
docker push "$IMAGE"

echo "==> Terraform init + plan…"
cd "$TF_DIR"
[[ -f terraform.tfvars ]] || cp terraform.tfvars.example terraform.tfvars
# Inject the resolved project/region/tag without committing secrets.
terraform init -input=false
# The repo is pre-created above so the image push works; adopt it into state
# if present (idempotent — import fails harmlessly when already tracked).
terraform import google_artifact_registry_repository.jigsaw \
  "projects/${PROJECT_ID}/locations/${REGION}/repositories/${REPOSITORY_ID}" >/dev/null 2>&1 || true
terraform plan -input=false \
  -var "project_id=$PROJECT_ID" \
  -var "region=$REGION" \
  -var "service_name=$SERVICE_NAME" \
  -var "repository_id=$REPOSITORY_ID" \
  -var "image_name=$IMAGE_NAME" \
  -var "image_tag=$IMAGE_TAG" \
  -out=tfplan

if [[ "$APPLY" != "true" ]]; then
  echo "==> Plan complete. Re-run with --apply to deploy (explicit approval required)."
  exit 0
fi

echo "==> Applying…"
terraform apply -input=false tfplan
URL="$(terraform output -raw service_url)"
echo "==> Deployed: $URL"
echo "==> Smoke test:"
curl -fsS -o /dev/null -w "HTTP %{http_code}\n" "$URL/" || echo "smoke request failed"
