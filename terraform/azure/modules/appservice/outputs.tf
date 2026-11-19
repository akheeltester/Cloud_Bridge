output "app_url" {
  description = "Public HTTPS URL of the web app."
  value       = "https://${azurerm_linux_web_app.this.default_hostname}"
}

output "app_name" {
  description = "Web app name."
  value       = azurerm_linux_web_app.this.name
}

output "principal_id" {
  description = "System-assigned managed identity principal ID."
  value       = azurerm_linux_web_app.this.identity[0].principal_id
}
