# CloudBridge — customer-c (NovaRetail) on Azure App Service (F1 Free)
# Phase 7. Plan-first: `terraform apply` requires explicit approval.
# Cost posture: F1 free plan, public image from ghcr.io (no paid ACR).
#
# The container image is built and pushed by scripts/deploy/deploy-customer-c-azure.sh
# before this environment is applied. No secrets are stored here.

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "this" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Project   = "CloudBridge"
    Customer  = "customer-c"
    ManagedBy = "Terraform"
  }
}

module "novaretail" {
  source = "../../modules/appservice"

  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  app_name            = var.app_name
  sku_name            = "F1"
  image               = var.image
  docker_registry_url = var.docker_registry_url
  container_port      = 8000
  health_check_path   = "/api/health"
}
