# CloudBridge — Engineering Standards Steering

## Cost Controls (MANDATORY)

Personal cloud budget: ₹0.

- Never create billable resources without explicit approval.
- Do NOT launch EC2 instances, RDS, NAT Gateways, GuardDuty, Security Hub, Config without cost review.
- `terraform apply` and `terraform destroy` require explicit approval before execution.
- `terraform plan` and `terraform validate` are safe and can run freely.
- Always verify Free Tier eligibility in ap-southeast-2 before any deployment.

## Credential Security (MANDATORY)

- Never hardcode credentials in any file.
- Never print or log AWS access keys, secret keys, or session tokens.
- Never commit `.env`, `terraform.tfvars` with secrets, or `terraform.tfstate`.
- Use IAM roles and temporary credentials where possible.
- Review git diff before every push.
- The `.gitignore` must cover: `*.tfstate`, `*.tfstate.backup`, `.env`, `*.pem`, `*.key`, `credentials`.

## Infrastructure Safety

- Terraform: use modules, separate environments per customer.
- All resources must have tags: Project=CloudBridge, Environment, Customer, ManagedBy=Terraform.
- Security Groups: default-deny, explicit allow only.
- IAM: least-privilege, no `*` actions without justification.
- No public S3 buckets unless explicitly reviewed.
- Encryption at rest and in transit by default.

## Code Quality

- Python: type annotations, docstrings, error handling, no bare `except`.
- Terraform: `terraform fmt` before commit, `terraform validate` in CI.
- Shell scripts: `#!/bin/bash`, `set -euo pipefail`, quote variables.
- All files: consistent naming — snake_case for Python/Bash, kebab-case for directories.
- No TODO without an associated issue or phase reference.

## Security Automation Rules

- NEVER perform automatic destructive remediation.
- Security group changes, resource deletion, access revocation require human approval.
- Findings must be classified (Critical/High/Medium/Low/Info) before any action.

## Git Workflow

- Default branch: `main`
- Never push credentials, state files, or private keys.
- Commit messages: `[PHASE-X] short description`
- Branch naming: `phase-X/feature-name`

## Phase Gate Rule

Do not start a new phase until the previous phase is reviewed and approved.
Document what was implemented, tested, and what remains before requesting approval.

## AWS Agent Toolkit Integration

- AWS profile name: `cloudbridge` (to be configured)
- Region: `ap-southeast-2`
- MCP server: `aws-mcp` (configured via Agent Toolkit)
- For any AWS task, first use `aws___search_documentation` with topic `agent_skills`
  and load the matching skill with `aws___retrieve_skill`.

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS
using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions
take precedence.

## AWS Context

**Terminology:**
- Say "project" instead of "account"
- Say "team member" instead of "IAM user"
- Say "AWS Settings" for management at settings.aws.com
- Say "selected Region" (not "home Region") — this project's region is **ap-southeast-2**

**Key Constraints:**
- All Regional resources MUST be created in ap-southeast-2
- WAF/CloudWatch Logs for global resources may use us-east-1 only when required
- MUST NOT use Lambda@Edge, CloudFormation StackSets, or cross-Region actions
- MUST NOT use cross-Region replication (DynamoDB/S3/RDS), multi-Region KMS keys
- MUST NOT use Route 53 cross-Region routing policies
- CloudFront is global and its actions ARE allowed in us-east-1
- IAM permissions for human access are managed by AWS — don't assign roles to team members unless absolutely necessary
- If sudden "Access Denied" errors occur, check spend limit in AWS Settings > Billing

**Service Availability:**
- If a service isn't working: run `aws freetier get-account-plan-state`
- FREE tier: check https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html#supported-services-free-tier
- PAID tier: check the paid tier supported services list

**For any AWS task:** first call `aws___search_documentation` with topic `agent_skills`
and load the matching skill with `aws___retrieve_skill`. Do this even when you believe
you know the answer. Skip only for work that does not involve AWS.

**Help level:** MEDIUM — ask up to two clarifying questions per task if there's ambiguity
or a potential issue; do not repeat dismissed questions.
<!-- END AWS Agent Toolkit rules -->
