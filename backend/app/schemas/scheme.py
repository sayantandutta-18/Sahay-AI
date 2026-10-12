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
    is_active: bool = True


class SchemeCreate(SchemeBase):
    pass


class SchemeResponse(SchemeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    documents: List[SchemeDocumentRequirementResponse] = []
    rules: List[SchemeRuleResponse] = []

    model_config = ConfigDict(from_attributes=True)
