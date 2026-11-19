"""Pydantic schemas and strict data validation for Government Schemes and Rules."""

import re
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator


class SchemeDocumentRequirementResponse(BaseModel):
    id: str
    scheme_id: str
    document_type: str
    title: str
    description: str
    mandatory: bool
    how_to_get_url: str

    model_config = ConfigDict(from_attributes=True)


class SchemeRuleResponse(BaseModel):
    id: str
    scheme_id: str
    field: str
    operator: str
    value: str
    weight: float
    explanation: str
    is_hard_rule: bool
    rule_version: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Strict Validation Models for Authoritative Seed & Ingestion
# -------------------------------------------------------------
class SchemeDocumentValidationItem(BaseModel):
    document_type: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    description: str = Field(default="")
    mandatory: bool = True
    how_to_get_url: str = Field(default="")

    @field_validator("title", "document_type")
    @classmethod
    def validate_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Document requirement field cannot be empty.")
        return v.strip()


class SchemeRuleValidationItem(BaseModel):
    field: str = Field(..., min_length=1)
    operator: str = Field(..., min_length=1)
    value: str = Field(..., min_length=1)
    weight: float = 0.0
    is_hard_rule: bool = True
    explanation: str = Field(..., min_length=1)
    rule_version: str = Field(default="1.0.0")

    @field_validator("field", "operator", "value", "explanation")
    @classmethod
    def validate_rule_fields(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Scheme rule field cannot be empty.")
        return v.strip()


class SchemeDataValidationRecord(BaseModel):
    """Strict schema validation ensuring no unverified, empty or sourceless scheme is accepted."""

    name: str = Field(..., min_length=3, max_length=200)
    slug: str = Field(..., min_length=2, max_length=200)
    provider: str = Field(..., min_length=2, max_length=160)
    scheme_type: str = Field(..., description="subsidy, loan, grant, training, equity_support")
    short_description: str = Field(..., min_length=10)
    detailed_benefits: str = Field(..., min_length=10)
    max_amount: float = Field(default=0.0, ge=0.0)
    interest_subsidy_pct: float = Field(default=0.0, ge=0.0, le=100.0)
    states_served: str = Field(default="ALL")
    target_sectors: str = Field(default="ALL")
    official_url: str = Field(...)
    last_verified_at: str = Field(...)
    deadline: str = Field(default="Ongoing (Open year-round)")
    verifier: str = Field(..., min_length=3)
    verification_status: str = Field(default="verified")
    language_coverage: str = Field(default="en,hi,bn")
    publication_status: str = Field(default="published")
    is_active: bool = True
    documents: List[SchemeDocumentValidationItem] = Field(..., min_length=1)
    rules: List[SchemeRuleValidationItem] = Field(default_factory=list)

    @field_validator("official_url")
    @classmethod
    def validate_official_url(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Official source URL cannot be empty.")
        if not (clean.startswith("http://") or clean.startswith("https://")):
            raise ValueError("Official source URL must be a valid HTTP or HTTPS address.")
        return clean

    @field_validator("last_verified_at")
    @classmethod
    def validate_verification_date(cls, v: str) -> str:
        clean = v.strip()
        if not clean or not re.match(r"^\d{4}-\d{2}-\d{2}$", clean):
            raise ValueError("Last-verified date must be in valid ISO format YYYY-MM-DD.")
        try:
            datetime.strptime(clean, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid calendar date in last_verified_at.")
        return clean

    @field_validator("name", "provider", "short_description", "detailed_benefits", "verifier")
    @classmethod
    def validate_required_text(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Required text field cannot be empty.")
        return v.strip()

    @field_validator("documents")
    @classmethod
    def validate_documents_not_empty(cls, v: List[SchemeDocumentValidationItem]) -> List[SchemeDocumentValidationItem]:
        if not v or len(v) == 0:
            raise ValueError("Scheme must define at least one required document checklist item.")
        return v


# -------------------------------------------------------------
# Base API Schemas
# -------------------------------------------------------------
class SchemeBase(BaseModel):
    name: str = Field(..., max_length=200)
    slug: str = Field(..., max_length=200)
    provider: str = Field(..., max_length=160)
    scheme_type: str = Field(..., description="subsidy, loan, grant, training, equity_support")
    short_description: str
    detailed_benefits: str
    max_amount: float = Field(default=0.0)
    interest_subsidy_pct: float = Field(default=0.0)
    states_served: str = Field(default="ALL")
    target_sectors: str = Field(default="ALL")
    official_url: str
    last_verified_at: str
    deadline: str = Field(default="Ongoing (Open year-round)")
    verifier: str = Field(default="Sahay Verification Team")
    verification_status: str = Field(default="verified", description="verified, unverified, outdated")
    language_coverage: str = Field(default="en,hi,bn")
    publication_status: str = Field(default="published", description="draft, published, archived")
    is_active: bool = True


class SchemeCreate(SchemeBase):
    pass


class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    scheme_type: Optional[str] = None
    short_description: Optional[str] = None
    detailed_benefits: Optional[str] = None
    max_amount: Optional[float] = None
    interest_subsidy_pct: Optional[float] = None
    states_served: Optional[str] = None
    target_sectors: Optional[str] = None
    official_url: Optional[str] = None
    last_verified_at: Optional[str] = None
    deadline: Optional[str] = None
    verifier: Optional[str] = None
    verification_status: Optional[str] = None
    language_coverage: Optional[str] = None
    publication_status: Optional[str] = None
    is_active: Optional[bool] = None


class SchemeResponse(SchemeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    documents: List[SchemeDocumentRequirementResponse] = []
    rules: List[SchemeRuleResponse] = []

    model_config = ConfigDict(from_attributes=True)
