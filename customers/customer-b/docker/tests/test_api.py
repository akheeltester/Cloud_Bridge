import io
import os
import unittest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
from starlette.datastructures import Headers, UploadFile

from app import main
from app.storage import MAX_UPLOAD_SIZE


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            os.environ,
            {
                "S3_ACCESS_KEY": "test-access-key",
                "S3_SECRET_KEY": "test-secret-key",
            },
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.client = TestClient(main.app)

    def test_liveness_does_not_require_dependencies(self):
        response = self.client.get("/api/live")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "service": "bluepeak-api", "simulation": True},
        )

    def test_database_health_returns_503_when_database_is_unavailable(self):
        with patch("app.main._database_is_healthy", return_value=False):
            response = self.client.get("/api/db/health")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"], "Database unavailable")

    def test_combined_health_reports_all_healthy_components(self):
        with (
            patch("app.main._database_is_healthy", return_value=True),
            patch("app.main.check_storage"),
        ):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["components"],
            {
                "api": "healthy",
                "postgresql": "healthy",
                "minio": "healthy",
            },
        )

    def test_combined_health_returns_503_for_each_failed_dependency(self):
        with (
            patch("app.main._database_is_healthy", return_value=False),
            patch("app.main.check_storage"),
        ):
            database_response = self.client.get("/api/health")
        with (
            patch("app.main._database_is_healthy", return_value=True),
            patch("app.main.check_storage", side_effect=RuntimeError("test failure")),
        ):
            storage_response = self.client.get("/api/health")

        self.assertEqual(database_response.status_code, 503)
        self.assertEqual(
            database_response.json()["components"]["postgresql"], "unavailable"
        )
        self.assertEqual(storage_response.status_code, 503)
        self.assertEqual(storage_response.json()["components"]["minio"], "unavailable")

    def test_product_and_order_endpoints_return_database_rows(self):
        connection = MagicMock()
        connection.__enter__.return_value = connection
        connection.execute.return_value.fetchall.side_effect = [
            [{"id": 1, "name": "Sample", "sku": "SVC-001", "price": "12.00"}],
            [{"id": 2, "product_name": "Sample", "quantity": 3, "status": "pending"}],
        ]
        with patch("app.main.get_connection", return_value=connection):
            products = self.client.get("/api/products")
            orders = self.client.get("/api/orders")

        self.assertEqual(products.status_code, 200)
        self.assertEqual(products.json()["items"][0]["sku"], "SVC-001")
        self.assertEqual(orders.status_code, 200)
        self.assertEqual(orders.json()["items"][0]["product_name"], "Sample")
        product_query = connection.execute.call_args_list[0].args[0]
        order_query = connection.execute.call_args_list[1].args[0]
        self.assertIn("FROM products", product_query)
        self.assertIn("LEFT JOIN products", order_query)

    def test_product_and_order_endpoints_return_503_on_database_failure(self):
        with patch(
            "app.main.get_connection",
            side_effect=RuntimeError("test failure"),
        ):
            products = self.client.get("/api/products")
            orders = self.client.get("/api/orders")

        self.assertEqual(products.status_code, 503)
        self.assertEqual(orders.status_code, 503)
        self.assertNotIn("test failure", products.text)
        self.assertNotIn("test failure", orders.text)

    def test_upload_uses_randomized_key_and_does_not_set_public_acl(self):
        with (
            patch("app.main.ensure_bucket"),
            patch("app.main.upload_object") as upload,
        ):
            response = self.client.post(
                "/api/uploads",
                files={
                    "file": (
                        "../../report.txt",
                        b"fictional report",
                        "text/plain",
                    )
                },
            )

        self.assertEqual(response.status_code, 201)
        key = response.json()["key"]
        self.assertRegex(key, r"^uploads/[0-9a-f]{32}\.txt$")
        self.assertEqual(response.json()["size"], len(b"fictional report"))
        upload.assert_called_once_with(key, b"fictional report", "text/plain")
        self.assertNotIn("test-secret-key", response.text)

    def test_upload_rejects_unsupported_and_mismatched_file_types(self):
        unsupported = self.client.post(
            "/api/uploads",
            files={"file": ("sample.exe", b"data", "application/octet-stream")},
        )
        mismatched_mime = self.client.post(
            "/api/uploads",
            files={"file": ("sample.txt", b"plain text", "application/pdf")},
        )
        mismatched_signature = self.client.post(
            "/api/uploads",
            files={"file": ("sample.png", b"not a PNG", "image/png")},
        )

        self.assertEqual(unsupported.status_code, 415)
        self.assertEqual(mismatched_mime.status_code, 415)
        self.assertEqual(mismatched_signature.status_code, 415)

    def test_upload_rejects_file_over_limit(self):
        upload = UploadFile(
            file=io.BytesIO(b"small payload"),
            filename="oversized.txt",
            size=MAX_UPLOAD_SIZE + 1,
            headers=Headers({"content-type": "text/plain"}),
        )

        with self.assertRaises(main.HTTPException) as raised:
            main._read_and_validate_upload(upload)

        self.assertEqual(raised.exception.status_code, 413)

    def test_upload_and_listing_hide_storage_errors_from_clients(self):
        with patch(
            "app.main.ensure_bucket",
            side_effect=RuntimeError("test-only storage failure"),
        ):
            upload_response = self.client.post(
                "/api/uploads",
                files={"file": ("report.txt", b"safe text", "text/plain")},
            )
        with patch(
            "app.main.ensure_bucket",
            side_effect=RuntimeError("test-only storage failure"),
        ):
            listing_response = self.client.get("/api/uploads")

        self.assertEqual(upload_response.status_code, 503)
        self.assertEqual(listing_response.status_code, 503)
        self.assertNotIn("test-only storage failure", upload_response.text)
        self.assertNotIn("test-only storage failure", listing_response.text)

    def test_upload_listing_returns_object_metadata(self):
        objects = [
            {
                "key": "uploads/report.txt",
                "size": 10,
                "last_modified": None,
                "etag": "abc123",
            }
        ]
        with (
            patch("app.main.ensure_bucket"),
            patch("app.main.list_objects", return_value=objects),
        ):
            response = self.client.get("/api/uploads")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["items"], objects)


if __name__ == "__main__":
    unittest.main()
