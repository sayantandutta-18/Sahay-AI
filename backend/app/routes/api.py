"""API v1 router aggregator."""

from fastapi import APIRouter
from app.routes.health import router as health_router

api_router = APIRouter()

# Include health router under /api/v1 as well
api_router.include_router(health_router, prefix="", tags=["System"])
