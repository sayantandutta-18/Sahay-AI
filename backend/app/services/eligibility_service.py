"""Sahay Deterministic Eligibility Engine.

This service is the SOLE AUTHORITY for scheme eligibility decisions.
All calculations are strictly deterministic, auditable, and version-tracked.
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from app.models.scheme import Scheme, SchemeRule
from app.schemas.eligibility import (
    EligibilityCheckRequest,
    SchemeMatchResult,
    EligibilitySummaryResponse,
    RuleEvaluationDetail,
)
from app.schemas.scheme import SchemeDocumentRequirementResponse
from app.services.scheme_service import get_all_schemes


def evaluate_rule_operator(
    actual_value: Any, operator: str, rule_value: str
) -> Tuple[str, str]:
    """
    Deterministically evaluate an individual rule condition against profile attribute.
    Returns:
        status: 'met', 'not_met', or 'missing_information'
        reason: detailed explanation of the evaluation
    """
    if actual_value is None or (isinstance(actual_value, str) and not actual_value.strip()):
        return "missing_information", "Parameter not provided in entrepreneur profile"

    op = operator.lower().strip()

    # 1. Boolean operator
    if op == "boolean_is":
        target_bool = rule_value.lower() in ("true", "1", "yes")
        actual_bool = bool(actual_value)
        status = "met" if actual_bool == target_bool else "not_met"
        return status, f"Expected {target_bool}, found {actual_bool}"

    # 2. String equality
    if op == "eq":
        passed = str(actual_value).strip().lower() == rule_value.strip().lower()
        status = "met" if passed else "not_met"
        return status, f"Expected '{rule_value}', found '{actual_value}'"

    if op == "neq":
        passed = str(actual_value).strip().lower() != rule_value.strip().lower()
        status = "met" if passed else "not_met"
        return status, f"Expected not '{rule_value}', found '{actual_value}'"

    # 3. Inclusion ('in')
    if op == "in":
        allowed_items = [item.strip().lower() for item in rule_value.split(",")]
        # If actual_value is 'ALL', it matches
        if str(actual_value).strip().lower() == "all":
            return "met", "All categories accepted"
        passed = str(actual_value).strip().lower() in allowed_items
        status = "met" if passed else "not_met"
        return status, f"Value '{actual_value}' in [{', '.join(allowed_items)}]"

    # 4. Numeric comparisons (lte, gte, lt, gt)
    try:
        actual_num = float(actual_value)
        rule_num = float(rule_value)
    except (ValueError, TypeError):
        return "not_met", f"Non-numeric comparison between '{actual_value}' and '{rule_value}'"

    if op == "lte":
        status = "met" if actual_num <= rule_num else "not_met"
        return status, f"{actual_num} <= {rule_num}"
    elif op == "gte":
        status = "met" if actual_num >= rule_num else "not_met"
        return status, f"{actual_num} >= {rule_num}"
    elif op == "lt":
        status = "met" if actual_num < rule_num else "not_met"
        return status, f"{actual_num} < {rule_num}"
    elif op == "gt":
        status = "met" if actual_num > rule_num else "not_met"
        return status, f"{actual_num} > {rule_num}"

    return "not_met", f"Unknown operator '{operator}'"


def evaluate_scheme_eligibility(
    scheme: Scheme, profile_data: Dict[str, Any]
) -> SchemeMatchResult:
    """Evaluate a single scheme against user profile attributes with auditable rule reporting."""
    rules = scheme.rules
    rule_version = rules[0].rule_version if rules else "1.0.0"

    passed_hard_rules: List[str] = []
    failed_hard_rules: List[str] = []
    missing_info_rules: List[str] = []
    evaluated_rules: List[RuleEvaluationDetail] = []
    missing_requirements: List[str] = []
    soft_rule_breakdown: List[Dict[str, Any]] = []

    soft_score_earned = 0.0
    total_soft_weight = 0.0

    for rule in rules:
        if not rule.is_active:
            continue

        actual_val = profile_data.get(rule.field)
        status, debug_reason = evaluate_rule_operator(actual_val, rule.operator, rule.value)

        evaluated_rules.append(
            RuleEvaluationDetail(
                field=rule.field,
                operator=rule.operator,
                expected_value=rule.value,
                actual_value=str(actual_val) if actual_val is not None else None,
                status=status,
                explanation=rule.explanation,
                is_hard_rule=rule.is_hard_rule,
            )
        )

        rule_label = f"{rule.field.replace('_', ' ').title()}: {rule.explanation}"

        if rule.is_hard_rule:
            if status == "met":
                passed_hard_rules.append(rule_label)
            elif status == "not_met":
                failed_hard_rules.append(rule_label)
                missing_requirements.append(rule.explanation)
            elif status == "missing_information":
                missing_info_rules.append(rule_label)
                missing_requirements.append(f"Missing parameter: {rule.field.replace('_', ' ').title()} ({rule.explanation})")
        else:
            # Soft rule / weighted point bonus
            total_soft_weight += rule.weight
            if status == "met":
                soft_score_earned += rule.weight
                soft_rule_breakdown.append({
                    "rule": rule.explanation,
                    "points": rule.weight,
                    "awarded": True,
                })
            else:
                soft_rule_breakdown.append({
                    "rule": rule.explanation,
                    "points": 0.0,
                    "awarded": False,
                })

    # Add missing mandatory document requirements
    for doc in scheme.documents:
        if doc.mandatory:
            # Check if profile has corresponding verified document flag
            doc_flag = f"has_{doc.document_type}"
            if doc_flag in profile_data and not profile_data[doc_flag]:
                missing_requirements.append(f"Mandatory Document: {doc.title}")

    # Determine 3-state Scheme Verdict
    if failed_hard_rules:
        # One or more hard criteria failed
        eligibility_verdict = "not_eligible"
        is_eligible = False
        fit_score = max(10, min(45, int(45 - len(failed_hard_rules) * 10)))
    elif missing_info_rules:
        # No hard criteria failed, but required information is missing
        eligibility_verdict = "more_information_needed"
        is_eligible = False
        fit_score = max(50, min(65, int(65 - len(missing_info_rules) * 5)))
    else:
        # All hard criteria met
        eligibility_verdict = "eligible"
        is_eligible = True
        if total_soft_weight > 0:
            soft_ratio = soft_score_earned / total_soft_weight
            fit_score = int(60 + round(soft_ratio * 40))
        else:
            fit_score = 85

    # Deterministic near-miss unlock recommendation
    near_miss_unlock_path = None
    if eligibility_verdict == "not_eligible" and failed_hard_rules:
        near_miss_unlock_path = (
            f"To qualify for {scheme.name}: Address {failed_hard_rules[0]} "
            f"or update your enterprise profile if parameters were entered erroneously."
        )
    elif eligibility_verdict == "more_information_needed" and missing_info_rules:
        near_miss_unlock_path = (
            f"Please specify {missing_info_rules[0]} in your enterprise questionnaire "
            f"to determine definitive eligibility for {scheme.name}."
        )
    elif eligibility_verdict == "eligible" and fit_score < 90:
        if not profile_data.get("has_udyam"):
            near_miss_unlock_path = "Register your enterprise on the Udyam portal to boost match priority and expedite bank processing."
        elif not profile_data.get("has_gst"):
            near_miss_unlock_path = "Obtaining a GSTIN certificate unlocks higher loan appraisal limits."

    return SchemeMatchResult(
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        slug=scheme.slug,
        provider=scheme.provider,
        scheme_type=scheme.scheme_type,
        max_amount=scheme.max_amount,
        official_url=scheme.official_url,
        is_eligible=is_eligible,
        eligibility_verdict=eligibility_verdict,
        match_score=fit_score,
        passed_hard_rules=passed_hard_rules,
        failed_hard_rules=failed_hard_rules,
        missing_info_rules=missing_info_rules,
        evaluated_rules=evaluated_rules,
        soft_rule_breakdown=soft_rule_breakdown,
        missing_requirements=missing_requirements,
        near_miss_unlock_path=near_miss_unlock_path,
        rule_version=rule_version,
        verification_status=getattr(scheme, "verification_status", "verified") or "verified",
        last_verified_at=getattr(scheme, "last_verified_at", None),
        verifier=getattr(scheme, "verifier", None),
        deadline=getattr(scheme, "deadline", None),
        documents=[
            SchemeDocumentRequirementResponse.model_validate(d)
            for d in getattr(scheme, "documents", [])
        ],
    )


def evaluate_all_schemes_for_profile(
    db: Session, profile_dict: Dict[str, Any]
) -> EligibilitySummaryResponse:
    """Evaluate all active schemes against profile parameters and return ranked results."""
    schemes = get_all_schemes(db)
    results: List[SchemeMatchResult] = []

    for scheme in schemes:
        res = evaluate_scheme_eligibility(scheme, profile_dict)
        results.append(res)

    # Rank results: eligible first, then more_information_needed, then not_eligible, sorted by match_score descending
    verdict_priority = {
        "eligible": 3,
        "more_information_needed": 2,
        "not_eligible": 1,
    }
    results.sort(
        key=lambda x: (verdict_priority.get(x.eligibility_verdict, 0), x.match_score),
        reverse=True,
    )

    eligible_count = sum(1 for r in results if r.eligibility_verdict == "eligible")
    more_info_needed_count = sum(1 for r in results if r.eligibility_verdict == "more_information_needed")
    near_match_count = sum(
        1 for r in results if r.eligibility_verdict != "eligible" and r.match_score >= 30
    )

    return EligibilitySummaryResponse(
        evaluated_schemes_count=len(schemes),
        eligible_count=eligible_count,
        near_match_count=near_match_count,
        more_info_needed_count=more_info_needed_count,
        evaluated_at=datetime.now(timezone.utc).isoformat(),
        matches=results,
    )
