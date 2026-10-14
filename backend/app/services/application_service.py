"""Application lifecycle, checklist state machine, document vault, and consent service."""

import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Set
from sqlalchemy.orm import Session
from app.models.application import (
    Application,
    ApplicationStatusHistory,
    ApplicationChecklistItem,
    UserDocument,
    DataSharingConsent,
)
from app.models.scheme import Scheme
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ChecklistItemUpdate,
    UserDocumentCreate,
    UserDocumentUpdate,
    DataSharingConsentCreate,
)
from app.services.storage_service import storage_service
from app.services.audit_service import log_audit_event

# Allowed application lifecycle status transitions
VALID_STATUSES: Set[str] = {
    "draft",
    "documents_needed",
    "ready_to_submit",
    "submitted",
    "in_review",
    "action_required",
    "approved",
    "rejected",
    "withdrawn",
    "in_progress",
}

STATUS_PROGRESS_MAP: Dict[str, int] = {
    "draft": 10,
    "documents_needed": 25,
    "in_progress": 25,
    "ready_to_submit": 50,
    "submitted": 80,
    "in_review": 85,
    "action_required": 60,
    "approved": 100,
    "rejected": 100,
    "withdrawn": 0,
}

# Permitted state transitions (or backwards revisions)
ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "draft": {"documents_needed", "ready_to_submit", "submitted", "in_progress", "withdrawn"},
    "documents_needed": {"ready_to_submit", "submitted", "draft", "in_progress", "withdrawn"},
    "in_progress": {"documents_needed", "ready_to_submit", "submitted", "withdrawn"},
    "ready_to_submit": {"submitted", "documents_needed", "in_progress", "withdrawn"},
    "submitted": {"in_review", "action_required", "withdrawn"},
    "in_review": {"action_required", "approved", "rejected", "withdrawn"},
    "action_required": {"in_review", "ready_to_submit", "documents_needed", "withdrawn"},
    "approved": set(),
    "rejected": set(),
    "withdrawn": set(),
}



def get_user_applications(
    db: Session, user_id: str, status_filter: Optional[str] = None
) -> List[Application]:
    """Retrieve all scheme applications belonging to a user, optionally filtered by status."""
    query = db.query(Application).filter(Application.user_id == user_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    return query.order_by(Application.created_at.desc()).all()


def get_application_by_id(
    db: Session, application_id: str, user_id: str
) -> Optional[Application]:
    """Retrieve single application ensuring user ownership."""
    return (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == user_id)
        .first()
    )


def create_application(
    db: Session, user_id: str, app_in: ApplicationCreate
) -> Application:
    """Initialize a new scheme application and seed required checklist items."""
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

    has_mandatory_docs = any(d.mandatory for d in scheme.documents) if scheme.documents else False
    initial_status = "documents_needed" if has_mandatory_docs else "ready_to_submit"
    initial_progress = STATUS_PROGRESS_MAP[initial_status]

    app = Application(
        user_id=user_id,
        scheme_id=app_in.scheme_id,
        status=initial_status,
        progress_percentage=initial_progress,
        due_date=app_in.due_date,
        next_action="Upload required checklist documents" if has_mandatory_docs else "Review and submit application",
        notes=app_in.notes or "",
    )
    db.add(app)
    db.flush()

    # Seed checklist items from scheme document requirements
    if scheme.documents:
        for doc_req in scheme.documents:
            chk = ApplicationChecklistItem(
                application_id=app.id,
                title=doc_req.title,
                document_type=doc_req.document_type,
                is_mandatory=doc_req.mandatory,
                is_completed=False,
                validation_message="Pending verification",
            )
            db.add(chk)

    # Initial status history record
    history = ApplicationStatusHistory(
        application_id=app.id,
        from_status="none",
        to_status=initial_status,
        actor_id=user_id,
        actor_role="entrepreneur",
        change_reason="Application created",
    )
    db.add(history)

    db.commit()
    db.refresh(app)
    return app


