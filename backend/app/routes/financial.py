"""Financial Intelligence & Digital Twin API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.financial_twin import FinancialTransaction
from app.schemas.financial import (
    FinancialHealthResponse,
    EmergencyFundResponse,
    IncomeLossSimulationRequest,
    IncomeLossSimulationResponse,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
    CreditScoreExplainerResponse,
    FinancialRiskIndicatorResponse,
    DigitalTwinWorkflowResponse,
    FraudAlert,
    TransactionCreateRequest,
    TransactionResponse,
)
from app.services.financial_service import (
    get_or_create_financial_record,
    get_financial_record_for_user_or_preview,
    calculate_financial_health,
    calculate_emergency_fund,
    simulate_income_loss,
    simulate_what_if,
    explain_credit_score,
    calculate_risk_indicator,
    detect_transaction_fraud,
    run_digital_twin_workflow,
)

router = APIRouter(prefix="/financial", tags=["Financial Intelligence & Digital Twin"])


@router.get("/health", response_model=FinancialHealthResponse)
def get_financial_health(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve deterministic financial health overview, DTI, savings rate, and grade."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return calculate_financial_health(record)


@router.get("/emergency-fund", response_model=EmergencyFundResponse)
def get_emergency_fund_analysis(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Analyze emergency reserve runway, 6-month target buffer, and deficit/surplus."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return calculate_emergency_fund(record)


@router.post("/simulate/income-loss", response_model=IncomeLossSimulationResponse)
def run_income_loss_simulation(
    request: IncomeLossSimulationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Simulate income reduction and project month-by-month reserve exhaustion."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return simulate_income_loss(record, request.income_reduction_pct)


@router.post("/simulate/what-if", response_model=WhatIfSimulationResponse)
def run_what_if_simulation(
    request: WhatIfSimulationRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Simulate what-if scenario (new loan EMI, revenue shock, inflation) against baseline."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return simulate_what_if(record, request)


@router.get("/credit-explainer", response_model=CreditScoreExplainerResponse)
def get_credit_score_explainer(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Educational factor breakdown of estimated credit score across 5 standard pillars."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return explain_credit_score(record)


@router.get("/risk-indicator", response_model=FinancialRiskIndicatorResponse)
def get_financial_risk_indicator(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Explainable 0-100 composite risk indicator across liquidity, leverage, and margins."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    return calculate_risk_indicator(record)


@router.post("/twin/workflow", response_model=DigitalTwinWorkflowResponse)
def execute_digital_twin_workflow(
    scenario_request: Optional[WhatIfSimulationRequest] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Execute end-to-end Valmont workflow: Analyze -> Simulate -> Predict -> Assess Risk -> Decide."""
    scenario_dict = scenario_request.model_dump() if scenario_request else None
    user_id = current_user.id if current_user else None
    return run_digital_twin_workflow(db, user_id, scenario_dict)


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve categorized financial transactions and audit flags."""
    txs = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.user_id == current_user.id)
        .order_by(FinancialTransaction.transaction_date.desc())
        .limit(100)
        .all()
    )
    return [
        TransactionResponse(
            id=t.id,
            title=t.title,
            category=t.category,
            amount=t.amount,
            transaction_type=t.transaction_type,
            is_essential=t.is_essential,
            vendor_name=t.vendor_name,
            is_flagged_fraud=t.is_flagged_fraud,
            fraud_reason=t.fraud_reason,
            created_at=t.created_at.isoformat(),
        )
        for t in txs
    ]


@router.post("/transactions", response_model=TransactionResponse)
def record_transaction(
    request: TransactionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log financial transaction with real-time rule-based fraud & anomaly detection."""
    recent_txs = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.user_id == current_user.id)
        .order_by(FinancialTransaction.transaction_date.desc())
        .limit(20)
        .all()
    )

    is_flagged, reason = detect_transaction_fraud(
        title=request.title,
        amount=request.amount,
        category=request.category,
        recent_transactions=recent_txs,
    )

    tx = FinancialTransaction(
        user_id=current_user.id,
        title=request.title,
        category=request.category,
        amount=request.amount,
        transaction_type=request.transaction_type,
        is_essential=request.is_essential,
        vendor_name=request.vendor_name,
        is_flagged_fraud=is_flagged,
        fraud_reason=reason,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return TransactionResponse(
        id=tx.id,
        title=tx.title,
        category=tx.category,
        amount=tx.amount,
        transaction_type=tx.transaction_type,
        is_essential=tx.is_essential,
        vendor_name=tx.vendor_name,
        is_flagged_fraud=tx.is_flagged_fraud,
        fraud_reason=tx.fraud_reason,
        created_at=tx.created_at.isoformat(),
    )


@router.get("/fraud-alerts", response_model=List[FraudAlert])
def get_fraud_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve actionable security & fraud alerts detected in transaction history."""
    flagged = (
        db.query(FinancialTransaction)
        .filter(
            FinancialTransaction.user_id == current_user.id,
            FinancialTransaction.is_flagged_fraud.is_(True),
        )
        .order_by(FinancialTransaction.transaction_date.desc())
        .limit(20)
        .all()
    )

    alerts: List[FraudAlert] = []
    for f in flagged:
        severity = "high" if "keyword" in (f.fraud_reason or "") or f.amount >= 200000 else "medium"
        alerts.append(
            FraudAlert(
                id=f.id,
                severity=severity,
                title=f"Flagged Transaction: {f.title} (₹{f.amount:,.0f})",
                description=f.fraud_reason or "Unusual pattern detected",
                suggested_action="Review vendor credentials and verify authorization before debit clearance.",
            )
        )

    return alerts
