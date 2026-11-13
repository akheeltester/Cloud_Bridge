# Compute Inventory

**Source status:** SIMULATED SOURCE DATA — NOT VERIFIED AGAINST AWS.

## Scenario inventory

| Workload | Scenario component | Region | Size / OS |
|---|---|---|---|
| Web and application | Ubuntu EC2 running Nginx and Python | `ap-southeast-2` | Instance type and exact OS release unknown |
| Database | Self-managed PostgreSQL on EC2 | `ap-southeast-2` | Instance type and exact OS release unknown |

## Local Compose observation

The local simulation uses Nginx 1.27 Alpine and a FastAPI application built
from Python 3.12 slim. These containers do not establish the size or patch
state of any scenario EC2 instance. No AWS instance IDs or account resources
were observed.

## Discovery required

Collect authorized EC2 instance IDs, types, AMIs, CPU/memory/disk utilization,
volumes, uptime, availability zone, patch status, user data, attached
identities, and monitoring history before target sizing.
