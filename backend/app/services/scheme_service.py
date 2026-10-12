"""Government scheme data management and official verified seed records."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.scheme import Scheme, SchemeDocumentRequirement, SchemeRule


def seed_verified_schemes_if_empty(db: Session) -> None:
    """Populate database with authoritative official government schemes and rules if empty."""
    existing_count = db.query(Scheme).count()
    if existing_count > 0:
        return

    # 1. PMEGP
    pmegp = Scheme(
        name="Prime Minister Employment Generation Programme (PMEGP)",
        slug="pmegp",
        provider="Ministry of MSME, Govt of India",
        scheme_type="subsidy",
        short_description="Credit-linked subsidy program to generate employment opportunities by setting up micro-enterprises in non-farm sectors.",
        detailed_benefits="Margin money subsidy of 25% (general urban) up to 35% (special category / rural) on bank-financed projects up to ₹50 Lakhs for manufacturing and ₹20 Lakhs for service units.",
        max_amount=5000000.0,
        interest_subsidy_pct=0.0,
        states_served="ALL",
        target_sectors="manufacturing,services,agriculture_allied",
        official_url="https://www.kviconline.gov.in/pmegpeportal",
        last_verified_at="2026-03-01",
        is_active=True,
    )
    db.add(pmegp)
    db.flush()

    # PMEGP Documents
    db.add_all([
        SchemeDocumentRequirement(
            scheme_id=pmegp.id,
            document_type="pan",
            title="Permanent Account Number (PAN)",
            description="PAN card of the individual proprietor or enterprise.",
            mandatory=True,
            how_to_get_url="https://www.incometax.gov.in",
        ),
        SchemeDocumentRequirement(
            scheme_id=pmegp.id,
            document_type="project_report",
            title="Detailed Project Appraisal Report (DPR)",
            description="Project report showing cost of machinery, civil works, and working capital.",
            mandatory=True,
            how_to_get_url="https://www.kviconline.gov.in/pmegp/pmegpweb/docs/jsp/modelproject.jsp",
        ),
        SchemeDocumentRequirement(
            scheme_id=pmegp.id,
            document_type="edp_cert",
            title="EDP Training Certificate",
            description="10-day Entrepreneurship Development Programme certificate.",
            mandatory=False,
            how_to_get_url="https://msmetraining.gov.in",
        ),
    ])

    # PMEGP Rules
    db.add_all([
        SchemeRule(
            scheme_id=pmegp.id,
            field="business_type",
            operator="in",
            value="manufacturing,services,agriculture_allied",
            weight=0.0,
            is_hard_rule=True,
            explanation="Business sector must be in non-farm manufacturing, services, or agro-processing.",
            rule_version="1.4.2",
        ),
        SchemeRule(
            scheme_id=pmegp.id,
            field="annual_turnover",
            operator="lte",
            value="10000000",
            weight=0.0,
            is_hard_rule=True,
            explanation="Applicant enterprise must fall within micro-enterprise capital limits.",
            rule_version="1.4.2",
        ),
        SchemeRule(
            scheme_id=pmegp.id,
            field="has_bank_account",
            operator="boolean_is",
            value="true",
            weight=0.0,
            is_hard_rule=True,
            explanation="Active commercial bank account required for credit disbursement.",
            rule_version="1.4.2",
        ),
        SchemeRule(
            scheme_id=pmegp.id,
            field="gender",
            operator="eq",
            value="female",
            weight=25.0,
            is_hard_rule=False,
            explanation="Women entrepreneurs qualify for higher 35% margin money subsidy.",
            rule_version="1.4.2",
        ),
        SchemeRule(
            scheme_id=pmegp.id,
            field="has_udyam",
            operator="boolean_is",
            value="true",
            weight=20.0,
            is_hard_rule=False,
            explanation="Udyam registration accelerates bank appraisal and subsidy verification.",
            rule_version="1.4.2",
        ),
    ])

    # 2. Pradhan Mantri MUDRA Yojana (Tarun)
    mudra = Scheme(
        name="Pradhan Mantri MUDRA Yojana (Tarun)",
        slug="pmmy-tarun",
        provider="Department of Financial Services, MoF",
        scheme_type="loan",
        short_description="Collateral-free institutional loans for established micro-enterprises looking to expand operations.",
        detailed_benefits="Zero collateral business loans from ₹5 Lakhs up to ₹10 Lakhs disbursed through commercial banks, RRBs, and MFIs at standard competitive interest rates.",
        max_amount=1000000.0,
        interest_subsidy_pct=0.0,
        states_served="ALL",
        target_sectors="manufacturing,services,trading,agriculture_allied",
        official_url="https://www.mudra.org.in",
        last_verified_at="2026-02-15",
        is_active=True,
    )
    db.add(mudra)
    db.flush()

    db.add_all([
        SchemeDocumentRequirement(
            scheme_id=mudra.id,
            document_type="bank_statement",
            title="Last 6 Months Bank Statement",
            description="Continuous commercial or savings bank statement verifying cash receipts.",
            mandatory=True,
            how_to_get_url="https://www.onlinesbi.sbi",
        ),
        SchemeDocumentRequirement(
            scheme_id=mudra.id,
            document_type="pan",
            title="Proprietor PAN Card",
            description="PAN card for identity and credit bureau verification.",
            mandatory=True,
            how_to_get_url="https://www.incometax.gov.in",
        ),
    ])

    db.add_all([
        SchemeRule(
            scheme_id=mudra.id,
            field="category",
            operator="in",
            value="micro,small",
            weight=0.0,
            is_hard_rule=True,
            explanation="Must be a micro or small non-corporate enterprise.",
            rule_version="1.2.0",
        ),
        SchemeRule(
            scheme_id=mudra.id,
            field="has_bank_account",
            operator="boolean_is",
            value="true",
            weight=0.0,
            is_hard_rule=True,
            explanation="Must possess active operative bank account.",
            rule_version="1.2.0",
        ),
        SchemeRule(
            scheme_id=mudra.id,
            field="has_udyam",
            operator="boolean_is",
            value="true",
            weight=30.0,
            is_hard_rule=False,
            explanation="Udyam MSME number verifies formal status with lending institutions.",
            rule_version="1.2.0",
        ),
    ])

    # 3. Banglashree Scheme
    banglashree = Scheme(
        name="Banglashree Scheme (West Bengal State MSME)",
        slug="banglashree",
        provider="Department of MSME&T, Govt of West Bengal",
        scheme_type="subsidy",
        short_description="State capital investment subsidy and electricity duty reimbursement for micro-enterprises located in West Bengal.",
        detailed_benefits="15% to 25% state capital investment subsidy on plant & machinery, plus 5-year waiver on electricity duty and interest subsidy for micro units.",
        max_amount=1000000.0,
        interest_subsidy_pct=2.0,
        states_served="West Bengal",
        target_sectors="manufacturing,services",
        official_url="https://wbmsme.gov.in",
        last_verified_at="2026-02-10",
        is_active=True,
    )
    db.add(banglashree)
    db.flush()

    db.add_all([
        SchemeDocumentRequirement(
            scheme_id=banglashree.id,
            document_type="trade_license",
            title="Municipal Trade License",
            description="Valid municipal trade license or panchayat certificate for operation in West Bengal.",
            mandatory=True,
            how_to_get_url="https://wb.gov.in",
        ),
        SchemeDocumentRequirement(
            scheme_id=banglashree.id,
            document_type="udyam",
            title="Udyam Registration Certificate",
            description="MSME Udyam registration acknowledging location within West Bengal district.",
            mandatory=True,
            how_to_get_url="https://udyamregistration.gov.in",
        ),
    ])

    db.add_all([
        SchemeRule(
            scheme_id=banglashree.id,
            field="state",
            operator="eq",
            value="West Bengal",
            weight=0.0,
            is_hard_rule=True,
            explanation="State-specific incentive available exclusively for units operating in West Bengal.",
            rule_version="1.1.0",
        ),
        SchemeRule(
            scheme_id=banglashree.id,
            field="business_type",
            operator="in",
            value="manufacturing,services",
            weight=0.0,
            is_hard_rule=True,
            explanation="Applies to manufacturing and eligible servicing units.",
            rule_version="1.1.0",
        ),
        SchemeRule(
            scheme_id=banglashree.id,
            field="has_udyam",
            operator="boolean_is",
            value="true",
            weight=25.0,
            is_hard_rule=False,
            explanation="Udyam registration required for single-window state clearance.",
            rule_version="1.1.0",
        ),
    ])

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
