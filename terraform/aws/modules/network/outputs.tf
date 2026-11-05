# CloudBridge — AWS Networking Module Outputs
# Phase 3: Full implementation pending

output "vpc_id" {
  description = "ID of the created VPC"
  value       = null # Phase 3: will reference aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = [] # Phase 3: will reference aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = [] # Phase 3: will reference aws_subnet.private[*].id
}
