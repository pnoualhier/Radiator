"""Radiation France — Main FastAPI Application Entrypoint.

Provides environmental radiological data APIs under /api/v1.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.database import engine, Base, SessionLocal
from app.database import models  # Ensures all models are registered
from app.api import stations, measurements, sources, alerts, health, admin
from app.seed import init_default_sources

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("radiation_france")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    logger.info("Initializing Radiation France database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed baseline sources if needed
    with SessionLocal() as db:
        init_default_sources(db)

    logger.info("Radiation France backend initialized successfully")
    yield
    logger.info("Shutting down Radiation France backend")


app = FastAPI(
    title="Radiation France API",
    description="API publique de surveillance radiologique environnementale en France métropolitaine et Corse (Téléray/IRSN, EURDEP, OpenRadiation, Safecast).",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all v1 routes under /api/v1
api_v1_router = FastAPI()
app.include_router(health.router, prefix="/api/v1")
app.include_router(stations.router, prefix="/api/v1")
app.include_router(measurements.router, prefix="/api/v1")
app.include_router(sources.router, prefix="/api/v1")
app.include_router(alerts.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/", summary="Root index")
def root():
    return {
        "service": "Radiation France API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "api_v1": "/api/v1",
    }
