"""Database connection, engine configuration, and session management."""

import time
import logging
from typing import Generator
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings, _CANONICAL_DB_URL

logger = logging.getLogger("sahay.database")

# Build connection arguments and pooling parameters
connect_args = {}
engine_kwargs = {
    "echo": settings.DATABASE_ECHO,
    "pool_pre_ping": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine_kwargs["connect_args"] = connect_args
else:
    # Production PostgreSQL pooling
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_recycle"] = settings.DB_POOL_RECYCLE
    engine_kwargs["pool_timeout"] = settings.DB_POOL_TIMEOUT

try:
    engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
    # Quick probe if PostgreSQL to catch early connection failure and fall back
    if not settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as probe:
            probe.execute(text("SELECT 1"))
except Exception as init_exc:
    if not settings.DATABASE_URL.startswith("sqlite"):
        logger.warning(
            "Primary database connection failed (%s). Falling back to canonical local SQLite.",
            init_exc,
        )
        engine = create_engine(
            _CANONICAL_DB_URL,
            connect_args={"check_same_thread": False},
            echo=settings.DATABASE_ECHO,
            pool_pre_ping=True,
        )
    else:
        raise init_exc

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> dict:
    """Execute a query to verify database connectivity, returning latency and metadata."""
    start_time = time.perf_counter()
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        inspector = inspect(engine)
        table_count = len(inspector.get_table_names())

        raw_url = str(engine.url)
        if "@" in raw_url:
            masked_url = raw_url.split("@")[-1]
            dialect = raw_url.split("://")[0]
            masked_url = f"{dialect}://***@{masked_url}"
        else:
            masked_url = raw_url.split("://")[0] + "://..."

        return {
            "status": "connected",
            "url": masked_url,
            "dialect": engine.dialect.name,
            "table_count": table_count,
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        return {
            "status": "disconnected",
            "error": str(exc),
            "dialect": engine.dialect.name if hasattr(engine, "dialect") else "unknown",
        }
