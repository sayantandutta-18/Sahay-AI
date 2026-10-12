"""Pydantic schemas for Applications, Documents, and Consents."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class UserDocumentBase(BaseModel):
    document_type: str = Field(..., description="pan, udyam, bank_statement, etc.")
    file_name: str = Field(..., max_length=255)
    file_size_bytes: int = Field(default=0, ge=0)
    storage_path: str = Field(default="")
    expiry_date: Optional[str] = None


class UserDocumentCreate(UserDocumentBase):
    application_id: Optional[str] = None


class UserDocumentResponse(UserDocumentBase):
    id: str
    user_id: str
    application_id: Optional[str] = None
    verification_status: str
    rejection_reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DataSharingConsentCreate(BaseModel):
    application_id: str
    partner_name: str
    shared_fields: str = Field(..., description="Comma-separated field list")


class DataSharingConsentResponse(BaseModel):
    id: str
    user_id: str
    application_id: str
    partner_name: str
    shared_fields: str
    is_revoked: bool
    granted_at: datetime
    revoked_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    scheme_id: str
    notes: Optional[str] = ""


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., description="not_started, in_progress, submitted, under_review, approved, rejected")
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    scheme_name: Optional[str] = None
    status: str
    progress_percentage: int
    lender_consent_granted: bool
    consent_granted_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    notes: str
    created_at: datetime
    updated_at: datetime
    documents: List[UserDocumentResponse] = []
    consents: List[DataSharingConsentResponse] = []

    model_config = ConfigDict(from_attributes=True)
