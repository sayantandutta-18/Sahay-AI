"""Government scheme data management and authoritative verified seed records."""

import json
import logging
from datetime import datetime, date
from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.scheme import Scheme, SchemeDocumentRequirement, SchemeRule
from app.schemas.scheme import SchemeDataValidationRecord

logger = logging.getLogger("sahay.schemes")
_SCHEMES_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "schemes.json"
VERIFICATION_FRESHNESS_LIMIT_DAYS = 180


def compute_verification_status(
    official_url: Optional[str],
    last_verified_at: Optional[str],
    verification_status: Optional[str] = None,
    max_age_days: int = VERIFICATION_FRESHNESS_LIMIT_DAYS,
    reference_date: Optional[date] = None,
) -> str:
    """
    Determines scheme verification status according to Checkpoint 3 rules:
    - 'unverified': Official source URL missing, date missing, or flagged unverified.
    - 'outdated': Checked longer ago than max_age_days (default 180 days) or flagged outdated.
    - 'verified': Confirmed official source and verified within max_age_days.
    """
    if verification_status == "unverified" or not official_url or not last_verified_at:
        return "unverified"
    if verification_status == "outdated":
        return "outdated"

    try:
        verified_date = datetime.strptime(last_verified_at[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return "unverified"

    ref = reference_date or date.today()
    age_days = (ref - verified_date).days
    if age_days > max_age_days:
        return "outdated"

    return "verified"


def seed_verified_schemes_if_empty(db: Session) -> None:
    """Populate database with authoritative official government schemes and rules from validated JSON foundation."""
    if not _SCHEMES_DATA_PATH.exists():
        logger.warning("Schemes data foundation file not found at %s", _SCHEMES_DATA_PATH)
        return

    try:
        with open(_SCHEMES_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as exc:
        logger.error("Failed to parse schemes JSON file: %s", exc)
        return

    for item in data:
        # Schema validation (Pydantic). If invalid or unverified, reject loading.
        try:
            validated = SchemeDataValidationRecord.model_validate(item)
        except Exception as exc:
            logger.error("Rejected invalid scheme record '%s': %s", item.get("name"), exc)
            continue

        existing = db.query(Scheme).filter(Scheme.slug == validated.slug).first()
        if not existing:
            scheme = Scheme(
                name=validated.name,
                slug=validated.slug,
                provider=validated.provider,
                scheme_type=validated.scheme_type,
                short_description=validated.short_description,
                detailed_benefits=validated.detailed_benefits,
                max_amount=validated.max_amount,
                interest_subsidy_pct=validated.interest_subsidy_pct,
                states_served=validated.states_served,
                target_sectors=validated.target_sectors,
                official_url=validated.official_url,
                last_verified_at=validated.last_verified_at,
                deadline=validated.deadline,
                verifier=validated.verifier,
                verification_status=validated.verification_status,
                language_coverage=validated.language_coverage,
                publication_status=validated.publication_status,
                is_active=validated.is_active,
            )
            db.add(scheme)
            db.flush()

            for doc in validated.documents:
                db.add(
                    SchemeDocumentRequirement(
                        scheme_id=scheme.id,
                        document_type=doc.document_type,
                        title=doc.title,
                        description=doc.description,
                        mandatory=doc.mandatory,
                        how_to_get_url=doc.how_to_get_url,
                    )
                )

            for r in validated.rules:
                db.add(
                    SchemeRule(
                        scheme_id=scheme.id,
                        field=r.field,
                        operator=r.operator,
                        value=r.value,
                        weight=r.weight,
                        is_hard_rule=r.is_hard_rule,
                        explanation=r.explanation,
                        rule_version=r.rule_version,
                    )
                )
        else:
            # Reconcile existing records with latest verified metadata
            existing.deadline = validated.deadline
            existing.verifier = validated.verifier
            existing.verification_status = validated.verification_status
            existing.official_url = validated.official_url
            existing.last_verified_at = validated.last_verified_at

    db.commit()


def get_all_schemes(
    db: Session,
    scheme_type: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Scheme]:
    """Retrieve schemes with optional filtering."""
    seed_verified_schemes_if_empty(db)
    query = db.query(Scheme).filter(Scheme.is_active.is_(True))

    if scheme_type and scheme_type != "all":
        query = query.filter(Scheme.scheme_type == scheme_type)
    if state and state != "ALL":
        query = query.filter(
            (Scheme.states_served == "ALL") | (Scheme.states_served.contains(state))
        )
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Scheme.name.ilike(search_filter))
            | (Scheme.provider.ilike(search_filter))
            | (Scheme.short_description.ilike(search_filter))
        )

    return query.all()


def get_scheme_by_id(db: Session, scheme_id: str) -> Optional[Scheme]:
    """Retrieve single scheme with documents and rules."""
    seed_verified_schemes_if_empty(db)
    return db.query(Scheme).filter(Scheme.id == scheme_id).first()


def get_scheme_by_slug(db: Session, slug: str) -> Optional[Scheme]:
    """Retrieve single scheme by unique slug."""
    seed_verified_schemes_if_empty(db)
    return db.query(Scheme).filter(Scheme.slug == slug).first()
