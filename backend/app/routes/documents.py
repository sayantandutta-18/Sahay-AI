"""Document vault and upload metadata routes."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.application import UserDocumentCreate, UserDocumentResponse
from app.services.application_service import record_document_upload, get_user_documents

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=List[UserDocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all uploaded documents in entrepreneur's vault."""
    docs = get_user_documents(db, current_user.id)
    return [UserDocumentResponse.model_validate(d) for d in docs]


@router.post("", response_model=UserDocumentResponse, status_code=status.HTTP_201_CREATED)
def record_document(
    doc_in: UserDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record metadata for an uploaded document and register in vault."""
    doc = record_document_upload(db, current_user.id, doc_in)
    return UserDocumentResponse.model_validate(doc)
