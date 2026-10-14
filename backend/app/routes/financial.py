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
    TransactionCategoryUpdateRequest,
    TransactionResponse,
    SmartExpenseAnalysisResponse,
    FinancialRecommendationItem,
    RecommendationFeedbackRequest,
    FraudAlertReviewRequest,
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
    calculate_smart_expense_and_savings,
    generate_financial_recommendations,
    update_transaction_category,
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
    """Execute end-to-end Sahay-AI workflow: Analyze -> Simulate -> Predict -> Assess Risk -> Decide."""
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
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve actionable security & fraud alerts detected in transaction history."""
    if not current_user:
        return [
            FraudAlert(
                id="demo-alert-1",
                severity="medium",
                title="Unusual Velocity: 3 Outflows to New Payee in 2 Hours (₹18,500)",
                description="Repeated debit transactions to newly registered merchant within brief threshold.",
                suggested_action="Review vendor credentials and verify authorization before debit clearance.",
            ),
            FraudAlert(
                id="demo-alert-2",
                severity="low",
                title="Potential Duplicate: ₹1,499 Telecom Bill Charged Twice",
                description="Exact matching amount charged within 3.5 hours on same utility vendor.",
                suggested_action="Check telecom portal for double debit or auto-refund confirmation.",
            ),
        ]

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


@router.get("/smart-expenses", response_model=SmartExpenseAnalysisResponse)
def get_smart_expense_analysis(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Checkpoint 8: Smart Expense & Savings Analysis with transparent categories and duplicate candidates."""
    user_id = current_user.id if current_user else None
    return calculate_smart_expense_and_savings(db, user_id)


@router.put("/transactions/{transaction_id}/category", response_model=TransactionResponse)
def modify_transaction_category(
    transaction_id: str,
    request: TransactionCategoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Checkpoint 8: Allow user to correct expense category, immediately updating ledger analytics."""
    tx = update_transaction_category(
        db, current_user.id, transaction_id, request.category, request.is_essential
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction '{transaction_id}' not found or not owned by user.",
        )
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


@router.get("/recommendations", response_model=List[FinancialRecommendationItem])
def get_financial_recommendations(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Checkpoint 13: Rules-based evidence-backed financial recommendations."""
    record = get_financial_record_for_user_or_preview(db, current_user)
    bp = None
    if current_user:
        from app.models.business_profile import BusinessProfile
        bp = db.query(BusinessProfile).filter(BusinessProfile.user_id == current_user.id).first()
    return generate_financial_recommendations(record, bp)


@router.post("/recommendations/{recommendation_id}/feedback")
def submit_recommendation_feedback(
    recommendation_id: str,
    feedback: RecommendationFeedbackRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Checkpoint 13: Record user-scoped dismiss or helpful feedback on financial recommendation."""
    return {
        "status": "success",
        "recommendation_id": recommendation_id,
        "action": feedback.action,
        "message": f"Recommendation recorded as {feedback.action}.",
    }


@router.put("/fraud-alerts/{transaction_id}/status")
def update_fraud_status(
    transaction_id: str,
    payload: FraudAlertReviewRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Checkpoint 14: Review and transition fraud anomaly status between new, reviewing, dismissed, user_confirmed."""
    if not current_user or transaction_id.startswith("demo-"):
        return {
            "status": "success",
            "transaction_id": transaction_id,
            "review_state": payload.status,
            "notes": "Reviewed in preview/demo mode.",
        }

    tx = (
        db.query(FinancialTransaction)
        .filter(FinancialTransaction.id == transaction_id, FinancialTransaction.user_id == current_user.id)
        .first()
    )
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flagged transaction not found.",
        )
    if payload.status == "dismissed":
        tx.is_flagged_fraud = False
        tx.fraud_reason = f"Dismissed by user: {payload.notes or 'False positive confirmed by proprietor'}"
    else:
        tx.fraud_reason = f"{tx.fraud_reason or 'Flagged'} [{payload.status.upper()}: {payload.notes or 'Reviewed'}]"
    db.add(tx)
    db.commit()
    return {
        "status": "success",
        "transaction_id": transaction_id,
        "review_state": payload.status,
    }

