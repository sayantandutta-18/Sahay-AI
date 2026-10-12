"""Pydantic schemas for business profiles."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BusinessProfileBase(BaseModel):
    business_name: str = Field(default="", max_length=160, description="Enterprise registered or trade name")
    business_type: str = Field(default="manufacturing", description="manufacturing, services, trading, agriculture_allied")
    category: str = Field(default="micro", description="micro, small, medium")
    annual_turnover: float = Field(default=0.0, ge=0.0, description="Annual turnover in INR")
    monthly_revenue: float = Field(default=0.0, ge=0.0, description="Average monthly sales in INR")
    monthly_expense: float = Field(default=0.0, ge=0.0, description="Average monthly expenses in INR")
    existing_loans: float = Field(default=0.0, ge=0.0, description="Total outstanding formal credit in INR")
    gender: str = Field(default="unspecified", description="female, male, other, unspecified")
    caste_category: str = Field(default="general", description="general, obc, sc, st, minority")
    has_udyam: bool = Field(default=False, description="Has Udyam MSME registration")
    has_gst: bool = Field(default=False, description="Has active GSTIN")
    has_pan: bool = Field(default=False, description="Has PAN card")
    has_bank_account: bool = Field(default=False, description="Has bank current or savings account")
    months_in_operation: int = Field(default=12, ge=0, description="Months enterprise has been operational")


class BusinessProfileCreate(BusinessProfileBase):
    pass


class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    category: Optional[str] = None
    annual_turnover: Optional[float] = None
    monthly_revenue: Optional[float] = None
    monthly_expense: Optional[float] = None
    existing_loans: Optional[float] = None
    gender: Optional[str] = None
    caste_category: Optional[str] = None
    has_udyam: Optional[bool] = None
    has_gst: Optional[bool] = None
    has_pan: Optional[bool] = None
    has_bank_account: Optional[bool] = None
    months_in_operation: Optional[int] = None


class BusinessProfileResponse(BusinessProfileBase):
    id: str
    user_id: str
    completion_percentage: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


def calculate_profile_completion(data: dict) -> int:
    """Deterministic formula calculating profile completeness percentage."""
    fields = [
        "business_name",
        "business_type",
        "category",
        "annual_turnover",
        "monthly_revenue",
        "monthly_expense",
        "gender",
        "has_pan",
        "has_bank_account",
        "has_udyam",
    ]
    completed_count = 0
    for f in fields:
        val = data.get(f)
        if val is not None and val != "" and val != 0.0 and val != "unspecified":
            completed_count += 1
        elif isinstance(val, bool) and val is True:
            completed_count += 1

    return int(round((completed_count / len(fields)) * 100))
