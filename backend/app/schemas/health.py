"""Pydantic schemas for health and system status endpoints."""

from typing import Dict, Any
from pydantic import BaseModel, Field


class DatabaseHealth(BaseModel):
    """Database connectivity status schema."""
    status: str = Field(..., description="'connected' or 'disconnected'")
    url: str | None = Field(default=None, description="Redacted connection string or driver")
    error: str | None = Field(default=None, description="Error message if connection failed")
    dialect: str | None = Field(default=None, description="Database dialect (e.g. sqlite, postgresql)")
    table_count: int | None = Field(default=None, description="Active table count in database")
    latency_ms: float | None = Field(default=None, description="Ping query latency in milliseconds")


class HealthResponse(BaseModel):
    """Full health check response schema."""
    status: str = Field(default="healthy", description="Overall service status")
    project: str = Field(..., description="Project name")
    version: str = Field(..., description="Application version")
    environment: str = Field(..., description="Active environment (development/staging/production)")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    database: DatabaseHealth = Field(..., description="Database connection health")
    services: Dict[str, Any] = Field(default_factory=dict, description="Status of auxiliary services")
