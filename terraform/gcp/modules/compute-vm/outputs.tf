output "public_ip" {
  description = "Ephemeral public IPv4 of the VM."
  value       = google_compute_instance.this.network_interface[0].access_config[0].nat_ip
}

output "app_url" {
  description = "Public HTTP URL of the app."
  value       = "http://${google_compute_instance.this.network_interface[0].access_config[0].nat_ip}"
}

output "instance_name" {
  description = "VM instance name."
  value       = google_compute_instance.this.name
}

output "ssh_command" {
  description = "Command to SSH into the VM."
  value       = "gcloud compute ssh ${google_compute_instance.this.name} --zone ${var.zone} --project ${var.project_id}"
}
