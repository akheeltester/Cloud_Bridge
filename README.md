# CloudBridge

**Multi-Cloud Migration, Infrastructure Engineering & Cloud Security Platform**

A practical end-to-end lab simulating the operations of a cloud consulting and managed security engineering company — from customer onboarding through infrastructure migration, cloud security assessment, and SOC monitoring.

> **Portfolio project.** All customer environments are fictional. All infrastructure is either locally simulated or deployed in isolated lab environments. No real customer data is used.

---

## What This Project Demonstrates

| Capability | Status |
|---|---|
| Portfolio dashboard (React, GitHub Pages) | ✅ Implemented — live |
| Local on-premises / Docker simulation | ✅ Implemented — customer workloads modeled |
| AWS demo deployment (EC2 + S3 + HTTPS) | ✅ Deployed — BluePeak demo verified healthy |
| Infrastructure as Code (Terraform + AWS landing zone) | 🔵 In Progress — Phase 3 |
| Migration engineering (discovery → execution) | 🔵 In Progress — Phase 4 |
| Multi-cloud (Azure, GCP) | 🔵 In Progress — Phase 7 |
| Cloud security posture management (Prowler, Checkov) | 📋 Planned — Phase 5 |
| SOC and security monitoring (Wazuh, Splunk) | 📋 Planned — Phase 6 |

**Status legend:** ✅ Implemented · 🧪 Tested locally · 🔵 In Progress · 📋 Planned

---

## Platform Architecture

CloudBridge is built across five engineering layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 5 — Portfolio Dashboard (React + GitHub Pages)        │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 — Cloud Security & SOC                              │
│  Prowler · Checkov · Trivy · Wazuh · Splunk Free            │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Migration Engineering                             │
│  Discovery → Assessment → Planning → Execution → Validation  │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Cloud Infrastructure                              │
│  AWS (primary) · Azure (Phase 7) · GCP (Phase 7)            │
│  Terraform modules · IAM · VPC · Security Groups             │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — On-Premises Simulation                            │
│  VirtualBox · Ubuntu Server · PostgreSQL · Ansible           │
└─────────────────────────────────────────────────────────────┘
```

---

## Simulated Customer Environments

| Customer | Industry | Scenario | Cloud Target |
|---|---|---|---|
| ACME Technologies (customer-a) | Technology | On-premises → Cloud migration | GCP Cloud Run (deployed) |
| BluePeak Solutions (customer-b) | Professional Services | Cloud-to-cloud migration | AWS ap-southeast-2 (deployed) |
| NovaRetail (customer-c) | Retail | Security assessment + monitoring | Azure (Phase 7) |

All environments are isolated and use fictional data. See `customers/` for environment profiles.

> The customer-to-cloud mapping above reflects the current multi-cloud goal (one workload per cloud). The original engagement profiles in `customers/*/README.md` describe the initial scenario design and are being reconciled with this mapping in Phase 7.

---

## Repository Structure

```
cloudbridge/
├── .github/workflows/      # CI/CD — Terraform validation, security scans, dashboard deploy
├── .kiro/steering/         # Kiro IDE agent instructions
├── ansible/                # Configuration management
│   ├── inventory/          # Customer host inventories
│   └── playbooks/          # Provisioning and configuration playbooks
├── customers/              # Per-customer environment profiles
│   ├── customer-a/         # ACME Technologies (Jigsaw app)
│   ├── customer-b/         # BluePeak Solutions (FastAPI demo)
│   └── customer-c/         # NovaRetail
├── dashboard/              # React + Vite portfolio dashboard (Phase 1)
├── docs/
│   ├── architecture/       # System design documents
│   ├── migration-runbooks/ # Step-by-step migration procedures
│   ├── security-reports/   # Sanitized security assessment outputs
│   └── setup/              # Environment setup guides
├── migration/              # Migration toolkit
│   ├── discovery/          # Infrastructure discovery scripts
│   ├── plans/              # Migration plans per customer
│   └── reports/            # Migration completion reports
├── scripts/                # Utility scripts (setup, validation, cleanup)
├── security/               # Security tooling
│   ├── checkov/            # IaC scanning configs and baselines
│   ├── policies/           # IAM and SCPs
│   ├── prowler/            # Cloud configuration assessments
│   └── scripts/            # Security automation
├── soc/                    # Security Operations Center
│   ├── wazuh/              # SIEM configuration and rules
│   ├── splunk/             # Splunk configuration
│   └── detection-rules/    # Custom detection logic
└── terraform/              # Infrastructure as Code
    ├── aws/
    │   ├── modules/        # Reusable modules (network, security, identity, logging)
    │   └── environments/   # Per-customer environment configurations
    ├── azure/
    └── gcp/
```

---

## Technology Stack

**Infrastructure as Code:** Terraform · OpenTofu
**Cloud Providers:** AWS (primary) · Azure · GCP
**Configuration Management:** Ansible · Python · Bash
**Local Infrastructure:** VirtualBox · Ubuntu Server · Docker
**Cloud Security:** Prowler · Checkov · Trivy
**Security Monitoring:** Wazuh · Splunk Free · AWS CloudTrail
**Dashboard:** React · Vite · TypeScript · Tailwind CSS · GitHub Pages
**CI/CD:** GitHub Actions

---

## AWS Configuration

**Region:** ap-southeast-2 (Sydney)
**Deployment approach:** Terraform plan-first; apply requires explicit approval
**Cost target:** Free Tier eligible resources only

The live BluePeak demo runs on EC2 with a private S3 bucket and Caddy HTTPS at
`https://cloudbridge-bluepeak.duckdns.org`. It uses an EC2 instance role (no static keys).

---

## Phase Roadmap

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Repository assessment | ✅ Complete |
| Phase 1 | Engineering foundation + dashboard | ✅ Complete |
| Phase 2 | Local infrastructure simulation | ✅ Complete |
| Phase 3 | AWS infrastructure engineering | 🔵 In Progress — demo deployed; landing zone planned |
| Phase 4 | Migration engineering | 🔵 In Progress |
| Phase 5 | Cloud security engineering | 📋 Planned |
| Phase 6 | SOC and monitoring | 📋 Planned |
| Phase 7 | Multi-cloud expansion (Azure + GCP) | 🔵 In Progress |
| Phase 8 | Final portfolio and documentation | 🔵 In Progress |

---

## Security

This is a public repository. **No credentials, state files, or private keys are committed here.**

- `.gitignore` blocks `*.tfstate`, `.env`, `*.pem`, `*.key`, `terraform.tfvars`
- CI runs secret scanning on every push
- See [SECURITY.md](SECURITY.md) for the vulnerability disclosure process

---

## License

[MIT](LICENSE)
