"""Pydantic schemas for administrative audit logging."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    action: str
    resource_type: str
    resource_id: str
    details: str
    ip_address: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStatsResponse(BaseModel):
    total_users: int
    total_schemes: int
    total_applications: int
    total_verified_documents: int
    total_audit_events: int
    timestamp: str
