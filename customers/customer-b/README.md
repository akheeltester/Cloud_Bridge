# Customer B — BluePeak Solutions

> **Fictional customer.** All data in this directory is simulated for portfolio demonstration purposes.

---

## Company Profile

| Field | Value |
|---|---|
| Company | BluePeak Solutions |
| Industry | Professional Services / Consulting |
| Size | ~120 employees |
| Existing cloud | AWS ap-southeast-2 |
| Engagement type | Cloud-to-cloud migration |
| Target cloud | Microsoft Azure (australiaeast) |

---

## Engagement Summary

BluePeak Solutions currently runs their web application and database on AWS and wants to migrate to Azure due to a new enterprise agreement with Microsoft. This is a cloud-to-cloud migration scenario.

**Migration scenario:** AWS → Azure

---

## Source Infrastructure (AWS)

| Component | AWS Service | Notes |
|---|---|---|
| Web application | EC2 (Ubuntu Server) | Nginx + Python backend |
| Database | Self-managed PostgreSQL on EC2 | Not using RDS |
| File storage | S3 bucket | Application uploads |
| Network | VPC 10.20.0.0/16 | ap-southeast-2 |
| DNS | Route 53 | app.bluepeaksolutions.example |

*Note: Source AWS infrastructure is simulated — no actual BluePeak AWS account exists.*

---

## Local Simulation (Phase 2)

For development and testing, the source AWS environment is simulated locally using VirtualBox:

| Component | VM | Simulated IP |
|---|---|---|
| Web application server | Ubuntu Server 22.04 | 192.168.57.30 |
| Database server | Ubuntu Server 22.04, PostgreSQL | 192.168.57.31 |
| Workstation | Ubuntu Desktop | 192.168.57.20 |

**Local network:** `192.168.57.0/24` (VirtualBox host-only)

---

## Target Architecture (Azure)

| Component | Azure Service | Notes |
|---|---|---|
| Web application | Azure Virtual Machine (B1s) | |
| Database | Azure Database for PostgreSQL | Flexible Server |
| File storage | Azure Blob Storage | Private container |
| Network | Virtual Network 10.21.0.0/16 | australiaeast |
| DNS | Azure DNS Zone | |
| Identity | Entra ID | Managed access |

**Target region:** australiaeast (aligned with Microsoft agreement)

*Azure infrastructure planned for Phase 7.*

---

## Migration Status

| Stage | Status | Notes |
|---|---|---|
| Customer onboarding | ✅ Complete | Profile documented |
| Source infrastructure discovery | 📋 Planned — Phase 4 | Simulated locally |
| AWS asset inventory | 📋 Planned — Phase 4 | |
| Azure target design | 📋 Planned — Phase 7 | |
| Data migration plan (pg_dump → Azure) | 📋 Planned — Phase 4 | |
| Migration execution | 📋 Planned — Phase 7 | Requires Azure setup |
| DNS cutover simulation | 📋 Planned — Phase 7 | |
| Validation | 📋 Planned — Phase 7 | |

---

## Directory Structure

```
customers/customer-b/
├── README.md                    # This file
├── onboarding/
├── inventory/
├── migration-plan/
├── terraform/                   # Azure Terraform variables (Phase 7)
└── ansible/
```

---

## Security Notes

- No real BluePeak Solutions data anywhere in this repository
- The simulated "AWS environment" exists only as local VirtualBox VMs
- Azure credentials for Phase 7 will use temporary service principal credentials
