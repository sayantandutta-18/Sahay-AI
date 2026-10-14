"""API v1 router aggregator."""

from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.schemes import router as schemes_router
from app.routes.eligibility import router as eligibility_router
from app.routes.applications import router as applications_router
from app.routes.documents import router as documents_router
from app.routes.business import router as business_router
from app.routes.admin import router as admin_router
from app.routes.chat import router as chat_router
from app.routes.academy import router as academy_router
from app.routes.investment import router as investment_router
from app.routes.portfolio import router as portfolio_router
from app.routes.financial import router as financial_router
from app.routes.candlestick import router as candlestick_router

api_router = APIRouter()

# Register all feature domain routers
api_router.include_router(health_router, prefix="", tags=["System"])
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(schemes_router)
api_router.include_router(eligibility_router)
api_router.include_router(applications_router)
api_router.include_router(documents_router)
api_router.include_router(business_router)
api_router.include_router(admin_router)
api_router.include_router(chat_router)
api_router.include_router(academy_router)
api_router.include_router(investment_router)
api_router.include_router(portfolio_router)
api_router.include_router(financial_router)
api_router.include_router(candlestick_router)

