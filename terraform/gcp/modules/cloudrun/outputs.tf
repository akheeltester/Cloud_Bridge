output "service_url" {
  description = "Public URL of the Cloud Run service."
  value       = google_cloud_run_v2_service.this.uri
}

output "service_name" {
  description = "Cloud Run service name."
  value       = google_cloud_run_v2_service.this.name
}

output "latest_revision" {
  description = "Latest ready revision."
  value       = google_cloud_run_v2_service.this.latest_ready_revision
}
