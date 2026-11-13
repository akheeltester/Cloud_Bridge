# ACME Technologies — Local Migration Simulation

This environment is a Docker-based simulation of the documented ACME source
application and database. It is not a deployment of the three documented
Ubuntu source servers or the documented VirtualBox host-only network.

## Components

- Nginx reverse proxy
- Node.js application
- PostgreSQL 14 source-database simulation
- Persistent PostgreSQL Docker volume
- Separate frontend and internal database networks
- Fictional sample employee records only

## Access

The application is bound to localhost:

- http://127.0.0.1:18080/
- http://127.0.0.1:18080/health
- http://127.0.0.1:18080/api/summary
- http://127.0.0.1:18080/api/employees

PostgreSQL is not published on a host port.

## Start

From the repository root:

    docker compose -p acme-customer-a -f customers/customer-a/local-lab/docker-compose.yml up --build -d

## Stop without deleting data

    docker compose -p acme-customer-a -f customers/customer-a/local-lab/docker-compose.yml down

The named database volume is retained by this command.

## Security and fidelity notes

- The `.env` file contains a generated local password and must not be committed.
- All sample employee records are fictional.
- The source README documents PostgreSQL 14; this lab retains that version
  for source-environment fidelity. Review the database upgrade path before
  treating it as a production target.
- This is a local simulation, not evidence of an actual AWS migration.
