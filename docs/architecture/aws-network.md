# CloudBridge — AWS Network Architecture

## Region

All AWS resources are deployed in **ap-southeast-2 (Sydney)**.

This is the project's assigned region. Resources must not be created in other regions.  
Exception: CloudWatch Logs and WAF for global resources (e.g. CloudFront) may use us-east-1 when technically required.

---

## VPC Design

Each customer environment gets its own VPC to provide logical isolation.

### Standard VPC Layout (per customer)

```
VPC: 10.X.0.0/16
│
├── Public Subnet A  — 10.X.1.0/24  (ap-southeast-2a)
├── Public Subnet B  — 10.X.2.0/24  (ap-southeast-2b)
│   └── Internet Gateway attached
│   └── Route: 0.0.0.0/0 → IGW
│
├── Private Subnet A — 10.X.10.0/24 (ap-southeast-2a)
└── Private Subnet B — 10.X.11.0/24 (ap-southeast-2b)
    └── Route: 0.0.0.0/0 → (no NAT Gateway — cost control)
```

**Cost note:** NAT Gateways are **not** provisioned. Private subnet instances cannot reach the internet by default. This is intentional given the ₹0 budget constraint. NAT connectivity for private instances will be simulated via a NAT instance or evaluated separately.

### CIDR Allocation by Customer

| Customer | VPC CIDR | Environment |
|---|---|---|
| Customer A (ACME Technologies) | 10.10.0.0/16 | customer-a-lab |
| Customer B (BluePeak Solutions) | 10.20.0.0/16 | customer-b-lab |
| Customer C (NovaRetail) | 10.30.0.0/16 | customer-c-lab |
| Shared Services | 10.0.0.0/16 | shared-lab |

---

## Security Groups

Security Groups use **default-deny** with explicit allow rules.

### Standard Naming Convention

`{project}-{customer}-{component}-{environment}-sg`

Example: `cloudbridge-acme-web-lab-sg`

### Baseline Rules

**Web / Load Balancer SG:**
- Inbound: TCP 443 from 0.0.0.0/0 (HTTPS)
- Inbound: TCP 80 from 0.0.0.0/0 (HTTP — redirect to HTTPS)
- Outbound: All to application SG

**Application SG:**
- Inbound: from web SG only
- Outbound: TCP 5432 to database SG (PostgreSQL)
- Outbound: TCP 443 to 0.0.0.0/0 (AWS API calls)

**Database SG:**
- Inbound: TCP 5432 from application SG only
- No direct internet access

**Management / Bastion SG (if used):**
- Inbound: TCP 22 from known IP only (never 0.0.0.0/0)

---

## Network ACLs

NACLs provide a stateless secondary layer. Applied at subnet level.

Default configuration:
- Public subnets: allow inbound 443/80, ephemeral outbound (1024-65535)
- Private subnets: allow inbound from VPC CIDR, deny all external inbound

---

## IAM Structure

### Tagging Convention (mandatory on all resources)

```
Project     = CloudBridge
Environment = lab | staging | prod
Customer    = customer-a | customer-b | customer-c | shared
ManagedBy   = Terraform
Phase       = 3 (or relevant phase number)
```

### IAM Roles

Roles follow least-privilege. No `*` actions without documented justification.

Naming convention: `cloudbridge-{service}-{purpose}-role`

Example: `cloudbridge-ec2-appserver-role`

---

## Terraform Module Structure

```
terraform/aws/
├── modules/
│   ├── networking/     # VPC, subnets, IGW, route tables, NACLs
│   ├── security/       # Security Groups, NACLs
│   ├── identity/       # IAM roles, policies, instance profiles
│   └── logging/        # CloudTrail, CloudWatch Logs, S3 log bucket
└── environments/
    ├── customer-a/     # ACME Technologies — calls modules
    ├── customer-b/     # BluePeak Solutions — calls modules
    └── customer-c/     # NovaRetail — calls modules
```

---

## Deployment Status

| Component | Status | Notes |
|---|---|---|
| VPC module | 📋 Planned — Phase 3 | Terraform code not yet written |
| Security Group module | 📋 Planned — Phase 3 | |
| IAM module | 📋 Planned — Phase 3 | |
| Customer A environment | 📋 Planned — Phase 3 | |
| CloudTrail | 📋 Planned — Phase 3 | Free tier: 1 trail |

No AWS resources have been deployed. All above is design documentation for Phase 3 implementation.