def update_application_status(
    db: Session,
    application_id: str,
    user_id: str,
    update_in: ApplicationStatusUpdate,
    actor_role: str = "entrepreneur",
) -> Optional[Application]:
    """Validate and execute application lifecycle status transition."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        return None

    target_status = update_in.status.lower()
    if target_status not in VALID_STATUSES:
        raise ValueError(f"Invalid status '{target_status}'. Allowed: {', '.join(VALID_STATUSES)}")

    # Check transition validity if not already in that status
    if app.status != target_status:
        allowed = ALLOWED_TRANSITIONS.get(app.status, set())
        if target_status not in allowed:
            raise ValueError(
                f"Invalid status transition from '{app.status}' to '{target_status}'"
            )

        from_status = app.status
        app.status = target_status
        app.progress_percentage = STATUS_PROGRESS_MAP.get(target_status, app.progress_percentage)

        if target_status == "submitted" and not app.submitted_at:
            app.submitted_at = datetime.now(timezone.utc)
            app.next_action = "Under formal administrative review"

        if update_in.next_action:
            app.next_action = update_in.next_action
        if update_in.due_date:
            app.due_date = update_in.due_date
        if update_in.notes is not None:
            app.notes = update_in.notes

        # Record status history audit
        history = ApplicationStatusHistory(
            application_id=app.id,
            from_status=from_status,
            to_status=target_status,
            actor_id=user_id,
            actor_role=actor_role,
            change_reason=update_in.change_reason or "Status update",
        )
        db.add(history)

        db.add(app)
        db.commit()
        db.refresh(app)

    return app


def get_application_checklist(
    db: Session, application_id: str, user_id: str
) -> List[ApplicationChecklistItem]:
    """Retrieve checklist items for authorized application."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        raise ValueError("Application not found or unauthorized")
    return app.checklist_items


def update_checklist_item(
    db: Session,
    application_id: str,
    checklist_item_id: str,
    user_id: str,
    update_in: ChecklistItemUpdate,
) -> ApplicationChecklistItem:
    """Toggle completion or attach verified vault document to checklist item."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        raise ValueError("Application not found or unauthorized")

    item = (
        db.query(ApplicationChecklistItem)
        .filter(
            ApplicationChecklistItem.id == checklist_item_id,
            ApplicationChecklistItem.application_id == application_id,
        )
        .first()
    )
    if not item:
        raise ValueError("Checklist item not found")

    if update_in.is_completed is not None:
        item.is_completed = update_in.is_completed

    doc_id = update_in.user_document_id or update_in.vault_document_id
    if doc_id is not None:
        # Enforce server-side ownership check: document must exist and belong to user
        doc = get_document_by_id(db, doc_id, user_id)
        if not doc:
            raise ValueError("Attached document not found or unauthorized")
        item.user_document_id = doc.id
        item.is_completed = True
        item.validation_message = (
            update_in.validation_message
            or update_in.notes
            or f"Attached {doc.file_name} from Document Vault"
        )
    elif update_in.validation_message is not None:
        item.validation_message = update_in.validation_message
    elif update_in.notes is not None:
        item.validation_message = update_in.notes

    db.add(item)

    # Recalculate application status and progress
    all_mandatory = [c for c in app.checklist_items if c.is_mandatory]
    all_mandatory_done = all(c.is_completed for c in all_mandatory)
    if all_mandatory_done and app.status == "documents_needed":
        app.status = "ready_to_submit"
        app.progress_percentage = STATUS_PROGRESS_MAP["ready_to_submit"]
        app.next_action = "All mandatory checklist items ready. Click Submit."
        db.add(app)

    db.commit()
    db.refresh(item)
    return item


def get_application_history(
    db: Session, application_id: str, user_id: str
) -> List[ApplicationStatusHistory]:
    """Retrieve immutable status history ledger for application."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        raise ValueError("Application not found or unauthorized")
    return app.status_history


# ========================================================
# Document Vault Services
# ========================================================

