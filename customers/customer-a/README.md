# Customer A — ACME Technologies

> **Fictional customer.** All data in this directory is simulated for portfolio demonstration purposes.

---

## Company Profile

| Field | Value |
|---|---|
| Company | ACME Technologies |
| Industry | Technology / Software |
| Size | ~50 employees |
| Location | Simulated — on-premises data centre |
| Engagement type | Full on-premises to cloud migration |
| Target cloud | AWS ap-southeast-2 |

---

## Engagement Summary

ACME Technologies operates a small on-premises infrastructure serving an internal web application and employee workstations. They want to migrate to AWS to reduce hardware maintenance costs and improve availability.

**Migration scenario:** On-premises → AWS

---

## Source Infrastructure (On-Premises)

| Component | Specification | Simulated IP |
|---|---|---|
| Employee workstation | Ubuntu Desktop 22.04 | 192.168.56.20 |
| Application server | Ubuntu Server 22.04, Node.js app | 192.168.56.30 |
| Database server | Ubuntu Server 22.04, PostgreSQL 14 | 192.168.56.31 |
| File storage | Samba share on app server | 192.168.56.30 |
| Local DNS | /etc/hosts resolution | — |

**Local network:** `192.168.56.0/24` (VirtualBox host-only)

---

## Application Stack

| Component | Technology | Version |
|---|---|---|
| Web application | Node.js / Python Flask | TBD |
| Database | PostgreSQL | 14 |
| File storage | Samba (SMB) | — |
| Authentication | Local Linux accounts | — |

---

## Target Architecture (AWS)

| Component | AWS Service | Notes |
|---|---|---|
| Application server | EC2 t3.micro | Free tier eligible |
| Database | RDS PostgreSQL or self-managed EC2 | Cost review required |
| File storage | S3 bucket | Private, encrypted |
| Network | VPC 10.10.0.0/16 | 2 AZs |
| DNS | Route 53 (if budget permits) or EC2 /etc/hosts | |

**Target region:** ap-southeast-2

---

## Migration Status

| Stage | Status | Notes |
|---|---|---|
| Customer onboarding | ✅ Complete | Profile documented |
| Infrastructure discovery | 📋 Planned — Phase 4 | Requires VMs to be running |
| Asset inventory | 📋 Planned — Phase 4 | |
| Dependency mapping | 📋 Planned — Phase 4 | |
| Readiness assessment | 📋 Planned — Phase 4 | |
| Target architecture | 📋 Planned — Phase 3 | VPC design documented |
| Migration planning | 📋 Planned — Phase 4 | |
| Migration execution | 📋 Planned — Phase 4 | Requires approval |
| Validation | 📋 Planned — Phase 4 | |
| Final report | 📋 Planned — Phase 4 | |

---

## Directory Structure

```
customers/customer-a/
├── README.md                    # This file
├── onboarding/                  # Scoping and requirements documents
├── inventory/                   # Asset inventory outputs
├── migration-plan/              # Migration plan and runbooks
├── terraform/                   # Customer-specific Terraform variables
└── ansible/                     # Customer-specific Ansible inventory
```

---

## Security Notes

- No real ACME Technologies data exists anywhere in this repository
- All IP addresses are RFC 1918 private ranges, not publicly routable
- SSH keys for lab VMs are generated locally and never committed
