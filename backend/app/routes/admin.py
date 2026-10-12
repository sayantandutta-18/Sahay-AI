"""Admin console, role-based access control (RBAC), and audit log routes."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.audit import AuditLogResponse, AdminStatsResponse
from app.schemas.scheme import SchemeCreate, SchemeResponse
from app.services.audit_service import get_audit_logs, get_admin_system_stats, log_audit_event
from app.models.scheme import Scheme

router = APIRouter(prefix="/admin", tags=["Admin & Audit"])


def require_admin_role(current_user: User = Depends(get_current_user)) -> User:
    """RBAC dependency ensuring only authenticated users with admin role proceed."""
    if current_user.role != "admin":
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
        action="SCHEME_CREATED",
        resource_type="scheme",
        resource_id=new_scheme.id,
        details=f"Admin created scheme: '{new_scheme.name}'",
    )

    return SchemeResponse.model_validate(new_scheme)
