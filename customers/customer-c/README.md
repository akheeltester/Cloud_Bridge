# Customer C — NovaRetail

> **Fictional customer.** All data in this directory is simulated for portfolio demonstration purposes.

---

## Company Profile

| Field | Value |
|---|---|
| Company | NovaRetail |
| Industry | Retail / E-commerce |
| Size | ~200 employees |
| Existing cloud | AWS ap-southeast-2 |
| Engagement type | Cloud security assessment + monitoring |
| Goal | Improve security posture, establish SOC capability |

---

## Engagement Summary

NovaRetail already runs their e-commerce platform on AWS but has no formal security assessment or monitoring in place. They need a cloud security posture review and a basic SOC capability to detect and respond to incidents.

**No migration** is required — this is a security and monitoring engagement.

---

## Source Infrastructure (Simulated AWS)

| Component | AWS Service | Notes |
|---|---|---|
| E-commerce application | EC2 (multiple instances) | Simulated |
| Database | RDS PostgreSQL | Simulated |
| Static assets | S3 bucket | Public read — intentional misconfiguration for demo |
| CDN | CloudFront | Simulated |
| Load balancer | ALB | Simulated |
| Network | VPC 10.30.0.0/16 | ap-southeast-2 |

*These represent a simulated AWS environment, not real deployed infrastructure.*

---

## Security Assessment Scope

### Phase 5 — CSPM Assessment

| Domain | Tool | Key Checks |
|---|---|---|
| IAM | Prowler | Root MFA, unused credentials, overly permissive policies |
| Network | Prowler | SGs with 0.0.0.0/0, public instances |
| Storage | Prowler | S3 public access, encryption, logging |
| Logging | Prowler | CloudTrail enabled, log validation |
| Encryption | Prowler | EBS, RDS, S3 encryption at rest |
| IaC | Checkov | Terraform misconfigurations |

**Known intentional finding (demo):** S3 bucket with public read access — used to demonstrate a real finding and remediation workflow.

### Phase 6 — SOC Monitoring

| Capability | Tool | Status |
|---|---|---|
| Endpoint monitoring | Wazuh agents on lab VMs | 📋 Phase 6 |
| Authentication monitoring | Wazuh — auth.log rules | 📋 Phase 6 |
| CloudTrail ingestion | Wazuh AWS module | 📋 Phase 6 |
| Dashboards | Wazuh + Splunk Free | 📋 Phase 6 |
| Detection rules | Custom Wazuh rules | 📋 Phase 6 |

---

## Simulated Findings (for dashboard demonstration)

These are **planned demonstration findings** — they will be generated from actual tool runs against the local simulation, not fabricated.

| Finding ID | Severity | Title | Status |
|---|---|---|---|
| CB-C-001 | High | S3 bucket public read access enabled | Open |
| CB-C-002 | Medium | CloudTrail not enabled in all regions | Open |
| CB-C-003 | Medium | Security group allows SSH from 0.0.0.0/0 | Open |
| CB-C-004 | Low | S3 bucket versioning not enabled | Open |

*These findings are placeholders. Real findings will be generated in Phase 5 and clearly labelled with their source tool and scan date.*

---

## Migration Status

No migration. Security engagement only.

| Stage | Status | Notes |
|---|---|---|
| Customer onboarding | ✅ Complete | Profile documented |
| Security assessment (Prowler) | 📋 Planned — Phase 5 | |
| IaC scan (Checkov) | 📋 Planned — Phase 5 | |
| Finding normalisation | 📋 Planned — Phase 5 | |
| Remediation recommendations | 📋 Planned — Phase 5 | |
| Wazuh deployment | 📋 Planned — Phase 6 | |
| Detection rules | 📋 Planned — Phase 6 | |
| Incident response playbook | 📋 Planned — Phase 6 | |

---

## Directory Structure

```
customers/customer-c/
├── README.md                    # This file
├── onboarding/
├── security-assessment/         # Prowler and Checkov outputs (Phase 5)
├── soc/                         # Wazuh and detection rules (Phase 6)
└── reports/                     # Security reports
```
