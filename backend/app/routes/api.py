"""API v1 router aggregator."""

from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.schemes import router as schemes_router
from app.routes.eligibility import router as eligibility_router

api_router = APIRouter()

# Register core feature routers
api_router.include_router(health_router, prefix="", tags=["System"])
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(schemes_router)
api_router.include_router(eligibility_router)
