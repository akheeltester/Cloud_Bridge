# Security Assessment

**Evidence scope:** Static review and local-only checks of the BluePeak
simulation. This is not a production penetration test or an AWS account audit.

## Controls observed

- The local `.env` file is Git-ignored and was created with file mode `0600`.
  Secret values were not printed or committed.
- Database and app ports are not published to the host.
- Nginx and MinIO host bindings use `127.0.0.1`.
- The app runs as a non-root user in its container.
- PostgreSQL and MinIO data persist in project-specific named volumes.
- Database credentials are required from environment variables; a missing
  password fails closed.
- Uploads are constrained to 10 MiB and an allowlist with extension, declared
  content-type, and basic signature checks.
- Bucket creation and uploads do not configure public ACLs or policies.
- Anonymous object retrieval and bucket listing were denied with HTTP 403 in
  the local MinIO simulation.
- The frontend uses text-only DOM rendering for API-provided values.

## Findings and residual risks

1. **MinIO root credential reuse:** The Compose configuration passes MinIO root
   credentials to the application. This provides more authority than the app
   needs. Use a dedicated bucket-scoped account before non-lab use.
2. **No application authentication:** Local API routes are unauthenticated.
   The localhost binding limits this simulation's host exposure but does not
   establish production identity or authorization controls.
3. **No TLS:** Local browser-to-Nginx and service-to-service traffic use HTTP.
   This is limited to the local lab; production transport security is not
   represented.
4. **Mutable MinIO image tag:** `minio/minio:latest` is not a reproducible
   supply-chain reference. Pin and review an immutable image version.
5. **No malware scanning or comprehensive content parsing:** File signatures
   provide a basic check only. Add appropriate scanning and content controls
   before accepting real user files.
6. **No production backup, audit, or retention evidence:** Local named volumes
   provide persistence, not a verified backup, recovery, or compliance design.

## Scope limitation

No real BluePeak credentials, customer files, AWS policies, or cloud resources
were available or used. This report must not be interpreted as certification
of an actual source environment.
