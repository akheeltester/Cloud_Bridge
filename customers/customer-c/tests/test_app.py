"""Unit tests for the NovaRetail API. Run from customers/customer-c with:

    PYTHONPATH=. python3 -m unittest discover -s tests -v

Uses a temporary SQLite database; no containers required.
"""

import os
import tempfile
import unittest

# Point the data layer at a throwaway DB before importing the app.
_TMP = tempfile.mkdtemp(prefix="nova-test-")
os.environ["NOVA_DB_PATH"] = os.path.join(_TMP, "test.db")

from fastapi.testclient import TestClient  # noqa: E402

from app import database  # noqa: E402
from app.main import app  # noqa: E402


class NovaRetailTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        database.init_db()
        cls.client = TestClient(app)

    def test_liveness(self):
        r = self.client.get("/api/live")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["status"], "alive")

    def test_health(self):
        r = self.client.get("/api/health")
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertEqual(body["status"], "healthy")
        self.assertTrue(body["simulation"])
        self.assertEqual(body["components"]["database"], "healthy")

    def test_products_seeded(self):
        r = self.client.get("/api/products")
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()["products"]), 5)

    def test_product_not_found(self):
        r = self.client.get("/api/products/99999")
        self.assertEqual(r.status_code, 404)

    def test_order_flow_decrements_stock(self):
        before = self.client.get("/api/products/1").json()["stock"]
        r = self.client.post("/api/orders", json={"product_id": 1, "quantity": 2})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["quantity"], 2)
        after = self.client.get("/api/products/1").json()["stock"]
        self.assertEqual(after, before - 2)

    def test_order_invalid_quantity(self):
        r = self.client.post("/api/orders", json={"product_id": 1, "quantity": 0})
        self.assertEqual(r.status_code, 422)

    def test_order_unknown_product(self):
        r = self.client.post("/api/orders", json={"product_id": 99999, "quantity": 1})
        self.assertEqual(r.status_code, 400)

    def test_orders_listed(self):
        r = self.client.get("/api/orders")
        self.assertEqual(r.status_code, 200)
        self.assertIsInstance(r.json()["orders"], list)


if __name__ == "__main__":
    unittest.main()
