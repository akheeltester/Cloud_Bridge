# CloudBridge — Platform Architecture Overview

## Purpose

CloudBridge simulates the complete lifecycle of a cloud consulting engagement:

```
Customer Onboarding
      ↓
Infrastructure Discovery
      ↓
Migration Assessment
      ↓
Architecture Design
      ↓
Infrastructure Provisioning
      ↓
Workload Migration
      ↓
Security Assessment
      ↓
Monitoring & Incident Response
      ↓
Final Reporting
```

Each stage produces documented, reproducible artefacts that demonstrate real engineering capability.

---

## Five Engineering Layers

### Layer 1 — On-Premises Infrastructure Simulation

Simulates customer environments before migration using VirtualBox.

**Components:**
- Ubuntu Server 22.04 LTS — application server
- Ubuntu Server 22.04 LTS — database server (PostgreSQL)
- Ubuntu Desktop — employee workstation simulation
- Local file storage (NFS or Samba simulation)
- Host-only VirtualBox network for isolation

**Tools:** VirtualBox, Ansible, Bash

**Documentation:** [local-lab.md](local-lab.md)

---

### Layer 2 — Cloud Infrastructure Engineering

Designs and provisions cloud infrastructure using Terraform.

**AWS (Primary — Phase 3):**
- VPC with public/private subnet design across 2 AZs
- Internet Gateway, route tables, NACLs
- Security Groups (default-deny, explicit allow)
- IAM roles and policies (least-privilege)
- S3, CloudTrail, CloudWatch Logs
- Resource tagging convention

**Azure (Phase 7):** Virtual Networks, NSGs, Entra ID, Azure Monitor  
**GCP (Phase 7):** VPC networks, firewall rules, Cloud IAM, Cloud Logging

**Documentation:** [aws-network.md](aws-network.md)

---

### Layer 3 — Migration Engineering

A reusable workflow for discovering, planning, and executing migrations.

**Stages:**
1. Customer onboarding and scoping
2. Infrastructure discovery and inventory
3. Dependency mapping
4. Migration readiness assessment
5. Target architecture selection
6. Migration planning
7. Migration execution (simulated or actual)
8. Validation and testing
9. Rollback documentation
10. Completion reporting

**Supported scenarios:**
- On-premises → AWS
- AWS → Azure
- GCP → AWS

**Documentation:** [migration-workflow.md](migration-workflow.md)

---

### Layer 4 — Cloud Security & SOC

**Cloud Security Posture Management:**
- Prowler — AWS configuration assessment
- Checkov — Terraform IaC scanning
- Trivy — container and configuration scanning
- IAM policy analysis

**Security Operations:**
- Wazuh — SIEM, endpoint monitoring, log aggregation
- Splunk Free — security dashboards and alerting (hardware-permitting)
- Detection rules, alert classification, incident investigation
- Response playbooks

**Documentation:** [security-architecture.md](security-architecture.md)

---

### Layer 5 — Portfolio Dashboard

Public-facing read-only dashboard deployed to GitHub Pages.

**Stack:** React + Vite + TypeScript + Tailwind CSS + Lucide Icons

**Pages:**
- Overview — platform status, migration summary, security posture
- Cloud Infrastructure — AWS/Azure/GCP architecture diagrams
- Customer Environments — profiles, inventories, migration status
- Migration Center — active and completed migrations
- Security Center — Prowler and Checkov findings
- SOC Center — Wazuh/Splunk dashboards
- Automation — Terraform, Ansible, Python catalogue
- Documentation — runbooks, reports, guides

All data on the dashboard is either verified real output or clearly labelled as demonstration data.

---

## Design Principles

1. **Cost zero** — no billable cloud resources without explicit approval
2. **Local first** — simulate before deploying
3. **Security first** — no credentials in code, no public state files
4. **Honest labelling** — implemented vs. simulated vs. planned, always clear
5. **Reproducible** — another engineer should be able to recreate any component from the docs
6. **Modular** — Terraform modules reusable across customers and environments
