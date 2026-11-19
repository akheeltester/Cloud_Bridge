variable "project_id" {
  description = "GCP project ID (billing-enabled)."
  type        = string
}

variable "region" {
  description = "Free-tier eligible region for e2-micro."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zone within the region."
  type        = string
  default     = "us-central1-a"
}

variable "instance_name" {
  description = "VM instance name."
  type        = string
  default     = "cloudbridge-novaretail"
}

variable "repository_id" {
  description = "Artifact Registry repository ID (region-scoped)."
  type        = string
  default     = "cloudbridge-us"
}

variable "image_name" {
  description = "Image name within the repository."
  type        = string
  default     = "novaretail"
}

variable "image_tag" {
  description = "Image tag to deploy."
  type        = string
  default     = "latest"
}
