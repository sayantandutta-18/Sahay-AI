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
)
from app.services.scheme_service import get_all_schemes


def evaluate_rule_operator(
    actual_value: Any, operator: str, rule_value: str
) -> Tuple[bool, str]:
    """Deterministically evaluate an individual rule condition against profile attribute."""
    if actual_value is None:
        return False, "Parameter not provided in entrepreneur profile"

    op = operator.lower().strip()

    # 1. Boolean operator
    if op == "boolean_is":
        target_bool = rule_value.lower() in ("true", "1", "yes")
        actual_bool = bool(actual_value)
        passed = actual_bool == target_bool
        return passed, f"Expected {target_bool}, found {actual_bool}"

    # 2. String equality
    if op == "eq":
        passed = str(actual_value).strip().lower() == rule_value.strip().lower()
        return passed, f"Expected '{rule_value}', found '{actual_value}'"

    if op == "neq":
        passed = str(actual_value).strip().lower() != rule_value.strip().lower()
        return passed, f"Expected not '{rule_value}', found '{actual_value}'"

    # 3. Inclusion ('in')
    if op == "in":
        allowed_items = [item.strip().lower() for item in rule_value.split(",")]
        # If actual_value is 'ALL', it matches
        if str(actual_value).strip().lower() == "all":
            return True, "All categories accepted"
        passed = str(actual_value).strip().lower() in allowed_items
        return passed, f"Value '{actual_value}' in [{', '.join(allowed_items)}]"

    # 4. Numeric comparisons (lte, gte, lt, gt)
    try:
        actual_num = float(actual_value)
        rule_num = float(rule_value)
    except (ValueError, TypeError):
        return False, f"Non-numeric comparison between '{actual_value}' and '{rule_value}'"

    if op == "lte":
        return actual_num <= rule_num, f"{actual_num} <= {rule_num}"
    elif op == "gte":
        return actual_num >= rule_num, f"{actual_num} >= {rule_num}"
    elif op == "lt":
        return actual_num < rule_num, f"{actual_num} < {rule_num}"
    elif op == "gt":
        return actual_num > rule_num, f"{actual_num} > {rule_num}"

    return False, f"Unknown operator '{operator}'"


def evaluate_scheme_eligibility(
    scheme: Scheme, profile_data: Dict[str, Any]
) -> SchemeMatchResult:
    """Evaluate a single scheme against user profile attributes with auditable rule reporting."""
    rules = scheme.rules
    rule_version = rules[0].rule_version if rules else "1.0.0"

    passed_hard_rules: List[str] = []
    failed_hard_rules: List[str] = []
    missing_requirements: List[str] = []
    soft_rule_breakdown: List[Dict[str, Any]] = []

    hard_rules_passed = True
    base_score = 50  # Baseline score for passing all hard rules
    soft_score_earned = 0.0
    total_soft_weight = 0.0

    for rule in rules:
        if not rule.is_active:
            continue

        actual_val = profile_data.get(rule.field)
        passed, debug_reason = evaluate_rule_operator(actual_val, rule.operator, rule.value)

        if rule.is_hard_rule:
            if passed:
                passed_hard_rules.append(f"{rule.field.replace('_', ' ').title()}: {rule.explanation}")
            else:
                hard_rules_passed = False
                failed_hard_rules.append(f"{rule.field.replace('_', ' ').title()}: {rule.explanation}")
                missing_requirements.append(rule.explanation)
        else:
            # Soft rule / weighted point bonus
            total_soft_weight += rule.weight
            if passed:
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

    # Calculate final match score (0 - 100)
    if not hard_rules_passed:
        # Near-match scoring capped at 45%
        fit_score = max(10, min(45, int(45 - len(failed_hard_rules) * 10)))
        is_eligible = False
    else:
        # Scaled between 60 and 100 based on soft rules
        if total_soft_weight > 0:
            soft_ratio = soft_score_earned / total_soft_weight
            fit_score = int(60 + round(soft_ratio * 40))
        else:
            fit_score = 85
        is_eligible = True

    # Deterministic near-miss unlock recommendation
    near_miss_unlock_path = None
    if not is_eligible and failed_hard_rules:
        near_miss_unlock_path = (
            f"To qualify for {scheme.name}: Address {failed_hard_rules[0]} "
            f"or update your enterprise profile if parameters were entered erroneously."
        )
    elif is_eligible and fit_score < 90:
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
        match_score=fit_score,
        passed_hard_rules=passed_hard_rules,
        failed_hard_rules=failed_hard_rules,
        soft_rule_breakdown=soft_rule_breakdown,
        missing_requirements=missing_requirements,
        near_miss_unlock_path=near_miss_unlock_path,
        rule_version=rule_version,
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

    # Rank results: eligible schemes first sorted by match_score descending
    results.sort(key=lambda x: (x.is_eligible, x.match_score), reverse=True)

    eligible_count = sum(1 for r in results if r.is_eligible)
    near_match_count = sum(1 for r in results if not r.is_eligible and r.match_score >= 30)

    return EligibilitySummaryResponse(
        evaluated_schemes_count=len(schemes),
        eligible_count=eligible_count,
        near_match_count=near_match_count,
        evaluated_at=datetime.now(timezone.utc).isoformat(),
        matches=results,
    )
