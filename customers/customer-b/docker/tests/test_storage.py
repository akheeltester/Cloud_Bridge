import os
import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from botocore.exceptions import ClientError

from app import storage


class StorageTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            os.environ,
            {
                "S3_ENDPOINT_URL": "http://minio:9000",
                "S3_BUCKET_NAME": "bluepeak-uploads",
                "S3_REGION": "us-east-1",
                "S3_ACCESS_KEY": "test-access-key",
                "S3_SECRET_KEY": "test-secret-key",
            },
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def test_storage_client_uses_internal_endpoint_and_bounded_timeouts(self):
        with patch("app.storage.boto3.client") as create_client:
            storage.get_storage_client.cache_clear()
            self.addCleanup(storage.get_storage_client.cache_clear)
            client = storage.get_storage_client()

        create_client.assert_called_once()
        arguments = create_client.call_args.kwargs
        self.assertEqual(arguments["endpoint_url"], "http://minio:9000")
        self.assertEqual(arguments["region_name"], "us-east-1")
        self.assertEqual(arguments["aws_access_key_id"], "test-access-key")
        self.assertEqual(arguments["aws_secret_access_key"], "test-secret-key")
        self.assertEqual(arguments["config"].connect_timeout, 3)
        self.assertEqual(arguments["config"].read_timeout, 10)
        self.assertEqual(arguments["config"].s3["addressing_style"], "path")
        self.assertIs(client, create_client.return_value)
    def test_storage_client_uses_default_credential_chain_without_static_keys(self):
        with patch.dict(
            os.environ,
            {
                "S3_ENDPOINT_URL": "",
                "S3_BUCKET_NAME": "bluepeak-uploads",
                "S3_REGION": "us-east-1",
            },
            clear=True,
        ):
            with patch("app.storage.boto3.client") as create_client:
                storage.get_storage_client.cache_clear()
                self.addCleanup(storage.get_storage_client.cache_clear)
                storage.get_storage_client()

        arguments = create_client.call_args.kwargs
        self.assertEqual(arguments["region_name"], "us-east-1")
        self.assertNotIn("endpoint_url", arguments)
        self.assertNotIn("aws_access_key_id", arguments)
        self.assertNotIn("aws_secret_access_key", arguments)
        self.assertIsNone(arguments["config"].s3)

    def test_storage_settings_rejects_partial_static_credentials(self):
        with patch.dict(
            os.environ,
            {"S3_ACCESS_KEY": "test-access-key", "S3_SECRET_KEY": ""},
        ):
            with self.assertRaisesRegex(RuntimeError, "must both be configured"):
                storage._storage_settings()

    def test_bucket_initialization_is_idempotent(self):
        client = MagicMock()
        with patch("app.storage.get_storage_client", return_value=client):
            storage.ensure_bucket()

        client.head_bucket.assert_called_once_with(Bucket="bluepeak-uploads")
        client.create_bucket.assert_not_called()

    def test_missing_bucket_is_created_without_public_acl_or_policy(self):
        client = MagicMock()
        client.head_bucket.side_effect = ClientError(
            {
                "Error": {"Code": "NoSuchBucket"},
                "ResponseMetadata": {"HTTPStatusCode": 404},
            },
            "HeadBucket",
        )
        with patch("app.storage.get_storage_client", return_value=client):
            storage.ensure_bucket()

        client.create_bucket.assert_called_once_with(Bucket="bluepeak-uploads")
        arguments = client.create_bucket.call_args.kwargs
        self.assertNotIn("ACL", arguments)
        self.assertNotIn("Policy", arguments)

    def test_bucket_is_not_created_when_auto_creation_is_disabled(self):
        client = MagicMock()
        with (
            patch("app.storage.get_storage_client", return_value=client),
            patch.dict(os.environ, {"S3_AUTO_CREATE_BUCKET": "false"}),
        ):
            storage.ensure_bucket()

        client.list_objects_v2.assert_called_once_with(
            Bucket="bluepeak-uploads",
            Prefix="uploads/",
            MaxKeys=1,
        )
        client.create_bucket.assert_not_called()

    def test_storage_health_checks_only_the_configured_bucket(self):
        client = MagicMock()
        with patch("app.storage.get_storage_client", return_value=client):
            storage.check_storage()

        client.list_objects_v2.assert_called_once_with(
            Bucket="bluepeak-uploads",
            Prefix="uploads/",
            MaxKeys=1,
        )
        client.list_buckets.assert_not_called()

    def test_listing_uses_pagination_and_returns_safe_metadata(self):
        modified = datetime(2026, 1, 2, tzinfo=timezone.utc)
        paginator = MagicMock()
        paginator.paginate.return_value = [
            {
                "Contents": [
                    {
                        "Key": "uploads/report.txt",
                        "Size": 12,
                        "ETag": '"abc123"',
                        "LastModified": modified,
                    }
                ]
            },
            {"Contents": []},
        ]
        client = MagicMock()
        client.get_paginator.return_value = paginator
        with patch("app.storage.get_storage_client", return_value=client):
            items = storage.list_objects()

        self.assertEqual(
            items,
            [
                {
                    "key": "uploads/report.txt",
                    "size": 12,
                    "last_modified": modified.isoformat(),
                    "etag": "abc123",
                }
            ],
        )
        client.get_paginator.assert_called_once_with("list_objects_v2")
        paginator.paginate.assert_called_once_with(
            Bucket="bluepeak-uploads",
            Prefix="uploads/",
        )

    def test_upload_sets_content_type_without_public_acl(self):
        client = MagicMock()
        with patch("app.storage.get_storage_client", return_value=client):
            storage.upload_object(
                "uploads/example.txt",
                b"fictional content",
                "text/plain",
            )

        arguments = client.put_object.call_args.kwargs
        self.assertEqual(arguments["Bucket"], "bluepeak-uploads")
        self.assertEqual(arguments["Key"], "uploads/example.txt")
        self.assertEqual(arguments["ContentType"], "text/plain")
        self.assertNotIn("ACL", arguments)


if __name__ == "__main__":
    unittest.main()
