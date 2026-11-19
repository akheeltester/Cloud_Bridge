# CloudBridge — Azure App Service module (customer-c / NovaRetail)
# Free-tier posture: F1 (Free) Linux plan, always_on disabled, single instance.
# Image is pulled from a PUBLIC registry (e.g. ghcr.io) to avoid paid ACR.

terraform {
  required_version = ">= 1.9.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

resource "azurerm_service_plan" "this" {
  name                = "${var.app_name}-plan"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = var.sku_name
}

resource "azurerm_linux_web_app" "this" {
  name                = var.app_name
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.this.id
  https_only          = true

  site_config {
    always_on         = false # F1 does not support always-on.
    health_check_path = var.health_check_path
    ftps_state        = "Disabled" # Checkov CKV_AZURE_78 (FTP/FTPS deployments off)
    http2_enabled     = true       # Checkov CKV_AZURE_18
    application_stack {
      docker_image_name   = var.image
      docker_registry_url = var.docker_registry_url
    }
  }

  app_settings = {
    WEBSITES_PORT                  = tostring(var.container_port)
    NOVA_DB_PATH                   = "/home/data/nova.db"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
  }

  identity {
    type = "SystemAssigned"
  }
}
