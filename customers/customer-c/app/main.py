"""NovaRetail simulated e-commerce API.

Fictional retail workload for the CloudBridge portfolio. Single self-contained
container (embedded SQLite) so it can run on free-tier cloud hosting. No real
customer data is used.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from app import database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("novaretail-api")

WEB_DIR = Path(__file__).resolve().parent.parent / "web"


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    logger.info("NovaRetail database initialised at %s", database.DB_PATH)
    yield


app = FastAPI(
    title="NovaRetail API",
    description="Simulated retail application for the CloudBridge multi-cloud project.",
    version="1.0.0",
    lifespan=lifespan,
)


class OrderIn(BaseModel):
    product_id: int = Field(..., ge=1)
    quantity: int = Field(..., ge=1, le=1000)


@app.get("/api/live", tags=["Health"])
async def liveness():
    return {"status": "alive", "service": "novaretail-api"}


@app.get("/api/health", tags=["Health"])
async def health():
    db_ok = database.check_database()
    payload = {
        "status": "healthy" if db_ok else "degraded",
        "service": "novaretail-api",
        "simulation": True,
        "components": {"api": "healthy", "database": "healthy" if db_ok else "unavailable"},
    }
    return JSONResponse(payload, status_code=200 if db_ok else 503)


@app.get("/api/products", tags=["Catalogue"])
async def products():
    return {"products": database.list_products()}


@app.get("/api/products/{product_id}", tags=["Catalogue"])
async def product(product_id: int):
    item = database.get_product(product_id)
    if item is None:
        raise HTTPException(status_code=404, detail="product not found")
    return item


@app.get("/api/orders", tags=["Orders"])
async def orders():
    return {"orders": database.list_orders()}


@app.post("/api/orders", tags=["Orders"], status_code=201)
async def create_order(order: OrderIn):
    try:
        return database.create_order(order.product_id, order.quantity)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/", include_in_schema=False)
async def index():
    index_file = WEB_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return JSONResponse({"service": "novaretail-api", "docs": "/docs"})
