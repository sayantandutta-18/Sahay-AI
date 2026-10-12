"""Pydantic schemas for Applications, Checklist, Documents Vault, and Consents."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class UserDocumentBase(BaseModel):
    document_type: str = Field(..., description="pan, udyam, bank_statement, etc.")
    file_name: str = Field(..., max_length=255)
    file_size_bytes: int = Field(default=0, ge=0)
    display_label: Optional[str] = ""
    purpose: Optional[str] = "scheme_verification"
    mime_type: Optional[str] = "application/pdf"
    checksum_sha256: Optional[str] = ""
    expiry_date: Optional[str] = None


class UserDocumentCreate(UserDocumentBase):
    application_id: Optional[str] = None


class UserDocumentUpdate(BaseModel):
    display_label: Optional[str] = None
    purpose: Optional[str] = None
    application_id: Optional[str] = None
    expiry_date: Optional[str] = None


class UserDocumentResponse(UserDocumentBase):
    id: str
    user_id: str
    application_id: Optional[str] = None
    verification_status: str
    rejection_reason: str
    storage_path: Optional[str] = ""
    storage_key: Optional[str] = ""
    is_deleted: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ApplicationStatusHistoryResponse(BaseModel):
    id: str
    application_id: str
    from_status: str
    to_status: str
    actor_id: str
    actor_role: str
    change_reason: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationChecklistItemResponse(BaseModel):
    id: str
    application_id: str
    title: str
    document_type: str
    is_mandatory: bool
    is_completed: bool
    user_document_id: Optional[str] = None
    validation_message: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChecklistItemUpdate(BaseModel):
    is_completed: Optional[bool] = None
    user_document_id: Optional[str] = None
    vault_document_id: Optional[str] = None
    validation_message: Optional[str] = None
    notes: Optional[str] = None


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
    due_date: Optional[datetime] = None


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(
        ...,
        description="draft, documents_needed, ready_to_submit, submitted, in_review, action_required, approved, rejected, withdrawn",
    )
    notes: Optional[str] = None
    change_reason: Optional[str] = "User status update"
    next_action: Optional[str] = None
    due_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    scheme_name: Optional[str] = None
    status: str
    progress_percentage: int
    due_date: Optional[datetime] = None
    next_action: str
    lender_consent_granted: bool
    consent_granted_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    notes: str
    created_at: datetime
    updated_at: datetime
    documents: List[UserDocumentResponse] = []
    consents: List[DataSharingConsentResponse] = []
    status_history: List[ApplicationStatusHistoryResponse] = []
    checklist_items: List[ApplicationChecklistItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
