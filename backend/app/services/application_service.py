"""Application lifecycle, document checklist state, and granular consent service."""

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.application import Application, UserDocument, DataSharingConsent
from app.models.scheme import Scheme
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    UserDocumentCreate,
    DataSharingConsentCreate,
)


def get_user_applications(db: Session, user_id: str) -> List[Application]:
    """Retrieve all scheme applications belonging to a user."""
    return (
        db.query(Application)
        .filter(Application.user_id == user_id)
        .order_by(Application.created_at.desc())
        .all()
    )


def get_application_by_id(
    db: Session, application_id: str, user_id: str
) -> Optional[Application]:
    """Retrieve single application ensuring tenant authorization."""
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == user_id)
        .first()
    )


def create_application(
    db: Session, user_id: str, app_in: ApplicationCreate
) -> Application:
    """Initialize a new scheme application with default checklist progress."""
    scheme = db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
    if not scheme:
        raise ValueError(f"Scheme with ID '{app_in.scheme_id}' does not exist")

    # Check if application already exists for this scheme
    existing = (
        db.query(Application)
        .filter(Application.user_id == user_id, Application.scheme_id == app_in.scheme_id)
        .first()
    )
    if existing:
        return existing

    app = Application(
        user_id=user_id,
        scheme_id=app_in.scheme_id,
        status="in_progress",
        progress_percentage=25,
        notes=app_in.notes or "",
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def update_application_status(
    db: Session,
    application_id: str,
    user_id: str,
    update_in: ApplicationStatusUpdate,
) -> Optional[Application]:
    """Update application progression state."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        return None

    app.status = update_in.status
    if update_in.notes is not None:
        app.notes = update_in.notes

    if update_in.status == "submitted" and not app.submitted_at:
        app.submitted_at = datetime.now(timezone.utc)
        app.progress_percentage = 80
    elif update_in.status == "approved":
        app.progress_percentage = 100
    elif update_in.status == "rejected":
        app.progress_percentage = 100

    db.add(app)
    db.commit()
    db.refresh(app)
    return app


def record_document_upload(
    db: Session, user_id: str, doc_in: UserDocumentCreate
) -> UserDocument:
    """Store uploaded document metadata and attach to application if provided."""
    doc = UserDocument(
        user_id=user_id,
        application_id=doc_in.application_id,
        document_type=doc_in.document_type,
        file_name=doc_in.file_name,
        file_size_bytes=doc_in.file_size_bytes,
        storage_path=doc_in.storage_path or f"vault/{user_id}/{doc_in.file_name}",
        verification_status="verified",
        expiry_date=doc_in.expiry_date,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_user_documents(db: Session, user_id: str) -> List[UserDocument]:
    """Retrieve all uploaded documents for user's vault."""
    return (
        db.query(UserDocument)
        .filter(UserDocument.user_id == user_id)
        .order_by(UserDocument.created_at.desc())
        .all()
    )


def grant_data_sharing_consent(
    db: Session, user_id: str, consent_in: DataSharingConsentCreate
) -> DataSharingConsent:
    """Record granular, revocable consent before transmitting data to lender."""
    app = get_application_by_id(db, consent_in.application_id, user_id)
    if not app:
        raise ValueError("Application not found or unauthorized")

    consent = DataSharingConsent(
        user_id=user_id,
        application_id=consent_in.application_id,
        partner_name=consent_in.partner_name,
        shared_fields=consent_in.shared_fields,
        is_revoked=False,
    )
    app.lender_consent_granted = True
    app.consent_granted_at = datetime.now(timezone.utc)

    db.add(consent)
    db.add(app)
    db.commit()
    db.refresh(consent)
    return consent


def revoke_data_sharing_consent(
    db: Session, consent_id: str, user_id: str
) -> Optional[DataSharingConsent]:
    """Revoke previously granted lender consent."""
    consent = (
        db.query(DataSharingConsent)
        .filter(DataSharingConsent.id == consent_id, DataSharingConsent.user_id == user_id)
        .first()
    )
    if not consent:
        return None

    consent.is_revoked = True
    consent.revoked_at = datetime.now(timezone.utc)
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent
