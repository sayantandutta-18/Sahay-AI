"""Pydantic schemas for the Deterministic Eligibility Engine."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.scheme import SchemeDocumentRequirementResponse


class EligibilityCheckRequest(BaseModel):
    """Optional manual criteria check payload. If omitted, uses authenticated user's profile."""

    state: Optional[str] = None
    district: Optional[str] = None
    business_type: Optional[str] = None
    category: Optional[str] = None
    annual_turnover: Optional[float] = None
    gender: Optional[str] = None
    caste_category: Optional[str] = None
    has_udyam: Optional[bool] = None
    has_gst: Optional[bool] = None
    has_pan: Optional[bool] = None
    has_bank_account: Optional[bool] = None
    has_aadhaar: Optional[bool] = None
    months_in_operation: Optional[int] = None
    age: Optional[int] = None


class RuleEvaluationDetail(BaseModel):
    """Granular audit result for a single scheme rule evaluation."""

    field: str
    operator: str
    expected_value: str
    actual_value: Optional[str] = None
    status: str = Field(..., description="met, not_met, missing_information")
    explanation: str
    is_hard_rule: bool = True


class SchemeMatchResult(BaseModel):
    """Auditable result for a single scheme evaluation."""

    scheme_id: str
    scheme_name: str
    slug: str
    provider: str
    scheme_type: str
    max_amount: float
    official_url: str
    is_eligible: bool
    eligibility_verdict: str = Field(
        default="eligible",
        description="eligible, not_eligible, more_information_needed",
    )
    match_score: int = Field(..., ge=0, le=100, description="Match score from 0 to 100")
    passed_hard_rules: List[str] = []
    failed_hard_rules: List[str] = []
    missing_info_rules: List[str] = []
    evaluated_rules: List[RuleEvaluationDetail] = []
    soft_rule_breakdown: List[Dict[str, Any]] = []
    missing_requirements: List[str] = []
    near_miss_unlock_path: Optional[str] = None
    rule_version: str
    verification_status: str = "verified"
    last_verified_at: Optional[str] = None
    verifier: Optional[str] = None
    deadline: Optional[str] = None
    documents: List[SchemeDocumentRequirementResponse] = []


class EligibilitySummaryResponse(BaseModel):
    """Aggregated evaluation across all active verified schemes."""

    evaluated_schemes_count: int
    eligible_count: int
    near_match_count: int
    more_info_needed_count: int = 0
    evaluated_at: str
    rule_authority: str = "Sahay Deterministic Rules Engine (Auditable)"
    matches: List[SchemeMatchResult]
