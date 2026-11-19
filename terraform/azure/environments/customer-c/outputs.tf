output "app_url" {
  description = "Public HTTPS URL of the NovaRetail app."
  value       = module.novaretail.app_url
}

output "resource_group" {
  description = "Resource group name."
  value       = azurerm_resource_group.this.name
}
