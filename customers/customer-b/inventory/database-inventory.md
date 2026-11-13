# Database Inventory

**Source status:** SIMULATED SOURCE DATA — NOT VERIFIED AGAINST AWS.

| Attribute | Scenario / local evidence |
|---|---|
| Scenario engine | Self-managed PostgreSQL on EC2; source version unknown |
| Local simulation | PostgreSQL 14.24, `postgres:14-alpine` |
| Local database | `bluepeak_app` |
| Tables | `orders`, `products` |
| Local row counts | 3 products, 0 orders |
| Local database size | 8,973,659 bytes |
| Local persistence | Named Docker volume |

The local schema is defined in `../docker/postgres/init.sql`. These local
measurements are test data and must not be presented as production inventory.
Source production size, extensions, roles, grants, indexes, backups, and change
rate remain unknown.
