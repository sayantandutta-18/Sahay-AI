"""Application tracking, checklist, and consent endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    DataSharingConsentCreate,
    DataSharingConsentResponse,
)
from app.services.application_service import (
    get_user_applications,
    get_application_by_id,
    create_application,
    update_application_status,
    grant_data_sharing_consent,
    revoke_data_sharing_consent,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all applications created by the authenticated entrepreneur."""
    apps = get_user_applications(db, current_user.id)
    return [
        ApplicationResponse(
            id=a.id,
            user_id=a.user_id,
            scheme_id=a.scheme_id,
            scheme_name=a.scheme.name if a.scheme else None,
            status=a.status,
            progress_percentage=a.progress_percentage,
            lender_consent_granted=a.lender_consent_granted,
            consent_granted_at=a.consent_granted_at,
            submitted_at=a.submitted_at,
            notes=a.notes,
            created_at=a.created_at,
            updated_at=a.updated_at,
            documents=a.documents,
            consents=a.consents,
        )
        for a in apps
    ]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def start_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new application checklist entry for a scheme."""
    try:
        app = create_application(db, current_user.id, app_in)
        return ApplicationResponse(
            id=app.id,
            user_id=app.user_id,
            scheme_id=app.scheme_id,
            scheme_name=app.scheme.name if app.scheme else None,
            status=app.status,
            progress_percentage=app.progress_percentage,
            lender_consent_granted=app.lender_consent_granted,
            consent_granted_at=app.consent_granted_at,
            submitted_at=app.submitted_at,
            notes=app.notes,
            created_at=app.created_at,
            updated_at=app.updated_at,
            documents=app.documents,
            consents=app.consents,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single application record."""
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
        lender_consent_granted=app.lender_consent_granted,
        consent_granted_at=app.consent_granted_at,
        submitted_at=app.submitted_at,
        notes=app.notes,
        created_at=app.created_at,
        updated_at=app.updated_at,
        documents=app.documents,
        consents=app.consents,
    )


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_status(
    application_id: str,
    update_in: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update checklist status (e.g. submitted, approved)."""
    updated = update_application_status(db, application_id, current_user.id, update_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return ApplicationResponse(
        id=updated.id,
        user_id=updated.user_id,
        scheme_id=updated.scheme_id,
        scheme_name=updated.scheme.name if updated.scheme else None,
        status=updated.status,
        progress_percentage=updated.progress_percentage,
        lender_consent_granted=updated.lender_consent_granted,
        consent_granted_at=updated.consent_granted_at,
        submitted_at=updated.submitted_at,
        notes=updated.notes,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        documents=updated.documents,
        consents=updated.consents,
    )


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
