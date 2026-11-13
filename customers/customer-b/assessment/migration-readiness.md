# Migration Readiness Assessment

**Current status:** Local simulation validated; production readiness not
established.

## Evidence-based readiness

| Area | Local evidence | Production conclusion |
|---|---|---|
| Frontend and API | Browser and proxy requests succeeded | Source workload not verified |
| PostgreSQL | Local 14.24 schema, 3 products, 0 orders; 8,973,659-byte database | Actual source version, volume, extensions, and data unknown |
| Object storage | Private local MinIO behavior checked; 2 test objects totaling 114 bytes | Actual S3 volume, policies, and settings unknown |
| Network | Local `10.203.20.0/24` service network inspected | AWS topology and connectivity unknown |
| Security | Local port, file, and anonymous storage checks performed | AWS identity, security groups, encryption, and audit posture unknown |
| Backup and recovery | Persistent local volumes exist | Recovery objectives and production backups unknown |
| Azure target | No Azure resources provisioned | Design and compatibility decisions pending |

## Required discovery before migration planning is baselined

- Obtain authorized AWS account inventory and region confirmation.
- Confirm VM/OS/runtime specifications and application deployment artifacts.
- Measure database size, extensions, roles, write volume, growth, backup status,
  and recovery objectives.
- Inventory S3 objects, total bytes, object metadata, versioning, encryption,
  lifecycle, and access policies.
- Confirm network paths, CIDRs, DNS records/TTL, TLS, identity flows, and
  outbound dependencies.
- Establish business RTO/RPO, downtime tolerance, maintenance window, and
  acceptance criteria.
- Determine data classification, retention, access control, and compliance
  obligations.

## Assessment position

This simulation is useful for demonstrating application routes, local service
communication, storage behavior, and a repeatable test path. It does not
provide evidence about a real AWS estate and is insufficient on its own to
approve a production migration, Azure sizing, cost estimate, or cutover plan.
