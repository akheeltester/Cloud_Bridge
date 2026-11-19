"""SQLite-backed data layer for the NovaRetail demo.

The default embedded SQLite store keeps the workload a single self-contained
container, which suits free-tier hosting (Azure App Service F1 / Container Apps
free grant). Set NOVA_DB_PATH to point at a persistent volume. All data is
fictional and seeded for portfolio demonstration only.
"""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path

DB_PATH = os.environ.get("NOVA_DB_PATH", str(Path(__file__).resolve().parent.parent / "data" / "nova.db"))

SEED_PRODUCTS = [
    ("Ridge GTX Trail Shoes", "footwear", 139.95, 84),
    ("Summit 12L Hydration Vest", "hydration", 89.00, 46),
    ("Carbon Z-Pole Set", "poles", 119.50, 32),
    ("Stormshell Wind Jacket", "apparel", 74.95, 58),
    ("GPS Trail Watch", "electronics", 249.00, 21),
    ("Merino Trail Socks (2-pack)", "apparel", 18.50, 140),
    ("Energy Gel Box (12)", "nutrition", 29.99, 200),
    ("Headlamp 400lm", "accessories", 44.95, 75),
]


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Create schema and seed fictional catalogue data idempotently."""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = _connect()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL REFERENCES products(id),
                quantity INTEGER NOT NULL,
                total REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
            """
        )
        count = conn.execute("SELECT COUNT(*) AS n FROM products").fetchone()["n"]
        if count == 0:
            conn.executemany(
                "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
                SEED_PRODUCTS,
            )
        conn.commit()
    finally:
        conn.close()


def check_database() -> bool:
    try:
        conn = _connect()
        try:
            conn.execute("SELECT 1").fetchone()
            return True
        finally:
            conn.close()
    except sqlite3.Error:
        return False


def list_products() -> list[dict]:
    conn = _connect()
    try:
        rows = conn.execute("SELECT id, name, category, price, stock FROM products ORDER BY id").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_product(product_id: int) -> dict | None:
    conn = _connect()
    try:
        row = conn.execute(
            "SELECT id, name, category, price, stock FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def list_orders() -> list[dict]:
    conn = _connect()
    try:
        rows = conn.execute(
            "SELECT o.id, o.product_id, p.name AS product, o.quantity, o.total, o.created_at "
            "FROM orders o JOIN products p ON p.id = o.product_id ORDER BY o.id DESC"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def create_order(product_id: int, quantity: int) -> dict:
    """Create an order, decrementing stock atomically. Raises ValueError on bad input."""
    if quantity < 1:
        raise ValueError("quantity must be at least 1")
    conn = _connect()
    try:
        product = conn.execute(
            "SELECT id, name, price, stock FROM products WHERE id = ?", (product_id,)
        ).fetchone()
        if product is None:
            raise ValueError("product not found")
        if product["stock"] < quantity:
            raise ValueError("insufficient stock")
        total = round(product["price"] * quantity, 2)
        cur = conn.execute(
            "INSERT INTO orders (product_id, quantity, total) VALUES (?, ?, ?)",
            (product_id, quantity, total),
        )
        conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (quantity, product_id))
        conn.commit()
        return {
            "id": cur.lastrowid,
            "product_id": product_id,
            "product": product["name"],
            "quantity": quantity,
            "total": total,
        }
    finally:
        conn.close()
