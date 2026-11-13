# Service Inventory

**Source status:** SIMULATED SOURCE DATA — NOT VERIFIED AGAINST AWS.

| Capability | Scenario component | Local simulation evidence |
|---|---|---|
| Web frontend | Nginx on Ubuntu EC2 | Nginx 1.27 Alpine; static frontend at `/`; `/health` returns HTTP 200 |
| Application API | Python backend on EC2 | FastAPI 1.0.0 on Python 3.12; API proxied via Nginx |
| Relational database | Self-managed PostgreSQL on EC2 | PostgreSQL 14.24; `products` and `orders` tables |
| Object storage | Amazon S3 | MinIO S3-compatible service; private bucket behavior checked |
| DNS | Route 53 | Scenario name documented; no live zone inspected |
| Identity | AWS IAM | No actual roles or policies supplied or inspected |

The local API health endpoint reported PostgreSQL and MinIO healthy during
validation. This does not imply any AWS service is deployed or healthy.
