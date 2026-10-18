"""FastAPI application entrypoint for Sahay."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, SessionLocal
from app.database.base import Base
import app.models  # Ensure all SQLAlchemy models are registered
from app.services.scheme_service import seed_verified_schemes_if_empty
from app.services.academy_service import seed_academy_content_if_empty
from app.services.user_service import seed_default_admin_if_empty, seed_demo_user_if_empty
from app.database.schema_sync import reconcile_database_schema
from app.routes.health import router as health_router
from app.routes.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables, reconcile schema columns, and seed verified knowledge base."""
    Base.metadata.create_all(bind=engine)
    reconcile_database_schema(engine, Base.metadata)
    with SessionLocal() as db:
        seed_default_admin_if_empty(db)
        seed_demo_user_if_empty(db)
        seed_verified_schemes_if_empty(db)
        seed_academy_content_if_empty(db)
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
cors_origins = (
    settings.CORS_ORIGINS
    if isinstance(settings.CORS_ORIGINS, list)
    else [o.strip().rstrip("/") for o in str(settings.CORS_ORIGINS).split(",") if o.strip()]
)

# Essential development and production frontend origins always permitted
default_trusted_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://sahay-ai-git-main-sayantandutta444-6280.vercel.app",
    "https://sahay-ai.vercel.app",
]
for origin in default_trusted_origins:
    if origin not in cors_origins:
        cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX.strip() if getattr(settings, "CORS_ORIGIN_REGEX", None) and settings.CORS_ORIGIN_REGEX.strip() else None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
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
