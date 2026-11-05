# CloudBridge — AWS Networking Module Variables
# Phase 3: Full implementation pending

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "vpc_cidr must be a valid CIDR block."
  }
}

variable "customer_id" {
  description = "Customer identifier (e.g. customer-a)"
  type        = string
}

variable "environment" {
  description = "Deployment environment (e.g. lab)"
  type        = string
  default     = "lab"

  validation {
    condition     = contains(["lab", "staging", "prod"], var.environment)
    error_message = "environment must be one of: lab, staging, prod."
  }
}

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "ap-southeast-2"
}

variable "availability_zones" {
  description = "List of availability zones to use (minimum 2)"
  type        = list(string)
  default     = ["ap-southeast-2a", "ap-southeast-2b"]
}

variable "tags" {
  description = "Additional resource tags"
  type        = map(string)
  default     = {}
}
