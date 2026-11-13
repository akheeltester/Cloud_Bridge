# Application Assessment

**Evidence scope:** Local BluePeak simulation; no AWS application host was inspected.

## Observed application

- Static HTML frontend served by Nginx 1.27 Alpine.
- FastAPI 1.0.0 service running under Python 3.12 and Uvicorn 0.54.0.
- API routes: `/api/live`, `/api/db/health`, `/api/health`, `/api/products`,
  `/api/orders`, `GET /api/uploads`, and `POST /api/uploads`.
- Nginx serves `/` and `/health` and forwards `/api/` to `http://app:8000`.
- The app is not host-published. Nginx and MinIO are bound only to localhost.
- The application has no sign-in, user identity, or authorization flow.
- Multipart upload accepts PDF, PNG, JPEG, TXT, and CSV up to 10 MiB.

## Observed dependency versions

| Package | Runtime version | Declared constraint |
|---|---:|---|
| Python | 3.12 (container base) | `python:3.12-slim` |
| FastAPI | 0.162.4 | `>=0.115,<1.0` |
| Uvicorn | 0.54.0 | `>=0.34,<1.0` |
| psycopg | 3.3.8 | `>=3.2,<4.0` |
| boto3 | 1.44.0 | `>=1.37,<2.0` |
| python-multipart | 0.0.33 | `>=0.0.20,<1.0` |

Versions above were read from the running container on 2026-11-11. The
requirements use ranges rather than a lock file, so a rebuild may resolve
different compatible versions.

## Validation evidence

- Local browser loaded the frontend and displayed service health, 3 products,
  0 orders, and the uploaded-object list.
- Nginx returned HTTP 200 for `/`, `/health`, `/api/live`, database-backed
  product/order routes, and the combined health endpoint when dependencies
  were healthy.
- A browser-driven text upload completed and appeared in the object listing.
- The API does not expose uploaded objects through a public read endpoint.

## Risks and unknowns

- There is no source production code or workload profile to compare with the
  simulation.
- Authentication, authorization, session management, business flows, expected
  concurrency, availability targets, and latency objectives are unspecified.
- Upload checks validate allowlisted MIME type, extension, size, and basic
  signatures; they do not perform malware scanning or comprehensive file
  format validation.
- The local Compose configuration maps MinIO root credentials into the app.
  Replace that with a bucket-scoped identity before any non-lab use.
- Application logs and service behavior have been validated locally only.
