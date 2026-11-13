import os

import psycopg
from psycopg.rows import dict_row


def get_connection():
    """Create a connection to the BluePeak PostgreSQL service."""

    db_password = os.getenv("DATABASE_PASSWORD")
    if not db_password:
        raise RuntimeError("DATABASE_PASSWORD is not configured")

    connection_kwargs = {
        "host": os.getenv("DATABASE_HOST", "database"),
        "port": int(os.getenv("DATABASE_PORT", "5432")),
        "dbname": os.getenv("DATABASE_NAME", "bluepeak_app"),
        "user": os.getenv("DATABASE_USER", "bluepeak_user"),
        "password": db_password,
    }
    return psycopg.connect(**connection_kwargs, connect_timeout=3, row_factory=dict_row)
