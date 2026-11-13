import logging
import uuid
from pathlib import Path

import psycopg
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from starlette.responses import JSONResponse

from app.database import get_connection
from app.storage import (
    MAX_UPLOAD_SIZE,
    check_storage,
    ensure_bucket,
    list_objects,
    upload_object,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bluepeak-api")

ALLOWED_CONTENT_TYPES = {
    ".csv": "text/csv",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".txt": "text/plain",
}

app = FastAPI(
    title="BluePeak Solutions API",
    description="Simulated source application for the CloudBridge migration project.",
    version="1.0.0",
)


@app.get("/api/live", tags=["Health"])
async def liveness():
    """Check whether the API process is responding."""
    return {
        "status": "ok",
        "service": "bluepeak-api",
        "simulation": True,
    }


def _database_is_healthy() -> bool:
    try:
        with get_connection() as connection:
            connection.execute("SELECT 1").fetchone()
        return True
    except (psycopg.Error, RuntimeError) as error:
        logger.error(
            "event=postgresql_health_check_failed error_type=%s",
            type(error).__name__,
        )
        return False


def _storage_error_code(error: Exception) -> str:
    if isinstance(error, ClientError):
        return str(error.response.get("Error", {}).get("Code", "ClientError"))
    return type(error).__name__


def _read_and_validate_upload(file: UploadFile) -> tuple[bytes, str, str]:
    filename = file.filename or ""
    basename = filename.replace("\\", "/").rsplit("/", 1)[-1]
    extension = Path(basename).suffix.lower()
    expected_content_type = ALLOWED_CONTENT_TYPES.get(extension)
    if expected_content_type is None:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type",
        )

    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if content_type != expected_content_type:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File extension and content type do not match",
        )

    if file.size is not None and file.size > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="File exceeds the 10 MiB upload limit",
        )

    chunks = []
    total_size = 0
    while True:
        chunk = file.file.read(min(64 * 1024, MAX_UPLOAD_SIZE + 1 - total_size))
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="File exceeds the 10 MiB upload limit",
            )
        chunks.append(chunk)

    content = b"".join(chunks)
    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        valid_content = False
    elif extension == ".png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
        valid_content = False
    elif extension in {".jpg", ".jpeg"} and not content.startswith(b"\xff\xd8\xff"):
        valid_content = False
    elif extension in {".txt", ".csv"}:
        try:
            content.decode("utf-8-sig")
            valid_content = b"\x00" not in content
        except UnicodeDecodeError:
            valid_content = False
    else:
        valid_content = True

    if not valid_content:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File contents do not match the declared file type",
        )

    return content, content_type, extension


@app.get("/api/db/health", tags=["Health"])
async def database_health():
    """Check PostgreSQL connectivity."""
    if _database_is_healthy():
        return {
            "status": "ok",
            "service": "postgresql",
            "simulation": True,
        }
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database unavailable",
    )


@app.get("/api/health", tags=["Health"])
def application_health():
    """Report the API process and its PostgreSQL and object-storage dependencies."""
    database_healthy = _database_is_healthy()
    try:
        check_storage()
        storage_healthy = True
    except (BotoCoreError, ClientError, RuntimeError, ValueError) as error:
        logger.error(
            "event=object_storage_health_check_failed error_code=%s",
            _storage_error_code(error),
        )
        storage_healthy = False

    components = {
        "api": "healthy",
        "postgresql": "healthy" if database_healthy else "unavailable",
        "object_storage": "healthy" if storage_healthy else "unavailable",
    }
    is_healthy = database_healthy and storage_healthy
    result = {
        "status": "healthy" if is_healthy else "degraded",
        "service": "bluepeak-api",
        "simulation": True,
        "components": components,
    }
    return JSONResponse(
        status_code=(
            status.HTTP_200_OK
            if is_healthy
            else status.HTTP_503_SERVICE_UNAVAILABLE
        ),
        content=result,
    )


@app.get("/api/products", tags=["Products"])
async def list_products():
    """Return products from the existing BluePeak products table."""
    try:
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT id, name, sku, price, created_at
                FROM products
                ORDER BY id
                """
            ).fetchall()

        return {
            "count": len(rows),
            "items": rows,
            "simulation": True,
        }

    except (psycopg.Error, RuntimeError) as error:
        logger.error(
            "event=product_query_failed error_type=%s",
            type(error).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to retrieve products",
        )


@app.get("/api/orders", tags=["Orders"])
async def list_orders():
    """Return orders with their associated product names."""
    try:
        with get_connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    orders.id,
                    orders.product_id,
                    products.name AS product_name,
                    orders.quantity,
                    orders.status,
                    orders.created_at
                FROM orders
                LEFT JOIN products
                    ON products.id = orders.product_id
                ORDER BY orders.id
                """
            ).fetchall()

        return {
            "count": len(rows),
            "items": rows,
            "simulation": True,
        }

    except (psycopg.Error, RuntimeError) as error:
        logger.error(
            "event=order_query_failed error_type=%s",
            type(error).__name__,
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to retrieve orders",
        )


@app.post("/api/uploads", status_code=status.HTTP_201_CREATED, tags=["Uploads"])
def create_upload(file: UploadFile = File(...)):
    """Validate and store a private object in the configured S3-compatible bucket."""
    content, content_type, extension = _read_and_validate_upload(file)
    key = f"uploads/{uuid.uuid4().hex}{extension}"

    try:
        ensure_bucket()
        upload_object(key, content, content_type)
    except (BotoCoreError, ClientError, RuntimeError, ValueError) as error:
        logger.error(
            "event=object_upload_failed error_code=%s",
            _storage_error_code(error),
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Object storage unavailable",
        ) from error

    return {
        "key": key,
        "size": len(content),
        "content_type": content_type,
        "simulation": True,
    }


@app.get("/api/uploads", tags=["Uploads"])
def get_uploads():
    """List stored object metadata without exposing storage credentials."""
    try:
        ensure_bucket()
        items = list_objects()
    except (BotoCoreError, ClientError, RuntimeError, ValueError) as error:
        logger.error(
            "event=object_listing_failed error_code=%s",
            _storage_error_code(error),
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Object storage unavailable",
        ) from error

    return {
        "count": len(items),
        "items": items,
        "simulation": True,
    }
