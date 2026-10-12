"""Pydantic schemas for Government Schemes and Rules."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


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
