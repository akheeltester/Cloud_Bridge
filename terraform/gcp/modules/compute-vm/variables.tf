variable "project_id" {
  description = "GCP project ID (billing-enabled)."
  type        = string
}

variable "region" {
  description = "Region (must be us-central1/us-east1/us-west1 for the free e2-micro grant)."
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
}

variable "machine_type" {
  description = "Machine type. e2-micro is the free-tier eligible size."
  type        = string
  default     = "e2-micro"
}

variable "boot_image" {
  description = "Boot image (Container-Optimized OS has docker preinstalled)."
  type        = string
  default     = "cos-cloud/cos-stable"
}

variable "disk_size_gb" {
  description = "Boot disk size. Free grant covers 30GB pd-standard."
  type        = number
  default     = 30
}

variable "disk_type" {
  description = "Boot disk type. pd-standard is free-tier eligible."
  type        = string
  default     = "pd-standard"
}

variable "network" {
  description = "VPC network name."
  type        = string
  default     = "default"
}

variable "container_image" {
  description = "Fully-qualified container image to run."
  type        = string
}

variable "registry_host" {
  description = "Artifact Registry host for the credential helper."
  type        = string
  default     = "us-central1-docker.pkg.dev"
}

variable "container_port" {
  description = "Port the container listens on."
  type        = number
  default     = 8000
}

variable "host_port" {
  description = "Public port mapped to the container (firewall opens this)."
  type        = number
  default     = 80
}
