"""System health and status routes."""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.database.session import check_db_health
from app.schemas.health import HealthResponse, DatabaseHealth

router = APIRouter(tags=["System"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return system health, configuration metadata, and database connection state."""
    db_result = check_db_health()
    db_health = DatabaseHealth(
        status=db_result.get("status", "disconnected"),
        url=db_result.get("url"),
        error=db_result.get("error"),
        dialect=db_result.get("dialect"),
        table_count=db_result.get("table_count"),
        latency_ms=db_result.get("latency_ms"),
    )

    overall_status = "healthy" if db_health.status == "connected" else "degraded"

    return HealthResponse(
        status=overall_status,
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
        database=db_health,
        services={
            "redis_configured": bool(settings.REDIS_URL),
            "llm_provider": settings.LLM_PROVIDER,
        },
    )
