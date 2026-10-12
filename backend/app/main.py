"""FastAPI application entrypoint for Sahay."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.health import router as health_router
from app.routes.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multilingual AI Platform for Indian Micro-Entrepreneurs — Decision-Support and Scheme Engine.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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
