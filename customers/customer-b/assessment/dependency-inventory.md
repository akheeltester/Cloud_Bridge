# Application Dependency Inventory

**Evidence scope:** Running local app container and checked-in dependency
constraints. This is not the inventory of an AWS-hosted production application.

## Python dependencies

| Package | Observed runtime version | Declared constraint | Purpose |
|---|---:|---|---|
| Python | 3.12 | `python:3.12-slim` base image | Application runtime |
| FastAPI | 0.162.4 | `>=0.115,<1.0` | HTTP API |
| Uvicorn | 0.54.0 | `>=0.34,<1.0` | ASGI server |
| psycopg | 3.3.8 | `>=3.2,<4.0` | PostgreSQL driver |
| boto3 | 1.44.0 | `>=1.37,<2.0` | S3-compatible storage client |
| python-multipart | 0.0.33 | `>=0.0.20,<1.0` | Multipart upload parsing |

Runtime versions were read from the running app container on 2026-11-11.
Requirements use version ranges; there is no dependency lock file in the
BluePeak Docker app directory.

## Container services

| Service | Image reference | Notes |
|---|---|---|
| Web | `nginx:1.27-alpine` | Static frontend and reverse proxy |
| Database | `postgres:14-alpine` | PostgreSQL 14 local simulation |
| App | Locally built from `python:3.12-slim` | Runs as non-root `app` user |
| Object storage | `minio/minio:latest` | Mutable image tag; runtime version observed as `RELEASE.2025-09-07T16-13-09Z` |

## Migration checks

Before selecting Azure target versions, collect the actual AWS application's
OS, runtime, native libraries, scheduled jobs, external APIs, TLS/DNS
dependencies, and deployment process. Evaluate each Python dependency for
compatibility with the chosen Azure VM and deployment method, then lock and
scan the resolved dependency set as part of the production build process.
