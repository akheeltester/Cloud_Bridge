# Network Assessment

**Evidence scope:** Local Docker network was inspected. The documented AWS VPC
and DNS are scenario assumptions, not verified account resources.

## Scenario network assumptions

| Property | Scenario value | Status |
|---|---|---|
| AWS region | `ap-southeast-2` | Not verified against AWS |
| VPC | `10.20.0.0/16` | Not verified against AWS |
| DNS name | `app.bluepeaksolutions.example` in Route 53 | Not verified against AWS |

## Observed local Docker network

| Service | Address | Host binding |
|---|---|---|
| Nginx | `10.203.20.10` | `127.0.0.1:8081 -> 80` |
| PostgreSQL | `10.203.20.11` | No host port |
| MinIO | `10.203.20.12` | `127.0.0.1:19000 -> 9000`, `127.0.0.1:19001 -> 9001` |
| FastAPI | `10.203.20.13` | No host port |

The inspected network subnet is `10.203.20.0/24`. The app uses Docker service
names `database` and `minio`; Nginx proxies `/api/` to `app:8000`. PostgreSQL
and FastAPI are not directly host-published. This network is for the local
simulation and is not the scenario AWS VPC.

## Validation

- Compose configuration parsed successfully using the BluePeak environment file.
- Docker network inspection confirmed the subnet and service addresses.
- The configured loopback host ports were available before startup.
- HTTP checks passed through `127.0.0.1:8081` for the frontend, Nginx health,
  API, database-backed routes, and storage-backed routes.

## Unknowns before a real migration

AWS subnets and AZs, route tables, NAT/IGW paths, security groups, NACLs,
VPC endpoints, peering or VPN links, source/destination CIDR conflicts,
egress controls, DNS records/TTL, TLS termination, and client connectivity
requirements have not been assessed.
