# CloudBridge — customer-c (NovaRetail) on GCP Compute Engine (free-tier VM)
# Phase 7. Plan-first: `terraform apply` requires explicit approval.
#
# Free-tier posture: e2-micro + 30GB pd-standard in us-central1 (always-free
# grant). COST NOTE: the public IPv4 is billed separately (~$3.60/month) and is
# NOT covered by the free VM grant — approval required before apply.
#
# Image is built/pushed by scripts/deploy/deploy-customer-c-gcp.sh before apply.

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

resource "google_artifact_registry_repository" "nova" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "CloudBridge customer-c (NovaRetail) container images"
  format        = "DOCKER"
}

# Reserved static IP (promoted from the original ephemeral IP; STANDARD tier).
resource "google_compute_address" "nova" {
  project      = var.project_id
  name         = "novaretail-static-ip"
  region       = var.region
  address_type = "EXTERNAL"
  network_tier = "STANDARD"
}

locals {
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}/${var.image_name}:${var.image_tag}"
}

module "novaretail" {
  source = "../../modules/compute-vm"

  project_id      = var.project_id
  region          = var.region
  zone            = var.zone
  instance_name   = var.instance_name
  machine_type    = "e2-micro"
  disk_size_gb    = 30
  disk_type       = "pd-standard"
  container_image = local.image
  registry_host   = "${var.region}-docker.pkg.dev"
  container_port  = 8000
  host_port       = 80
  tls_domain      = var.tls_domain
  public_ip       = google_compute_address.nova.address

  depends_on = [google_artifact_registry_repository.nova]
}
