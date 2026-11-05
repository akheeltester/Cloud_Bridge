# CloudBridge — Migration Engineering Workflow

## Overview

CloudBridge implements a structured 10-stage migration workflow modelled on real cloud consulting engagements. Every customer migration follows this process regardless of source or destination.

---

## Migration Scenarios Supported

| Scenario | Status |
|---|---|
| On-premises → AWS | 📋 Planned — Phase 4 |
| AWS → Azure | 📋 Planned — Phase 4 |
| GCP → AWS | 📋 Planned — Phase 4 |
| AWS → AWS (region/account) | 📋 Planned — Phase 4 |

---

## Workflow Stages

### Stage 1 — Customer Onboarding

**Objective:** Understand the customer environment, constraints, and objectives.

Deliverables:
- Customer profile document
- Scope of migration agreement
- Access requirements (read-only to source systems)
- Budget and timeline constraints

Artifacts: `customers/{customer-id}/onboarding/`

---

### Stage 2 — Infrastructure Discovery

**Objective:** Enumerate all assets in the source environment.

Activities:
- Run discovery scripts against source hosts
- Identify operating systems, versions, patch levels
- Enumerate running services and open ports
- Identify installed applications and versions
- Map network interfaces and connectivity

Tools: Python scripts, Nmap (authorised), Ansible facts gathering

Artifacts: `migration/discovery/{customer-id}/`

---

### Stage 3 — Asset Inventory

**Objective:** Produce a structured, queryable inventory of all discovered assets.

Output format: JSON + CSV (stored in PostgreSQL for querying)

Fields per asset:
- Asset ID, hostname, IP address
- OS family, version, kernel
- CPU, RAM, disk
- Network interfaces
- Services and ports
- Applications installed
- Last seen timestamp

Artifacts: `migration/inventory/{customer-id}/`

---

### Stage 4 — Dependency Mapping

**Objective:** Identify dependencies between services to prevent migration breakage.

Activities:
- Map application → database connections
- Map application → external service dependencies
- Map authentication dependencies (LDAP, AD)
- Map storage dependencies (NFS, Samba, SAN)
- Identify hard-coded IPs or hostnames

Output: Dependency graph (JSON + diagram)

---

### Stage 5 — Migration Readiness Assessment

**Objective:** Evaluate whether the environment is ready to migrate and identify blockers.

Assessment dimensions:
- Operating system compatibility with target cloud
- Application cloud-readiness (12-factor compliance indicators)
- Database engine compatibility
- Network port/protocol compatibility
- License portability
- Security posture baseline

Output: Readiness report with RAG (Red/Amber/Green) status per component

Artifacts: `migration/assessment/{customer-id}/readiness-report.md`

---

### Stage 6 — Target Architecture Selection

**Objective:** Design the cloud target state.

Decisions:
- Compute: EC2 instance type sizing
- Database: RDS vs self-managed, engine version
- Storage: EBS, EFS, S3
- Network: VPC CIDR, subnet design, security groups
- IAM: roles and policies required

Output: Target architecture document + Terraform plan

---

### Stage 7 — Migration Planning

**Objective:** Produce a sequenced, reversible migration plan.

Plan components:
- Migration sequence (which services move first)
- Maintenance window requirements
- Data migration method (rsync, pg_dump, AWS DMS simulation)
- DNS cutover plan
- Rollback triggers and procedure
- Test acceptance criteria

Artifacts: `migration/plans/{customer-id}/migration-plan.md`

---

### Stage 8 — Migration Execution

**Objective:** Execute the migration according to the plan.

Activities:
- Provision target infrastructure (Terraform apply — requires approval)
- Configure instances (Ansible)
- Transfer application code
- Migrate database (pg_dump → restore or DMS equivalent)
- Transfer file storage
- Update configuration files (endpoints, connection strings)

This stage requires explicit approval before any cloud resource creation.

---

### Stage 9 — Validation and Testing

**Objective:** Confirm the migrated workload operates correctly on the target.

Validation checks:
- Application health endpoints respond
- Database connectivity confirmed
- Data integrity check (row counts, checksums)
- Performance baseline comparison
- Security group rules validated
- Logging confirmed active

Artifacts: `migration/validation/{customer-id}/validation-report.md`

---

### Stage 10 — Rollback and Completion

**Objective:** Document rollback capability and produce the final migration report.

Rollback procedure:
- DNS revert to source
- Source infrastructure kept running until validation passes
- Data rollback procedure documented per service

Final report includes:
- Migration timeline
- Issues encountered and resolutions
- Post-migration architecture diagram
- Recommendations for ongoing operations

Artifacts: `migration/reports/{customer-id}/final-report.md`

---

## Artefact Directory Structure

```
migration/
├── discovery/
│   ├── customer-a/
│   └── customer-b/
├── inventory/
│   ├── customer-a/
│   └── customer-b/
├── assessment/
│   ├── customer-a/
│   └── customer-b/
├── planning/
│   ├── customer-a/
│   └── customer-b/
├── execution/
│   ├── customer-a/
│   └── customer-b/
├── validation/
│   ├── customer-a/
│   └── customer-b/
├── rollback/
│   ├── customer-a/
│   └── customer-b/
└── reports/
    ├── customer-a/
    └── customer-b/
```
