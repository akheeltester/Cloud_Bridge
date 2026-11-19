# CloudBridge — GCP Compute Engine VM module (customer-c / NovaRetail)
# Free-tier posture: e2-micro + 30GB pd-standard in us-central1/us-east1/us-west1
# (GCP always-free grant). NOTE: the public IPv4 address is billed separately
# (~$0.005/hr ≈ $3.60/month) — it is NOT part of the free VM grant.
# OS: Container-Optimized OS (docker preinstalled, pulls from Artifact Registry
# using the VM service account).

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

resource "google_service_account" "vm" {
  project      = var.project_id
  account_id   = "${var.instance_name}-sa"
  display_name = "CloudBridge ${var.instance_name} VM"
}

resource "google_project_iam_member" "ar_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_compute_instance" "this" {
  project      = var.project_id
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["${var.instance_name}-http"]

  boot_disk {
    initialize_params {
      image = var.boot_image
      size  = var.disk_size_gb
      type  = var.disk_type
    }
  }

  network_interface {
    network = var.network
    # Ephemeral public IPv4 (billed ~$3.60/mo; see cost note above).
    # Standard tier: 200GB/mo free egress per region instead of Premium's 1GB.
    access_config {
      network_tier = "STANDARD"
    }
  }

  service_account {
    email  = google_service_account.vm.email
    scopes = ["devstorage.read_only", "logging.write", "monitoring.write"]
  }

  metadata = {
    startup-script = <<-EOT
      #!/bin/bash
      set -euo pipefail
      # Container-Optimized OS: configure the AR credential helper, then run
      # the app with a restart policy. /var/lib is stateful across reboots.
      docker-credential-gcr configure-docker --registries=${var.registry_host} || true
      mkdir -p /var/lib/${var.instance_name}
      docker rm -f ${var.instance_name} >/dev/null 2>&1 || true
      docker run -d --name ${var.instance_name} --restart always \
        -p ${var.host_port}:${var.container_port} \
        -e NOVA_DB_PATH=/app/data/nova.db \
        -v /var/lib/${var.instance_name}:/app/data \
        ${var.container_image}
    EOT
  }

  # Free-tier grant covers e2-micro only; do not upsize without approval.
  lifecycle {
    ignore_changes = [boot_disk[0].initialize_params[0].image]
  }
}

resource "google_compute_firewall" "http" {
  project       = var.project_id
  name          = "${var.instance_name}-allow-http"
  network       = var.network
  direction     = "INGRESS"
  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["${var.instance_name}-http"]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.host_port)]
  }
}
