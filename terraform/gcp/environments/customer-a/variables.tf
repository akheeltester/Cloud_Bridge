variable "project_id" {
  description = "GCP project ID (billing-enabled)."
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry."
  type        = string
  default     = "australia-southeast1"
}

variable "service_name" {
  description = "Cloud Run service name."
  type        = string
  default     = "cloudbridge-jigsaw"
}

variable "repository_id" {
  description = "Artifact Registry repository ID."
  type        = string
  default     = "cloudbridge"
}

variable "image_name" {
  description = "Image name within the repository."
  type        = string
  default     = "jigsaw"
}

variable "image_tag" {
  description = "Image tag to deploy."
  type        = string
  default     = "latest"
}

variable "allow_unauthenticated" {
  description = "Allow public access to the demo."
  type        = bool
  default     = true
}
