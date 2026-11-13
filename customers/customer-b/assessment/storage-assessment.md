# Object Storage Assessment

**Evidence scope:** Local MinIO S3-compatible simulation only. No AWS S3 bucket
or account was inspected.

## Observed simulation

| Property | Local observation |
|---|---|
| Service | MinIO, image tag `minio/minio:latest` |
| Runtime version | `RELEASE.2025-09-07T16-13-09Z` |
| Internal S3 endpoint | `http://minio:9000` |
| Bucket used by the app | `bluepeak-uploads` |
| Persistence | Named volume mounted at `/data` |
| Host endpoints | `127.0.0.1:19000` (S3 API), `127.0.0.1:19001` (console) |
| Objects at baseline | 2 fictional test objects |
| Total measured object size | 114 bytes |

Object count and sizes were measured from the app's paginated object-listing
endpoint after local validation. The test objects are not representative of
customer data or production storage usage.

## Access and privacy checks

- The application creates the bucket only when absent and does not set a
  public ACL or public bucket policy.
- Objects are assigned randomized `uploads/` keys.
- Anonymous HTTP reads of a test object and anonymous bucket listing both
  returned HTTP 403 in the local MinIO simulation.
- The application returns object metadata, not content or credentials.

These are local behavioral checks, not a review of a real S3 policy or Azure
Blob configuration.

## Risks and unknowns

- The `latest` image tag is mutable; capture and pin a reviewed image version
  for repeatable builds.
- The app uses MinIO root credentials through environment variables. Use a
  dedicated least-privilege bucket account for further non-lab use.
- Actual AWS bucket region, object count/bytes, key patterns, versioning,
  lifecycle rules, encryption, replication, access logs, retention, object
  metadata, and policies are unknown.
- No virus scanning, data classification, retention policy, or production
  backup strategy is configured in the simulation.
