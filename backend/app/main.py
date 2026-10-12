"""FastAPI application entrypoint for Sahay."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, SessionLocal
from app.database.base import Base
import app.models  # Ensure all SQLAlchemy models are registered
from app.services.scheme_service import seed_verified_schemes_if_empty
from app.routes.health import router as health_router
from app.routes.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables and seed verified knowledge base."""
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_verified_schemes_if_empty(db)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multilingual AI Platform for Indian Micro-Entrepreneurs — Decision-Support and Scheme Engine.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root-level health endpoint (GET /health)
app.include_router(health_router, prefix="", tags=["System"])

# API V1 routes (GET /api/v1/...)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def root_status():
    """Root entrypoint providing basic service greeting."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health",
        "status": "online",
    }
