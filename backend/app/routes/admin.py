"""Admin console, role-based access control (RBAC), scheme management, and audit routes."""

from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.audit import AuditLogResponse, AdminStatsResponse
from app.schemas.scheme import SchemeCreate, SchemeUpdate, SchemeResponse
from app.services.audit_service import get_audit_logs, get_admin_system_stats, log_audit_event
from app.models.scheme import Scheme

router = APIRouter(prefix="/admin", tags=["Admin & Audit"])


def require_admin_role(current_user: User = Depends(get_current_user)) -> User:
    """RBAC dependency ensuring only authenticated users with admin role proceed."""
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required. Access denied.",
        )
    return current_user


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(
    admin_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db),
):
    """Retrieve aggregate system metrics and counters."""
    return get_admin_system_stats(db)


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def list_audit_trail(
    limit: int = 50,
    admin_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db),
):
    """Retrieve immutable audit ledger records."""
    logs = get_audit_logs(db, limit=limit)
    return [AuditLogResponse.model_validate(l) for l in logs]


@router.post("/schemes", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def admin_create_scheme(
    scheme_in: SchemeCreate,
    admin_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db),
):
    """Create a new verified scheme record and write audit ledger entry."""
    new_scheme = Scheme(
        name=scheme_in.name,
        slug=scheme_in.slug,
        provider=scheme_in.provider,
        scheme_type=scheme_in.scheme_type,
        short_description=scheme_in.short_description,
        detailed_benefits=scheme_in.detailed_benefits,
        max_amount=scheme_in.max_amount,
        interest_subsidy_pct=scheme_in.interest_subsidy_pct,
        states_served=scheme_in.states_served,
        target_sectors=scheme_in.target_sectors,
        official_url=scheme_in.official_url,
        last_verified_at=scheme_in.last_verified_at,
        language_coverage=scheme_in.language_coverage,
        publication_status=scheme_in.publication_status,
        is_active=scheme_in.is_active,
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)

    # Log to audit trail
    log_audit_event(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.phone,
        actor_role=admin_user.role,
        action="SCHEME_CREATED",
        resource_type="scheme",
        resource_id=new_scheme.id,
        details=f"Admin created scheme: '{new_scheme.name}' (publication_status={new_scheme.publication_status})",
    )

    return SchemeResponse.model_validate(new_scheme)


@router.patch("/schemes/{scheme_id}", response_model=SchemeResponse)
def admin_update_scheme(
    scheme_id: str,
    scheme_in: SchemeUpdate,
    admin_user: User = Depends(require_admin_role),
    db: Session = Depends(get_db),
):
    """Update scheme metadata, publication status, official URL, and verification state."""
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' not found",
        )

    changes = []
    if scheme_in.name is not None and scheme_in.name != scheme.name:
        changes.append(f"name: {scheme.name} -> {scheme_in.name}")
        scheme.name = scheme_in.name
    if scheme_in.provider is not None:
        scheme.provider = scheme_in.provider
    if scheme_in.official_url is not None:
        changes.append(f"official_url: {scheme_in.official_url}")
        scheme.official_url = scheme_in.official_url
    if scheme_in.publication_status is not None:
        changes.append(f"publication_status: {scheme.publication_status} -> {scheme_in.publication_status}")
        scheme.publication_status = scheme_in.publication_status
    if scheme_in.language_coverage is not None:
        scheme.language_coverage = scheme_in.language_coverage
    if scheme_in.last_verified_at is not None:
        changes.append(f"last_verified_at: {scheme_in.last_verified_at}")
        scheme.last_verified_at = scheme_in.last_verified_at
    if scheme_in.is_active is not None:
        changes.append(f"is_active: {scheme_in.is_active}")
        scheme.is_active = scheme_in.is_active
    if scheme_in.short_description is not None:
        scheme.short_description = scheme_in.short_description

    scheme.updated_at = datetime.now(timezone.utc)
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    log_audit_event(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.phone,
        actor_role=admin_user.role,
        action="SCHEME_UPDATED",
        resource_type="scheme",
        resource_id=scheme.id,
        details=f"Admin updated scheme '{scheme.name}': {', '.join(changes) if changes else 'no-op'}",
    )

    return SchemeResponse.model_validate(scheme)
