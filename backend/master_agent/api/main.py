import logging
import os
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from .research import router as research_router
from .internal import router as internal_router
from backend.common.storage.minio_client import initialize_buckets
from backend.celery_app import celery_app  # Force load Celery config

from backend.database import engine, SessionLocal
from backend.master_agent.models.base import Base
# Import all models to ensure they are registered
from backend.master_agent.models import job
from backend.master_agent.models import task
from backend.master_agent.models import worker_response

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_buckets()
    Base.metadata.create_all(bind=engine)
    logger.info("Pharm-Agent API started successfully.")
    yield

app = FastAPI(
    title="Pharm-Agent API",
    description="AI-Driven Pharmaceutical Research Assistant",
    version="0.2.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────
# In production, set CORS_ORIGINS env var to your frontend domain
# e.g., CORS_ORIGINS=https://pharm-agent.vercel.app
_cors_origins_raw = os.getenv("CORS_ORIGINS", "*")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global Error Handler ─────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error. Please try again later."}
    )

app.include_router(research_router)
app.include_router(internal_router)

@app.get("/health")
def health():
    """Health check that validates DB connectivity."""
    from sqlalchemy import text as sa_text
    try:
        db = SessionLocal()
        db.execute(sa_text("SELECT 1"))
        db.close()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})