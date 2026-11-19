variable "subscription_id" {
  description = "Azure subscription ID."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group name."
  type        = string
  default     = "rg-cloudbridge-novaretail"
}

variable "location" {
  description = "Azure region."
  type        = string
  default     = "australiaeast"
}

variable "app_name" {
  description = "Globally unique web app name."
  type        = string
  default     = "cloudbridge-novaretail"
}

variable "image" {
  description = "Public container image reference."
  type        = string
  default     = "ghcr.io/akheeltester/novaretail:latest"
}

variable "docker_registry_url" {
  description = "Public registry URL."
  type        = string
  default     = "https://ghcr.io"
}
