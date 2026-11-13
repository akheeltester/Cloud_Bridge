# Network Inventory

**Source status:** SIMULATED SOURCE DATA — NOT VERIFIED AGAINST AWS.

## Scenario network

| Item | Scenario value | Verification |
|---|---|---|
| AWS VPC | `10.20.0.0/16` | Not verified |
| Region | `ap-southeast-2` | Not verified |
| DNS | `app.bluepeaksolutions.example` via Route 53 | Not verified |

## Local Docker simulation

| Service | Local network address | Host exposure |
|---|---|---|
| Nginx | `10.203.20.10` | `127.0.0.1:8081` |
| PostgreSQL | `10.203.20.11` | Internal only |
| MinIO | `10.203.20.12` | `127.0.0.1:19000`, `127.0.0.1:19001` |
| FastAPI | `10.203.20.13` | Internal only |

Docker subnet: `10.203.20.0/24`. The local app uses Docker DNS names for
PostgreSQL and MinIO, and Nginx proxies to `app:8000`.

No AWS route tables, security groups, NACLs, endpoints, peering, VPN, subnet
assignments, public addresses, DNS values, or flow logs have been inspected.
