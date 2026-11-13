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

## Local Simulation (Docker Compose)

The BluePeak source workload is represented by the Docker Compose configuration in
[`docker/`](./docker/). This is a local simulation, not a deployed AWS environment.

| Service | Role | Local access |
|---|---|---|
| `webserver` | Nginx frontend and `/api/` reverse proxy | `127.0.0.1:8081` |
| `app` | FastAPI backend | Docker network only, `app:8000`; reached through Nginx |
| `database` | PostgreSQL 14 | Docker network only, `database:5432` |
| `minio` | S3-compatible object storage simulation | `127.0.0.1:19000` (API), `127.0.0.1:19001` (console) |

The services use the dedicated `10.203.20.0/24` Docker network. PostgreSQL data
and MinIO data use named volumes. The Nginx `/api/` location forwards API requests
to the `app` service while serving the static frontend at `/`. The API has no
host-published port. The four BluePeak services were started for local
validation on 2026-11-11 and were healthy at the time of the checks. This is
not an AWS deployment.

The API also provides `/api/health`, `/api/uploads`, and `POST /api/uploads`.
Uploads are limited to 10 MiB and accepted only for PDF, PNG, JPEG, TXT, and CSV
files whose extension, content type, and basic file signature agree. Objects are
stored in the private-by-default `bluepeak-uploads` MinIO bucket using randomized
keys; the application does not set public ACLs or policies. MinIO connection
settings are passed to the app through environment variables, with its local
endpoint at `http://minio:9000`. The app receives its S3 access key and secret
from the MinIO root credential variables, not from separate credentials. The
bucket is initialized idempotently when listing or uploading objects. The
combined health endpoint reports API, PostgreSQL, and MinIO status and returns
HTTP 503 if either dependency is unavailable.

The static frontend displays service health, product and order tables, and
uploaded-object metadata. It calls the API through Nginx using same-origin
`/api/` paths, validates file selection for user feedback, and uses text-only DOM
updates for API-provided content. Server-side validation remains authoritative.

Run the local automated tests from `customers/customer-b/docker` with:

```sh
PYTHONPATH=. python3 -m unittest discover -s tests -v
```

These tests mock PostgreSQL and MinIO and do not require starting containers.
Nginx tests check configuration directives statically. During Stage 8,
`nginx -t` also passed in the running BluePeak Nginx container, and live proxy
requests succeeded.

### Local validation baseline

Measured from the running local simulation on 2026-11-11:

| Measurement | Result |
|---|---:|
| PostgreSQL version | 14.24 |
| Database size | 8,973,659 bytes |
| Product rows | 3 |
| Order rows | 0 |
| MinIO objects | 2 fictional validation files |
| MinIO object bytes | 114 |
| API, PostgreSQL, MinIO health | Healthy |

These are local simulation measurements, not source AWS production data.
Detailed evidence and unknowns are documented in
[`assessment/`](./assessment/) and [`inventory/`](./inventory/).
The scenario source diagram and verified local topology are documented in
[`architecture/source-architecture.md`](./architecture/source-architecture.md).

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
| Local application implementation and tests | ✅ Validated locally | Stages 1-7; 19 unit/static tests passed |
| Local source simulation validation | ✅ Validated locally | Stage 8; Compose health and HTTP flows verified |
| Source assessment | ✅ Complete for simulation | Stage 9 docs; not verified against AWS |
| AWS asset inventory | ⏳ Awaiting authorized evidence | No real source account inventory is available |
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
├── assessment/                  # Local simulation assessment and readiness
├── inventory/                   # Scenario and measured local inventories
├── architecture/                # Source scenario and local topology
├── migration-plan/
├── terraform/                   # Azure Terraform variables (Phase 7)
└── ansible/
```

---

## Security Notes

- No real BluePeak Solutions data anywhere in this repository
- The source AWS environment is a fictional scenario; the local workload is simulated with Docker Compose
- Azure credentials for Phase 7 will use temporary service principal credentials
