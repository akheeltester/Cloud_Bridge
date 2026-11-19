variable "project_id" {
  description = "GCP project ID (must be billing-enabled for Cloud Run)."
  type        = string
}

variable "region" {
  description = "Cloud Run region."
  type        = string
  default     = "australia-southeast1"
}

variable "service_name" {
  description = "Cloud Run service name."
  type        = string
}

variable "image" {
  description = "Fully-qualified container image (e.g. REGION-docker.pkg.dev/PROJECT/REPO/jigsaw:TAG)."
  type        = string
}

variable "container_port" {
  description = "Port the container listens on."
  type        = number
  default     = 8080
}

variable "min_instances" {
  description = "Minimum instances. 0 = scale to zero (free-tier friendly)."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum instances (cost cap)."
  type        = number
  default     = 1
}

variable "cpu" {
  description = "CPU limit per instance."
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory limit per instance."
  type        = string
  default     = "512Mi"
}

variable "allow_unauthenticated" {
  description = "Allow public (allUsers) invocation. True for the public demo."
  type        = bool
  default     = true
}

variable "env_vars" {
  description = "Non-secret environment variables for the container."
  type        = map(string)
  default     = {}
}
