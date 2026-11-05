# CloudBridge — AWS Networking Module
# Phase 3: Full implementation pending
#
# This module will provision:
#   - VPC with configurable CIDR
#   - Public subnets (2 AZs)
#   - Private subnets (2 AZs)
#   - Internet Gateway
#   - Route tables
#   - Network ACLs
#
# Status: Skeleton — Phase 3

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
