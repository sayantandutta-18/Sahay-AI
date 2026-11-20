"""Government scheme data management and authoritative verified seed records."""

import json
import logging
from datetime import datetime, date
from pathlib import Path
from typing import List, Optional
from sqlalchemy import or_
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


MULTILINGUAL_SEARCH_SYNONYMS = {
    # Bengali (বাংলা)
    "মহিলা": ["women", "woman", "female", "stand-up"],
    "মহিলারা": ["women", "woman", "female", "stand-up"],
    "মহিলাদের": ["women", "woman", "female", "stand-up"],
    "নারী": ["women", "woman", "female"],
    "নারীদের": ["women", "woman", "female"],
    "ঋণ": ["loan", "credit", "mudra", "svanidhi"],
    "ভর্তুকি": ["subsidy", "grant", "pmegp"],
    "অনুদান": ["grant", "subsidy"],
    "উদ্যোক্তা": ["entrepreneur", "enterprise", "startup"],
    "উদ্যোগ": ["enterprise", "venture", "startup"],
    "ব্যবসা": ["business", "enterprise", "micro"],
    "কারবার": ["turnover", "enterprise", "business"],
    "মুদ্রা": ["mudra", "pmmy"],
    "হকার": ["vendor", "street vendor", "svanidhi"],
    "পথ বিক্রেতা": ["vendor", "street vendor", "svanidhi"],
    "দোকান": ["trading", "retail", "vendor"],
    "স্টার্টআপ": ["startup", "greenfield", "stand-up"],
    "ক্ষুদ্র": ["micro", "msme"],
    "জামানত": ["collateral", "guarantee", "cgtmse"],
    "বিনা জামানত": ["collateral", "guarantee", "cgtmse"],
    "জামানতহীন": ["collateral", "guarantee", "cgtmse"],
    # Hindi (हिन्दी)
    "महिला": ["women", "woman", "female", "stand-up"],
    "महिलाएं": ["women", "woman", "female", "stand-up"],
    "महिलाओं": ["women", "woman", "female", "stand-up"],
    "नारी": ["women", "woman", "female"],
    "ऋण": ["loan", "credit", "mudra", "svanidhi"],
    "कर्ज": ["loan", "credit"],
    "सब्सिडी": ["subsidy", "grant", "pmegp"],
    "अनुदान": ["grant", "subsidy"],
    "उद्यमी": ["entrepreneur", "enterprise", "startup"],
    "उद्यमिता": ["entrepreneur", "enterprise", "startup"],
    "व्यापार": ["business", "enterprise", "micro"],
    "व्यवसाय": ["business", "enterprise", "micro"],
    "मुद्रा": ["mudra", "pmmy"],
    "विक्रेता": ["vendor", "street vendor", "svanidhi"],
    "रेहड़ी": ["vendor", "street vendor", "svanidhi"],
    "पटरी": ["vendor", "street vendor", "svanidhi"],
    "स्टार्टअप": ["startup", "greenfield", "stand-up"],
    "सूक्ष्म": ["micro", "msme"],
    "गारंटी": ["guarantee", "cgtmse"],
    "बिना गारंटी": ["collateral", "guarantee", "cgtmse"],
    # English synonyms
    "women": ["women", "woman", "female", "stand-up"],
    "female": ["women", "woman", "female", "stand-up"],
    "woman": ["women", "woman", "female", "stand-up"],
    "startup": ["startup", "greenfield", "stand-up"],
    "vendor": ["vendor", "street vendor", "svanidhi"],
    "subsidies": ["subsidy", "grant", "pmegp"],
    "subsidy": ["subsidy", "grant", "pmegp"],
    "loans": ["loan", "credit"],
    "loan": ["loan", "credit"],
    "collateral": ["collateral", "guarantee", "cgtmse"],
}


def expand_multilingual_search_terms(raw_search: str) -> List[str]:
    """Expand search query into multilingual synonyms across English, Bengali, and Hindi."""
    clean = raw_search.strip().lower()
    if not clean:
        return []

    terms = {clean}
    # Check full phrase match
    if clean in MULTILINGUAL_SEARCH_SYNONYMS:
        terms.update(MULTILINGUAL_SEARCH_SYNONYMS[clean])

    # Check word tokens
    words = clean.split()
    for w in words:
        if w in MULTILINGUAL_SEARCH_SYNONYMS:
            terms.update(MULTILINGUAL_SEARCH_SYNONYMS[w])

    # Also check substring match in synonyms
    for key, syns in MULTILINGUAL_SEARCH_SYNONYMS.items():
        if key in clean or clean in key:
            terms.update(syns)

    return list(terms)


def get_all_schemes(
    db: Session,
    scheme_type: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Scheme]:
    """Retrieve schemes with optional multilingual search and preset filtering."""
    seed_verified_schemes_if_empty(db)
    query = db.query(Scheme).filter(Scheme.is_active.is_(True))

    if scheme_type and scheme_type != "all":
        query = query.filter(Scheme.scheme_type == scheme_type)
    if state and state != "ALL":
        query = query.filter(
            (Scheme.states_served == "ALL") | (Scheme.states_served.contains(state))
        )
    if search:
        search_terms = expand_multilingual_search_terms(search)
        filters = []
        for term in search_terms:
            t_filter = f"%{term}%"
            filters.extend([
                Scheme.name.ilike(t_filter),
                Scheme.slug.ilike(t_filter),
                Scheme.provider.ilike(t_filter),
                Scheme.short_description.ilike(t_filter),
                Scheme.detailed_benefits.ilike(t_filter),
                Scheme.target_sectors.ilike(t_filter),
            ])
        if filters:
            query = query.filter(or_(*filters))

    return query.all()


def get_scheme_by_id(db: Session, scheme_id: str) -> Optional[Scheme]:
    """Retrieve single scheme with documents and rules."""
    seed_verified_schemes_if_empty(db)
    return db.query(Scheme).filter(Scheme.id == scheme_id).first()


def get_scheme_by_slug(db: Session, slug: str) -> Optional[Scheme]:
    """Retrieve single scheme by unique slug."""
    seed_verified_schemes_if_empty(db)
    return db.query(Scheme).filter(Scheme.slug == slug).first()
