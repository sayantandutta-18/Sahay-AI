"""Application tracking, checklist state machine, and consent endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationChecklistItemResponse,
    ChecklistItemUpdate,
    ApplicationStatusHistoryResponse,
    DataSharingConsentCreate,
    DataSharingConsentResponse,
)
from app.services.application_service import (
    get_user_applications,
    get_application_by_id,
    create_application,
    update_application_status,
    get_application_checklist,
    update_checklist_item,
    get_application_history,
    grant_data_sharing_consent,
    revoke_data_sharing_consent,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = Query(None, description="Filter by status: draft, documents_needed, submitted, etc."),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all applications created by the authenticated entrepreneur, optionally filtered."""
    apps = get_user_applications(db, current_user.id, status_filter=status_filter)
    return [
        ApplicationResponse(
            id=a.id,
            user_id=a.user_id,
            scheme_id=a.scheme_id,
            scheme_name=a.scheme.name if a.scheme else None,
            status=a.status,
            progress_percentage=a.progress_percentage,
            due_date=a.due_date,
            next_action=a.next_action,
            lender_consent_granted=a.lender_consent_granted,
            consent_granted_at=a.consent_granted_at,
            submitted_at=a.submitted_at,
            notes=a.notes,
            created_at=a.created_at,
            updated_at=a.updated_at,
            documents=a.documents,
            consents=a.consents,
            status_history=a.status_history,
            checklist_items=a.checklist_items,
        )
        for a in apps
    ]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def start_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new application and seed checklist requirements from verified scheme."""
    try:
        app = create_application(db, current_user.id, app_in)
        return ApplicationResponse(
            id=app.id,
            user_id=app.user_id,
            scheme_id=app.scheme_id,
            scheme_name=app.scheme.name if app.scheme else None,
            status=app.status,
            progress_percentage=app.progress_percentage,
            due_date=app.due_date,
            next_action=app.next_action,
            lender_consent_granted=app.lender_consent_granted,
            consent_granted_at=app.consent_granted_at,
            submitted_at=app.submitted_at,
            notes=app.notes,
            created_at=app.created_at,
            updated_at=app.updated_at,
            documents=app.documents,
            consents=app.consents,
            status_history=app.status_history,
            checklist_items=app.checklist_items,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single application record with status history and checklist."""
    app = get_application_by_id(db, application_id, current_user.id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return ApplicationResponse(
        id=app.id,
        user_id=app.user_id,
        scheme_id=app.scheme_id,
        scheme_name=app.scheme.name if app.scheme else None,
        status=app.status,
        progress_percentage=app.progress_percentage,
        due_date=app.due_date,
        next_action=app.next_action,
        lender_consent_granted=app.lender_consent_granted,
        consent_granted_at=app.consent_granted_at,
        submitted_at=app.submitted_at,
        notes=app.notes,
        created_at=app.created_at,
        updated_at=app.updated_at,
        documents=app.documents,
        consents=app.consents,
        status_history=app.status_history,
        checklist_items=app.checklist_items,
    )


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: str,
    update_in: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Execute validated status transition and record immutable audit history."""
    try:
        updated = update_application_status(
            db, application_id, current_user.id, update_in, actor_role=current_user.role
        )
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        return ApplicationResponse(
            id=updated.id,
            user_id=updated.user_id,
            scheme_id=updated.scheme_id,
            scheme_name=updated.scheme.name if updated.scheme else None,
            status=updated.status,
            progress_percentage=updated.progress_percentage,
            due_date=updated.due_date,
            next_action=updated.next_action,
            lender_consent_granted=updated.lender_consent_granted,
            consent_granted_at=updated.consent_granted_at,
            submitted_at=updated.submitted_at,
            notes=updated.notes,
            created_at=updated.created_at,
            updated_at=updated.updated_at,
            documents=updated.documents,
            consents=updated.consents,
            status_history=updated.status_history,
            checklist_items=updated.checklist_items,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{application_id}/checklist", response_model=List[ApplicationChecklistItemResponse])
def get_checklist(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve checklist requirements and completion status."""
    try:
        items = get_application_checklist(db, application_id, current_user.id)
        return [ApplicationChecklistItemResponse.model_validate(item) for item in items]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{application_id}/checklist/{item_id}", response_model=ApplicationChecklistItemResponse)
def update_checklist(
    application_id: str,
    item_id: str,
    update_in: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark checklist requirement completed or attach vault document."""
    try:
        item = update_checklist_item(db, application_id, item_id, current_user.id, update_in)
        return ApplicationChecklistItemResponse.model_validate(item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{application_id}/history", response_model=List[ApplicationStatusHistoryResponse])
def get_history(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chronological status transition history."""
    try:
        history = get_application_history(db, application_id, current_user.id)
        return [ApplicationStatusHistoryResponse.model_validate(h) for h in history]
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/consent", response_model=DataSharingConsentResponse)
def grant_consent(
    consent_in: DataSharingConsentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Grant granular consent to share data fields with partner institution."""
    try:
        consent = grant_data_sharing_consent(db, current_user.id, consent_in)
        return DataSharingConsentResponse.model_validate(consent)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/consent/{consent_id}/revoke", response_model=DataSharingConsentResponse)
def revoke_consent(
    consent_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke previously granted data sharing consent."""
    consent = revoke_data_sharing_consent(db, consent_id, current_user.id)
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent record not found")
    return DataSharingConsentResponse.model_validate(consent)
