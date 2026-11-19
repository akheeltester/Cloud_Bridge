output "app_url" {
  description = "Public HTTP URL of NovaRetail."
  value       = module.novaretail.app_url
}

output "public_ip" {
  description = "VM public IPv4."
  value       = module.novaretail.public_ip
}

output "ssh_command" {
  description = "SSH into the VM."
  value       = module.novaretail.ssh_command
}

output "image" {
  description = "Deployed image reference."
  value       = local.image
}
