"""Document vault, upload, download, and metadata management routes."""

from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.application import (
    UserDocumentCreate,
    UserDocumentUpdate,
    UserDocumentResponse,
)
from app.services.application_service import (
    save_vault_document,
    record_document_upload,
    get_user_documents,
    get_document_by_id,
    update_document_metadata,
    delete_vault_document,
)
from app.services.storage_service import storage_service
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=List[UserDocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all uploaded documents in entrepreneur's vault."""
    docs = get_user_documents(db, current_user.id)
    return [UserDocumentResponse.model_validate(d) for d in docs]


@router.post("/upload", response_model=UserDocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document_file(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    display_label: Optional[str] = Form(None),
    purpose: Optional[str] = Form("scheme_verification"),
    application_id: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload binary file with server-side MIME verification and checksum into vault."""
    try:
        content = await file.read()
        doc = save_vault_document(
            db=db,
            user_id=current_user.id,
            file_bytes=content,
            original_filename=file.filename or "uploaded_document",
            reported_mime=file.content_type or "application/octet-stream",
            document_type=document_type,
            purpose=purpose or "scheme_verification",
            display_label=display_label or file.filename or "Document",
            application_id=application_id,
            expiry_date=expiry_date,
        )
        return UserDocumentResponse.model_validate(doc)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Authorized file download stream with ownership verification."""
    doc = get_document_by_id(db, document_id, current_user.id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized access",
        )

    file_path = storage_service.get_file_path(doc.storage_key)
    if not file_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File binary not found in storage vault",
        )

    log_audit_event(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_DOWNLOADED",
        resource_type="document",
        resource_id=doc.id,
        details=f"Downloaded {doc.file_name}",
    )

    return FileResponse(
        path=str(file_path),
        filename=doc.file_name,
        media_type=doc.mime_type or "application/octet-stream",
    )


@router.patch("/{document_id}", response_model=UserDocumentResponse)
def update_document(
    document_id: str,
    update_in: UserDocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update document display label, purpose, application link or expiry."""
    doc = update_document_metadata(db, document_id, current_user.id, update_in)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized",
        )
    return UserDocumentResponse.model_validate(doc)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Safe document deletion from vault and storage."""
    deleted = delete_vault_document(db, document_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or unauthorized",
        )
    return None


@router.post("", response_model=UserDocumentResponse, status_code=status.HTTP_201_CREATED)
def record_document(
    doc_in: UserDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record metadata directly for an existing document."""
    doc = record_document_upload(db, current_user.id, doc_in)
    return UserDocumentResponse.model_validate(doc)
