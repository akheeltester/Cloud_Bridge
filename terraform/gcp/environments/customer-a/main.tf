# CloudBridge — customer-a (ACME / Jigsaw) on GCP Cloud Run
# Phase 7. Plan-first: `terraform apply` requires explicit approval.
# Cost posture: free-tier friendly (scale-to-zero, 1 instance cap, 512Mi).
#
# The container image is built and pushed by scripts/deploy/deploy-customer-a-gcp.sh
# before this environment is applied. No secrets are stored here.

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Container registry for the Jigsaw image.
resource "google_artifact_registry_repository" "jigsaw" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "CloudBridge customer-a (Jigsaw) container images"
  format        = "DOCKER"
}

locals {
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}/${var.image_name}:${var.image_tag}"
}

module "jigsaw" {
  source = "../../modules/cloudrun"

  project_id            = var.project_id
  region                = var.region
  service_name          = var.service_name
  image                 = local.image
  container_port        = 8080
  min_instances         = 0
  max_instances         = 1
  cpu                   = "1"
  memory                = "512Mi"
  allow_unauthenticated = var.allow_unauthenticated

  # PORT is reserved by Cloud Run (auto-set to container_port); do not set it here.
  # BETTER_AUTH_URL must match the public origin or better-auth rejects sign-in/sign-up.
  # Cloud Run service URLs are stable; update this if the service is ever recreated.
  env_vars = {
    NODE_ENV        = "production"
    HOST            = "0.0.0.0"
    BETTER_AUTH_URL = "https://cloudbridge-jigsaw-j2qhkxzfka-ts.a.run.app"
  }

  depends_on = [google_artifact_registry_repository.jigsaw]
}
