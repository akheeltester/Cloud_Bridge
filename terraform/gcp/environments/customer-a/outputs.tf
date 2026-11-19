output "service_url" {
  description = "Public URL of the Jigsaw Cloud Run service."
  value       = module.jigsaw.service_url
}

output "image" {
  description = "Deployed image reference."
  value       = local.image
}

output "repository" {
  description = "Artifact Registry repository path."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}"
}
