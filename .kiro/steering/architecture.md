# CloudBridge — Architecture Steering

## Five Engineering Layers

1. **On-Premises Simulation** — VirtualBox VMs, customer network segments, local services
2. **Cloud Infrastructure** — Terraform modules for AWS (then Azure, GCP)
3. **Migration Engineering** — Discovery → Assessment → Planning → Execution → Validation
4. **Cloud Security & SOC** — Prowler, Checkov, Trivy, Wazuh, Splunk Free
5. **Portfolio Dashboard** — React + Vite + TypeScript + Tailwind, hosted on GitHub Pages

## Repository Root

`/home/akheel/Desktop/C-Loud/multicloud-lab/`

## Current Structure (Phase 0 baseline)

```
multicloud-lab/
├── ansible/
│   ├── inventory/       (empty)
│   └── playbooks/       (empty)
├── docs/
│   ├── architecture/    (empty)
│   └── runbooks/        (empty)
├── migration/
│   ├── discovery/       (empty)
│   ├── plans/           (empty)
│   └── reports/         (empty)
├── scripts/             (empty)
├── security/
│   ├── checkov/         (empty)
│   ├── policies/        (empty)
│   ├── prowler/         (empty)
│   └── scripts/         (empty)
└── terraform/
    ├── aws/
    │   ├── environments/lab/   (empty)
    │   └── modules/network/    (empty)
    ├── azure/           (empty)
    └── gcp/             (empty)
```

## Target Repository Structure

See PART 4 of the master spec. Key additions needed:
- `dashboard/` — React frontend
- `infrastructure/` — reorganized Terraform + Ansible
- `customers/` — per-customer configs
- `soc/` — Wazuh, Splunk, detection rules
- `automation/` — Python, Bash
- `database/` — schema and migrations
- `tests/` — unit, integration, infrastructure, security
- `.github/workflows/` — CI/CD

## AWS Architecture

**Region:** ap-southeast-2 (Sydney)  
**Account type:** New AWS experience (project-based, SSO auth)

Network design (per environment):
- VPC with CIDR /16
- Public subnets (2 AZs) for load balancers/NAT
- Private subnets (2 AZs) for compute and data
- Internet Gateway
- Security Groups with least-privilege rules
- Network ACLs as secondary layer
- Resource tagging: Project, Environment, Customer, ManagedBy

## VirtualBox Lab Network

| Component | Address |
|---|---|
| Kali host (management) | 192.168.56.10 |
| Customer A — workstation | 192.168.56.20 |
| Customer A — app server | 192.168.56.30 |
| Customer A — database | 192.168.56.31 |
| Customer B — workstation | 192.168.57.20 |

Host-only adapter for isolation. NAT adapter only for package downloads.
