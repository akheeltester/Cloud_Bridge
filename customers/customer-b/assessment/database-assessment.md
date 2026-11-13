# Database Assessment

**Evidence scope:** Local PostgreSQL simulation only. No AWS database was inspected.

## Observed database

| Property | Local observation |
|---|---|
| Image | `postgres:14-alpine` |
| Server version | PostgreSQL 14.24 |
| Database | `bluepeak_app` |
| User | `bluepeak_user` (local simulation account) |
| Storage | Named volume mounted at `/var/lib/postgresql/data` |
| Initialization | `docker/postgres/init.sql`, run by the image on first initialization |
| Measured database size | 8,973,659 bytes (approximately 8.56 MiB) |
| Product rows | 3 fictional seed rows |
| Order rows | 0 |

The database size and counts were measured with read-only SQL against the
running local database on 2026-11-11. The size is not an estimate of source
production database size.

## Schema observed

### `products`

| Column | Type | Nullable |
|---|---|---|
| `id` | integer (`SERIAL` primary key) | No |
| `name` | character varying(200) | No |
| `sku` | character varying(50), unique | No |
| `price` | numeric(10,2) | Yes |
| `created_at` | timestamp with time zone | Yes |

### `orders`

| Column | Type | Nullable |
|---|---|---|
| `id` | integer (`SERIAL` primary key) | No |
| `product_id` | integer foreign key to `products.id` | Yes |
| `quantity` | integer | No |
| `status` | character varying(50) | Yes |
| `created_at` | timestamp with time zone | Yes |

## Application access

The FastAPI application connects through Docker DNS at `database:5432`, reads
credentials from environment variables, uses a 3-second connection timeout,
and returns dictionary rows. Product and order queries are fixed SQL; the
orders query uses a left join to products. Database failures produce HTTP 503
responses without returning connection details.

## Migration considerations

PostgreSQL 14 is the observed simulation version, not a confirmed AWS source
version. Before designing a migration, confirm the actual PostgreSQL major and
minor version, extensions, collation, encodings, roles and grants, sequences,
indexes, constraints, database size, write rate, backup/recovery objectives,
and downtime tolerance. Test source/target compatibility using an authorized
production-like inventory and a separate migration rehearsal.

No database volume was reset or deleted during this assessment.