def save_vault_document(
    db: Session,
    user_id: str,
    file_bytes: bytes,
    original_filename: str,
    reported_mime: str,
    document_type: str,
    purpose: str = "scheme_verification",
    display_label: str = "",
    application_id: Optional[str] = None,
    expiry_date: Optional[str] = None,
) -> UserDocument:
    """Store document binary through storage abstraction and register PostgreSQL metadata."""
    if application_id:
        app = get_application_by_id(db, application_id, user_id)
        if not app:
            raise ValueError("Application not found or unauthorized")

    storage_key, storage_path, file_size, checksum_sha256, detected_mime = storage_service.save_file(
        user_id=user_id,
        content=file_bytes,
        original_filename=original_filename,
        reported_content_type=reported_mime,
    )

    doc = UserDocument(
        user_id=user_id,
        application_id=application_id,
        document_type=document_type,
        display_label=display_label or original_filename,
        purpose=purpose,
        file_name=original_filename,
        file_size_bytes=file_size,
        mime_type=detected_mime,
        checksum_sha256=checksum_sha256,
        storage_path=storage_path,
        storage_key=storage_key,
        verification_status="pending",
        expiry_date=expiry_date,
        is_deleted=False,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Auto-fulfill matching checklist item if linked to an application
    if application_id and app:
        for item in app.checklist_items:
            if item.document_type.lower() == document_type.lower() and not item.is_completed:
                item.user_document_id = doc.id
                item.is_completed = True
                item.validation_message = f"Fulfilled by {original_filename} from Vault"
                db.add(item)
                break
        
        # Recalculate status and progress
        all_mandatory = [c for c in app.checklist_items if c.is_mandatory]
        if all_mandatory and all(c.is_completed for c in all_mandatory) and app.status == "documents_needed":
            app.status = "ready_to_submit"
            app.progress_percentage = STATUS_PROGRESS_MAP["ready_to_submit"]
            app.next_action = "All mandatory checklist items ready. Click Submit."
            db.add(app)
        db.commit()

    # Log audit event
    log_audit_event(
        db=db,
        user_id=user_id,
        action="DOCUMENT_UPLOADED",
        resource_type="document",
        resource_id=doc.id,
        details=f"Uploaded {original_filename} ({detected_mime}, {file_size} bytes, SHA-256: {checksum_sha256[:8]}...)",
    )

    return doc


def delete_application(db: Session, application_id: str, user_id: str) -> bool:
    """Delete draft, documents_needed, or withdrawn application record and unlink documents."""
    app = get_application_by_id(db, application_id, user_id)
    if not app:
        return False

    if app.status in ["submitted", "under_review", "approved"]:
        raise ValueError(f"Cannot delete application in '{app.status}' status. Withdraw it first.")

    # Unlink any documents pointing to this application
    db.query(UserDocument).filter(
        UserDocument.application_id == application_id,
        UserDocument.user_id == user_id,
    ).update({"application_id": None})

    db.delete(app)
    db.commit()

    log_audit_event(
        db=db,
        user_id=user_id,
        action="APPLICATION_DELETED",
        resource_type="application",
        resource_id=application_id,
        details="Deleted draft application and unlinked vault documents",
    )
    return True


def verify_document_status(
    db: Session,
    document_id: str,
    verification_status: str,
    rejection_reason: str = "",
    actor_id: str = "system",
    actor_role: str = "admin",
) -> Optional[UserDocument]:
    """Admin or reviewer verification of document authenticity."""
    doc = db.query(UserDocument).filter(UserDocument.id == document_id, UserDocument.is_deleted == False).first()
    if not doc:
        return None

    doc.verification_status = verification_status
    doc.rejection_reason = rejection_reason
    db.add(doc)
    db.commit()
    db.refresh(doc)

    log_audit_event(
        db=db,
        user_id=actor_id,
        actor_role=actor_role,
        action="DOCUMENT_VERIFIED",
        resource_type="document",
        resource_id=doc.id,
        details=f"Document verification status updated to '{verification_status}' (reason='{rejection_reason}')",
    )
    return doc


def record_document_upload(
    db: Session, user_id: str, doc_in: UserDocumentCreate
) -> UserDocument:
    """Helper for registering document metadata with server-enforced keys and validation."""
    if doc_in.application_id:
        app = get_application_by_id(db, doc_in.application_id, user_id)
        if not app:
            raise ValueError("Application not found or unauthorized")

    safe_name = os.path.basename(doc_in.file_name).replace(" ", "_")
    opaque_id = uuid.uuid4().hex
    safe_storage_key = f"{user_id}/{opaque_id}_{safe_name}"
    safe_storage_path = str((storage_service.base_dir / safe_storage_key).resolve())

    doc = UserDocument(
        user_id=user_id,
        application_id=doc_in.application_id,
        document_type=doc_in.document_type,
        display_label=doc_in.display_label or doc_in.file_name,
        purpose=doc_in.purpose or "scheme_verification",
        file_name=doc_in.file_name,
        file_size_bytes=doc_in.file_size_bytes,
        mime_type=doc_in.mime_type or "application/pdf",
        checksum_sha256=doc_in.checksum_sha256 or "",
        storage_path=safe_storage_path,
        storage_key=safe_storage_key,
        verification_status="pending",
        expiry_date=doc_in.expiry_date,
        is_deleted=False,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_user_documents(db: Session, user_id: str) -> List[UserDocument]:
    """Retrieve all non-deleted uploaded documents for user's vault."""
    return (
        db.query(UserDocument)
        .filter(UserDocument.user_id == user_id, UserDocument.is_deleted == False)
        .order_by(UserDocument.created_at.desc())
        .all()
    )


def get_document_by_id(
    db: Session, document_id: str, user_id: str
) -> Optional[UserDocument]:
    """Retrieve document ensuring ownership and active state."""
    return (
        db.query(UserDocument)
        .filter(
            UserDocument.id == document_id,
            UserDocument.user_id == user_id,
            UserDocument.is_deleted == False,
        )
        .first()
    )


def update_document_metadata(
    db: Session, document_id: str, user_id: str, update_in: UserDocumentUpdate
) -> Optional[UserDocument]:
    """Update document label, purpose, application link or expiry date."""
    doc = get_document_by_id(db, document_id, user_id)
    if not doc:
        return None

    if update_in.application_id is not None:
        if update_in.application_id:
            app = get_application_by_id(db, update_in.application_id, user_id)
            if not app:
                raise ValueError("Application not found or unauthorized")
            doc.application_id = app.id
        else:
            doc.application_id = None

    if update_in.display_label is not None:
        doc.display_label = update_in.display_label
    if update_in.purpose is not None:
        doc.purpose = update_in.purpose
    if update_in.expiry_date is not None:
        doc.expiry_date = update_in.expiry_date

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def delete_vault_document(
    db: Session, document_id: str, user_id: str
) -> bool:
    """Soft delete document record and purge binary from storage."""
    doc = get_document_by_id(db, document_id, user_id)
    if not doc:
        return False

    doc.is_deleted = True
    if doc.storage_key:
        storage_service.delete_file(doc.storage_key)

    db.add(doc)
    db.commit()

    log_audit_event(
        db=db,
        user_id=user_id,
        action="DOCUMENT_DELETED",
        resource_type="document",
        resource_id=document_id,
        details=f"Deleted document {doc.file_name}",
    )
    return True


# ========================================================
# Consent Services
# ========================================================

def grant_data_sharing_consent(
    db: Session, user_id: str, consent_in: DataSharingConsentCreate
) -> DataSharingConsent:
    """Record granular, revocable consent before transmitting data to partner."""
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

    log_audit_event(
        db=db,
        user_id=user_id,
        action="CONSENT_GRANTED",
        resource_type="consent",
        resource_id=consent.id,
        details=f"Granted data sharing consent to {consent_in.partner_name}",
    )
    return consent


def revoke_data_sharing_consent(
    db: Session, consent_id: str, user_id: str
) -> Optional[DataSharingConsent]:
    """Revoke previously granted lender consent and sync application status."""
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

    # Sync application consent status: if no active consents remain, set lender_consent_granted to False
    remaining_active = (
        db.query(DataSharingConsent)
        .filter(
            DataSharingConsent.application_id == consent.application_id,
            DataSharingConsent.user_id == user_id,
            DataSharingConsent.is_revoked == False,
            DataSharingConsent.id != consent.id,
        )
        .count()
    )
    if remaining_active == 0:
        app = get_application_by_id(db, consent.application_id, user_id)
        if app:
            app.lender_consent_granted = False
            db.add(app)

    db.commit()
    db.refresh(consent)

    log_audit_event(
        db=db,
        user_id=user_id,
        action="CONSENT_REVOKED",
        resource_type="consent",
        resource_id=consent.id,
        details=f"Revoked data sharing consent for {consent.partner_name}",
    )
    return consent
