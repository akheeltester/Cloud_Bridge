variable "resource_group_name" {
  description = "Resource group to deploy into."
  type        = string
}

variable "location" {
  description = "Azure region."
  type        = string
  default     = "australiaeast"
}

variable "app_name" {
  description = "Globally unique web app name (becomes <name>.azurewebsites.net)."
  type        = string
}

variable "sku_name" {
  description = "App Service plan SKU. F1 = Free."
  type        = string
  default     = "F1"
}

variable "image" {
  description = "Public container image reference (e.g. ghcr.io/owner/novaretail:latest)."
  type        = string
}

variable "docker_registry_url" {
  description = "Registry URL for the public image."
  type        = string
  default     = "https://ghcr.io"
}

variable "container_port" {
  description = "Port the container listens on."
  type        = number
  default     = 8000
}

variable "health_check_path" {
  description = "Path App Service probes for health."
  type        = string
  default     = "/api/health"
}
