"""Audit trail recording service with automated sensitive data redaction."""

from datetime import datetime, timezone
import re
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User
from app.models.scheme import Scheme
from app.models.application import Application, UserDocument
from app.schemas.audit import AdminStatsResponse

# Regex patterns for redacting sensitive PII/secrets
TOKEN_PATTERN = re.compile(r'(Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*)', re.IGNORECASE)
PASSWORD_PATTERN = re.compile(
    r'("?(?:password|token|secret|access_token)"?\s*[:=]\s*"?[^",\s}]+"?)[^\s]*',
    re.IGNORECASE,
)
AADHAAR_PATTERN = re.compile(r'\b\d{4}\s?\d{4}\s?\d{4}\b')
PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b')


def redact_sensitive_data(text: str) -> str:
    """Scrub sensitive credentials, tokens, and full identity numbers before audit logging."""
    if not text:
        return ""
    scrubbed = TOKEN_PATTERN.sub("Bearer [REDACTED_TOKEN]", text)
    scrubbed = PASSWORD_PATTERN.sub('"password": "[REDACTED]"', scrubbed)
    scrubbed = AADHAAR_PATTERN.sub("XXXX-XXXX-[REDACTED]", scrubbed)
    # Mask first 6 characters of PAN, leave last 4
    scrubbed = PAN_PATTERN.sub(lambda m: f"XXXXXX{m.group(0)[-4:]}", scrubbed)
    return scrubbed


def log_audit_event(
    db: Session,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: str,
    user_email: str = "",
    actor_role: str = "user",
    outcome: str = "SUCCESS",
    ip_address: str = "127.0.0.1",
    correlation_id: str = "",
) -> AuditLog:
    """Record immutable event in audit ledger with sanitized metadata."""
    redacted_details = redact_sensitive_data(details)
    log = AuditLog(
        user_id=user_id,
        user_email=user_email,
        actor_role=actor_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        outcome=outcome,
        details=redacted_details,
        ip_address=ip_address,
        correlation_id=correlation_id or uuid.uuid4().hex[:16],
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
    total_verified_docs = db.query(UserDocument).filter(
        UserDocument.verification_status == "verified",
        UserDocument.is_deleted == False,
    ).count()
    total_audit_events = db.query(AuditLog).count()

    return AdminStatsResponse(
        total_users=total_users,
        total_schemes=total_schemes,
        total_applications=total_applications,
        total_verified_documents=total_verified_docs,
        total_audit_events=total_audit_events,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
