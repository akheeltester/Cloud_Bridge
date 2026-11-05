# CloudBridge — Security Architecture

## Overview

CloudBridge implements security engineering across two domains:

1. **Cloud Security Posture Management (CSPM)** — scanning infrastructure configurations for misconfigurations and policy violations
2. **Security Operations (SOC)** — monitoring, detection, investigation, and response

---

## Cloud Security Posture Management

### Tools

| Tool | Purpose | Scope | Status |
|---|---|---|---|
| Prowler | AWS configuration assessment | IAM, network, storage, logging, encryption | 📋 Phase 5 |
| Checkov | Terraform IaC scanning | All Terraform files in this repo | 📋 Phase 5 |
| Trivy | Container and filesystem scanning | Docker images, filesystem configs | 📋 Phase 5 |

### Prowler Assessment Scope

Prowler assesses AWS configurations against CIS Benchmark and AWS Foundational Security Best Practices.

Key checks:
- IAM: root account MFA, access key age, unused credentials, overly permissive policies
- Network: security groups with 0.0.0.0/0 ingress, publicly accessible instances
- Storage: S3 public access, encryption at rest, versioning, logging
- Logging: CloudTrail enabled, CloudWatch Logs configured, S3 access logging
- Encryption: EBS encryption, RDS encryption, KMS key rotation

Output: JSON findings → normalised to CloudBridge finding schema

### Checkov CI Integration

Checkov runs on every pull request against all `terraform/` files.

Suppression policy:
- Suppressions require a comment explaining the business justification
- No blanket suppressions

### Finding Schema

All security findings (regardless of tool) are normalised to:

```json
{
  "finding_id": "CB-2026-001",
  "source_tool": "prowler | checkov | trivy",
  "severity": "critical | high | medium | low | info",
  "customer": "customer-a | customer-b | customer-c | platform",
  "resource_id": "aws::iam::root",
  "resource_type": "IAM",
  "title": "Short description",
  "description": "Detailed finding description",
  "remediation": "What to do to fix it",
  "references": ["https://..."],
  "status": "open | in_remediation | resolved | accepted_risk",
  "detected_at": "2026-01-01T00:00:00Z",
  "resolved_at": null
}
```

### Remediation Policy

- **Critical/High:** human review and approval required before any remediation action
- **Medium/Low:** documented in findings report; remediation at next maintenance window
- Automated remediation is **never** performed without explicit approval
- Destructive actions (delete resource, revoke access) require written approval

---

## Security Operations Centre (SOC)

### Tools

| Tool | Purpose | Deployment | Status |
|---|---|---|---|
| Wazuh | SIEM, endpoint monitoring, log aggregation | Local VM | 📋 Phase 6 |
| Splunk Free | Security dashboards, alerting | Local — 500 MB/day limit | 📋 Phase 6 |
| AWS CloudTrail | API activity logging | AWS account | 📋 Phase 3 |

### Wazuh Deployment

Wazuh is deployed locally (not in cloud) to avoid cost.

Architecture:
- Wazuh Manager: dedicated Ubuntu Server VM
- Wazuh Agents: deployed on all customer lab VMs
- Wazuh Dashboard: local browser access

Log sources:
- Authentication logs (`/var/log/auth.log`)
- System logs (`/var/log/syslog`)
- Application logs (configurable per customer)
- File integrity monitoring

### Detection Rule Categories

| Category | Examples |
|---|---|
| Authentication | Brute force, failed SSH, privilege escalation |
| Network | Port scans, unexpected outbound connections |
| File Integrity | Changes to critical system files |
| Cloud | AWS CloudTrail anomalies, API abuse |
| Application | SQL injection patterns, unusual query volumes |

### Incident Response Workflow

```
Alert triggered
      ↓
Alert classification (Critical/High/Medium/Low)
      ↓
Initial triage (automated enrichment)
      ↓
Analyst investigation
      ↓
Containment decision (requires human approval for disruptive actions)
      ↓
Evidence collection
      ↓
Root cause analysis
      ↓
Incident report
      ↓
Post-incident review
```

Response playbooks: `soc/playbooks/`

### Authorised Lab Exercises Only

Security monitoring exercises (simulated attacks, detection testing) are performed **only against systems in this lab that I own and operate**.

No attack simulations are performed against external systems, cloud provider infrastructure, or any system not explicitly in scope.

---

## IaC Security Policy

All Terraform configurations must pass Checkov before merge.

Required controls:
- S3 buckets: no public ACL, versioning enabled, logging enabled
- Security Groups: no ingress 0.0.0.0/0 on sensitive ports (22, 3306, 5432)
- IAM policies: no wildcard actions without documented justification
- Encryption: EBS encryption enabled by default, RDS encryption enabled
- Logging: CloudTrail enabled, log file validation enabled

---

## Credential Security Controls

- No credentials in code — enforced by `.gitignore` and CI secret scanning
- AWS CLI uses SSO-based authentication (temporary credentials, 12-hour expiry)
- Ansible vault used for any sensitive variables (vault password never committed)
- SSH keys generated locally, never committed, rotated per environment
