# CloudBridge

**Multi-Cloud Migration, Infrastructure Engineering & Cloud Security Platform**

A practical end-to-end lab simulating the operations of a cloud consulting and managed security engineering company — from customer onboarding through infrastructure migration, cloud security assessment, and SOC monitoring.

> **Portfolio project.** All customer environments are fictional. All infrastructure is either locally simulated or deployed in isolated lab environments. No real customer data is used.

---

## What This Project Demonstrates

| Capability | Status |
|---|---|
| Infrastructure as Code (Terraform + AWS) | 🔵 In Progress — Phase 3 |
| Local on-premises simulation (VirtualBox) | 🔵 In Progress — Phase 2 |
| Migration engineering (discovery → execution) | 🔵 In Progress — Phase 4 |
| Cloud security posture management (Prowler, Checkov) | 📋 Planned — Phase 5 |
| SOC and security monitoring (Wazuh, Splunk) | 📋 Planned — Phase 6 |
| Multi-cloud (Azure, GCP) | 📋 Planned — Phase 7 |
| Portfolio dashboard (React, GitHub Pages) | 📋 Planned — Phase 1 |

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
| ACME Technologies | Technology | On-premises → Cloud migration | AWS ap-southeast-2 |
| BluePeak Solutions | Professional Services | Cloud-to-cloud migration | AWS → Azure |
| NovaRetail | Retail | Security assessment + monitoring | AWS (existing) |

All environments are isolated and use fictional data. See `customers/` for environment profiles.

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
│   ├── customer-a/         # ACME Technologies
│   ├── customer-b/         # BluePeak Solutions
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
**Account type:** New AWS experience  
**Deployment approach:** Terraform plan-first; apply requires explicit approval  
**Cost target:** Free Tier eligible resources only

---

## Phase Roadmap

| Phase | Name | Status |
|---|---|---|
| Phase 0 | Repository assessment | ✅ Complete |
| Phase 1 | Engineering foundation + dashboard | 🔵 In Progress |
| Phase 2 | Local infrastructure simulation | 📋 Next |
| Phase 3 | AWS infrastructure engineering | 📋 Planned |
| Phase 4 | Migration engineering | 📋 Planned |
| Phase 5 | Cloud security engineering | 📋 Planned |
| Phase 6 | SOC and monitoring | 📋 Planned |
| Phase 7 | Multi-cloud expansion (Azure + GCP) | 📋 Planned |
| Phase 8 | Final portfolio and documentation | 📋 Planned |

---

## Security

This is a public repository. **No credentials, state files, or private keys are committed here.**

- `.gitignore` blocks `*.tfstate`, `.env`, `*.pem`, `*.key`, `terraform.tfvars`
- CI runs secret scanning on every push
- See [SECURITY.md](SECURITY.md) for the vulnerability disclosure process

---

## License

[MIT](LICENSE)
