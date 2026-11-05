# CloudBridge — Lab Environment Root Configuration
# Phase 3: Full implementation pending
#
# This environment calls shared modules to provision:
#   - Customer A (ACME Technologies) network: 10.10.0.0/16
#   - Customer B (BluePeak Solutions) network: 10.20.0.0/16
#   - Customer C (NovaRetail) network: 10.30.0.0/16
#
# Status: Skeleton — Phase 3
# Cost note: NO resources are deployed from this file yet.
# terraform apply requires explicit approval (see CONTRIBUTING.md).

terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend: local state for lab (not committed — see .gitignore)
  # Phase 3 will evaluate remote state (S3 + DynamoDB lock) if within Free Tier.
  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = {
      Project   = "CloudBridge"
      ManagedBy = "Terraform"
    }
  }
}
