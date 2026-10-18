from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_CANONICAL_DB_URL = f"sqlite:///{(_BACKEND_DIR / 'sahay_dev.db').as_posix()}"


class Settings(BaseSettings):
    """Core application settings loaded from environment variables."""

    PROJECT_NAME: str = "Sahay-AI"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # CORS Configuration
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Database Configuration
    DATABASE_URL: str = _CANONICAL_DB_URL
    DATABASE_ECHO: bool = False
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 1800
    DB_POOL_TIMEOUT: int = 30

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v: str) -> str:
        if isinstance(v, str):
            clean = v.strip()
            # Support postgres:// and postgresql:// normalization for psycopg 3
            if clean.startswith("postgres://"):
                clean = "postgresql+psycopg://" + clean[len("postgres://"):]
            elif clean.startswith("postgresql://") and not clean.startswith("postgresql+"):
                clean = "postgresql+psycopg://" + clean[len("postgresql://"):]
            # Canonicalize relative SQLite URLs so root vs backend working directory always points to backend/sahay_dev.db
            if clean.startswith("sqlite:///./"):
                rel_path = clean[len("sqlite:///./"):]
                return f"sqlite:///{(_BACKEND_DIR / rel_path).resolve().as_posix()}"
            elif clean.startswith("sqlite:///") and not clean.startswith("sqlite:////") and ":" not in clean[10:]:
                db_name = clean[len("sqlite:///"):]
                return f"sqlite:///{(_BACKEND_DIR / db_name).resolve().as_posix()}"
            return clean
        return v

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security Configuration
    JWT_SECRET_KEY: str = "sahay_development_secret_key_at_least_32_characters_long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str, info) -> str:
        env = info.data.get("ENVIRONMENT", "development")
        debug = info.data.get("DEBUG", True)
        if env == "production" or not debug:
            if not v or v == "sahay_development_secret_key_at_least_32_characters_long":
                raise ValueError("JWT_SECRET_KEY must be securely set in environment for production.")
            if len(v) < 32:
                raise ValueError("JWT_SECRET_KEY must be at least 32 characters in production.")
        return v

    # LLM Settings (for RAG / AI Chat)
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
