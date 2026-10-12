"""Audit trail recording service."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.scheme import Scheme
from app.models.application import Application, UserDocument
from app.schemas.audit import AdminStatsResponse


def log_audit_event(
    db: Session,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: str,
    user_email: str = "",
    ip_address: str = "127.0.0.1",
) -> AuditLog:
    """Record immutable event in audit ledger."""
    log = AuditLog(
        user_id=user_id,
        user_email=user_email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_audit_logs(db: Session, limit: int = 50) -> List[AuditLog]:
    """Retrieve recent administrative audit logs."""
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()


def get_admin_system_stats(db: Session) -> AdminStatsResponse:
    """Aggregate high-level platform statistics for admin console."""
    total_users = db.query(User).count()
    total_schemes = db.query(Scheme).count()
    total_applications = db.query(Application).count()
    total_verified_docs = db.query(UserDocument).filter(UserDocument.verification_status == "verified").count()
    total_audit_events = db.query(AuditLog).count()

    return AdminStatsResponse(
        total_users=total_users,
        total_schemes=total_schemes,
        total_applications=total_applications,
        total_verified_documents=total_verified_docs,
        total_audit_events=total_audit_events,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
