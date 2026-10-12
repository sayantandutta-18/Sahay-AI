"""Pydantic schemas for Financial Intelligence & Digital Twin engines."""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MonthTrajectory(BaseModel):
    month: int
    starting_balance: float
    income: float
    expenses: float
    ending_balance: float
    runway_status: str  # solvent, exhausted


class FinancialHealthResponse(BaseModel):
    monthly_income: float
    monthly_expenses: float
    monthly_debt_emi: float
    net_cash_flow: float
    debt_to_income_ratio: float
    savings_rate_pct: float
    emergency_fund_months: float
    health_grade: str  # A, B, C, D
    key_strengths: List[str]
    risk_flags: List[str]


class EmergencyFundResponse(BaseModel):
    essential_monthly_expenses: float
    liquid_savings: float
    current_runway_months: float
    recommended_target_amount: float
    shortfall_or_surplus: float
    status: str  # critical, warning, adequate, robust
    actionable_plan: List[str]


class IncomeLossSimulationRequest(BaseModel):
    income_reduction_pct: float = Field(default=50.0, ge=0.0, le=100.0)


class IncomeLossSimulationResponse(BaseModel):
    income_reduction_pct: float
    months_until_exhaustion: float
    monthly_burn_rate: float
    austere_monthly_expenses: float
    runway_with_austerity_months: float
    trajectory: List[MonthTrajectory]


class WhatIfSimulationRequest(BaseModel):
    scenario_type: str = "new_loan"  # new_loan, revenue_shock, expense_inflation, custom
    additional_monthly_debt: float = 0.0
    revenue_change_pct: float = 0.0
    expense_change_pct: float = 0.0
    description: Optional[str] = None


class WhatIfSimulationResponse(BaseModel):
    scenario_type: str
    scenario_description: str
    baseline: Dict[str, float]
    simulated: Dict[str, float]
    deltas: Dict[str, float]
    recommendation: str
    verdict: str  # safe, caution, critical


class CreditFactor(BaseModel):
    factor: str
    weight_pct: int
    status: str  # excellent, good, needs_attention, critical
    impact: str
    recommendation: str


class CreditScoreExplainerResponse(BaseModel):
    estimated_score: int
    score_band: str
    factors: List[CreditFactor]
    compliance_disclaimer: str


class RiskDimension(BaseModel):
    dimension: str
    score: float  # 0 to 100
    weight: float
    assessment: str


class FinancialRiskIndicatorResponse(BaseModel):
    overall_risk_score: float  # 0 to 100
    risk_level: str  # Low, Moderate, Elevated, High
    dimensions: List[RiskDimension]
    top_vulnerabilities: List[str]
    mitigation_steps: List[str]
    compliance_disclaimer: str


class FraudAlert(BaseModel):
    id: str
    severity: str  # low, medium, high
    title: str
    description: str
    suggested_action: str


class DigitalTwinDecision(BaseModel):
    action: str  # PROCEED, PROCEED_WITH_CAUTION, DO_NOT_PROCEED
    summary: str
    checklist: List[str]


class DigitalTwinWorkflowResponse(BaseModel):
    analysis: FinancialHealthResponse
    emergency_fund: EmergencyFundResponse
    risk_indicator: FinancialRiskIndicatorResponse
    simulation: WhatIfSimulationResponse
    decision: DigitalTwinDecision


class TransactionCreateRequest(BaseModel):
    title: str
    category: str
    amount: float
    transaction_type: str = "expense"
    is_essential: bool = True
    vendor_name: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    title: str
    category: str
    amount: float
    transaction_type: str
    is_essential: bool
    vendor_name: Optional[str]
    is_flagged_fraud: bool
    fraud_reason: Optional[str]
    created_at: str
