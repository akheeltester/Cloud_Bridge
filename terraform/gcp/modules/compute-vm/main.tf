# CloudBridge — GCP Compute Engine VM module (customer-c / NovaRetail)
# Free-tier posture: e2-micro + 30GB pd-standard in us-central1/us-east1/us-west1
# (GCP always-free grant). NOTE: the public IPv4 address is billed separately
# (~$0.005/hr ≈ $3.60/month) — it is NOT part of the free VM grant.
# OS: Container-Optimized OS (docker preinstalled, pulls from Artifact Registry
# using the VM service account).
# Optional TLS: when tls_domain is set, Caddy runs as a sidecar container with
# automatic Let's Encrypt HTTPS and reverse-proxies to the app container.

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

resource "google_project_iam_member" "log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_project_iam_member" "metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.vm.email}"
}

resource "google_compute_instance" "this" {
  project      = var.project_id
  name         = var.instance_name
  machine_type = var.machine_type
  zone         = var.zone

  tags = ["${var.instance_name}-http"]

  # Required for in-place updates that need a stop/start (e.g. Shielded VM).
  allow_stopping_for_update = true

  boot_disk {
    auto_delete = false # Prowler: keep disk on instance deletion
    initialize_params {
      image = var.boot_image
      size  = var.disk_size_gb
      type  = var.disk_type
    }
  }

  # Prowler: protect against accidental teardown (disable before destroy).
  deletion_protection = true

  network_interface {
    network = var.network
    # Static IP when provided (stable DNS target); STANDARD tier: 200GB/mo free
    # egress. In-use IPv4 billed ~$3.60/mo (approved, from credits).
    access_config {
      nat_ip       = var.public_ip != "" ? var.public_ip : null
      network_tier = "STANDARD"
    }
  }

  # Checkov CKV_GCP_39: Shielded VM (free, supported by COS).
  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  service_account {
    email = google_service_account.vm.email
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
    ]
  }

  metadata = {
    # Checkov CKV_GCP_32: block project-wide SSH keys (instance-level keys via
    # gcloud compute ssh still work).
    block-project-ssh-keys = "TRUE"
    startup-script         = <<-EOT
      #!/bin/bash
      set -euo pipefail
      # Container-Optimized OS: root FS is read-only — put the docker credential
      # config on the writable stateful partition or AR auth fails.
      export DOCKER_CONFIG=/var/lib/${var.instance_name}/docker-config
      mkdir -p "$DOCKER_CONFIG" /var/lib/${var.instance_name}
      # The container runs as a non-root user; the bind-mounted data dir must
      # be writable by it (host dirs are root-owned by default).
      chmod 0777 /var/lib/${var.instance_name}
      # COS guest firewall defaults to INPUT DROP (only SSH/lo/icmp). Open the
      # app ports in the guest chain too — the VPC firewall alone is not enough.
      iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || \
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT
      %{if var.tls_domain != ""}
      iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || \
        iptables -I INPUT -p tcp --dport 443 -j ACCEPT
      %{endif}
      docker-credential-gcr configure-docker --registries=${var.registry_host}
      # Always pull :latest — docker run alone reuses a stale cached image.
      docker pull ${var.container_image}
      docker network create cloudbridge >/dev/null 2>&1 || true
      docker rm -f ${var.instance_name} caddy >/dev/null 2>&1 || true
      %{if var.tls_domain != ""}
      # TLS mode: app is internal-only; Caddy terminates HTTPS on 80/443.
      cat > /var/lib/${var.instance_name}/Caddyfile <<'CADDYEOF'
      ${var.tls_domain} {
        reverse_proxy ${var.instance_name}:${var.container_port}
      }
      CADDYEOF
      docker run -d --name ${var.instance_name} --restart always \
        --network cloudbridge \
        -e NOVA_DB_PATH=/app/data/nova.db \
        -v /var/lib/${var.instance_name}:/app/data \
        ${var.container_image}
      mkdir -p /var/lib/caddy-data
      docker run -d --name caddy --restart always \
        --network cloudbridge \
        -p 80:80 -p 443:443 \
        -v /var/lib/${var.instance_name}/Caddyfile:/etc/caddy/Caddyfile:ro \
        -v /var/lib/caddy-data:/data \
        caddy:2
      %{else}
      docker run -d --name ${var.instance_name} --restart always \
        -p ${var.host_port}:${var.container_port} \
        -e NOVA_DB_PATH=/app/data/nova.db \
        -v /var/lib/${var.instance_name}:/app/data \
        ${var.container_image}
      %{endif}
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
    ports    = var.tls_domain != "" ? ["80", "443"] : [tostring(var.host_port)]
  }
}
