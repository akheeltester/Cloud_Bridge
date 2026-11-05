# CloudBridge — Lab Environment Variables

variable "aws_region" {
  description = "AWS region for all resources (project-assigned region)"
  type        = string
  default     = "ap-southeast-2"
}

variable "aws_profile" {
  description = "AWS CLI profile name for authentication"
  type        = string
  default     = "cloudbridge"
}

variable "environment" {
  description = "Deployment environment label"
  type        = string
  default     = "lab"
}
