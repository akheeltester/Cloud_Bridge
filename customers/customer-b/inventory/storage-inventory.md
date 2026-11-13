# Object Storage Inventory

**Source status:** SIMULATED SOURCE DATA — NOT VERIFIED AGAINST AWS.

| Attribute | Scenario / local evidence |
|---|---|
| Scenario service | Amazon S3 bucket for application uploads; bucket name/settings unknown |
| Local service | MinIO S3-compatible simulation |
| Local internal endpoint | `http://minio:9000` |
| Local bucket | `bluepeak-uploads` |
| Local objects | 2 fictional validation objects |
| Local measured bytes | 114 bytes total |
| Local persistent volume | `bluepeak-customer-b_customer-b-miniodata` |
| Local public access check | Anonymous object read and bucket listing returned HTTP 403 |

No production object count, byte total, region, versioning, lifecycle, retention,
encryption, replication, or bucket policy has been verified.
