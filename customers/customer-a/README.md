# Jigsaw

Jigsaw is a workplace-systems company site and employee portal.

- Public pages: home, about, services, careers, contact, and trust.
- Staff portal: directory, profiles, departments, documents, and an audit log.
- Roles: employee, manager, and people administrator. The server enforces them.
- The first account created becomes the people administrator. There is no default password.

## Run

```bash
npm install
npm run dev
```

The app listens on port 8080. Sign-in is email and password, or Google / X. Directory rows shipped with the database are company records, not login accounts.

## Local container smoke test

Build and run the Cloud Run-compatible Node server image locally:

```bash
docker build -t customer-a:jigsaw-local .
docker run --rm --name customer-a-local \
  -p 127.0.0.1:8080:8080 \
  customer-a:jigsaw-local
```

Open `http://127.0.0.1:8080/`, `/login`, and `/portal` to smoke-test the
production container. The local build deliberately does not receive
`DATABASE_URL`; it uses the embedded in-memory PGlite fallback. That is suitable
for this smoke test only—not durable storage for a Cloud Run deployment. Configure
a persistent PostgreSQL database and production authentication settings before
deploying. Do not put credentials in the image, repository, or build arguments.
