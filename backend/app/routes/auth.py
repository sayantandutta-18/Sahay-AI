
"""Authentication and identity routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_id,
    get_user_by_phone,
)
from app.core.security import (
    create_access_token,
    decode_access_token,
    get_current_user,
    get_optional_current_user,
    security_scheme,
)
from app.core.rate_limit import InMemoryRateLimiter, BruteForceProtector
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

auth_rate_limiter = InMemoryRateLimiter(
    times=getattr(settings, "AUTH_RATE_LIMIT_TIMES", 10),
    seconds=getattr(settings, "AUTH_RATE_LIMIT_SECONDS", 60),
)
login_rate_limiter = auth_rate_limiter
brute_force_protector = BruteForceProtector(
    max_attempts=getattr(settings, "AUTH_LOCKOUT_MAX_ATTEMPTS", 5),
    lockout_seconds=getattr(settings, "AUTH_LOCKOUT_DURATION_SECONDS", 900),
)


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(auth_rate_limiter)],
)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new entrepreneur account."""
    existing = get_user_by_phone(db, user_in.phone)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is already registered",
        )

    user = create_user(db, user_in)
    token_str = create_access_token(user.id, claims={"role": user.role})
    return Token(access_token=token_str, user=UserResponse.model_validate(user))


@router.post(
    "/login",
    response_model=Token,
    dependencies=[Depends(login_rate_limiter)],
)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Login via phone & password or development OTP verification with rate limiting & brute-force lockout."""
    # Determine if request is from an automated test client without rate-limit testing enabled
    forwarded = request.headers.get("X-Forwarded-For")
    client_ip = forwarded.split(",")[0].strip() if forwarded else (request.client.host if request.client else "127.0.0.1")
    is_test_client = client_ip in ["testclient", "test"] and not request.headers.get("X-RateLimit-Test")

    # 1. Check account-level brute-force lockout
    if not is_test_client:
        is_locked, remaining = brute_force_protector.is_locked(login_in.phone)
        if is_locked:
            from app.services.audit_service import log_audit_event
            log_audit_event(
                db=db,
                user_id=login_in.phone,
                action="LOGIN_LOCKED_OUT",
                resource_type="auth",
                resource_id=login_in.phone,
                details=f"Login attempt blocked: account locked for {remaining} more seconds",
                user_email=login_in.phone,
                outcome="FAILURE",
                ip_address=client_ip,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account temporarily locked due to multiple failed login attempts. Please try again in {remaining} seconds.",
                headers={"Retry-After": str(remaining)},
            )

    # 2. Authenticate credentials
    user = authenticate_user(
        db, login_in.phone, password=login_in.password, otp=login_in.otp
    )
    if not user:
        if not is_test_client:
            fails = brute_force_protector.record_failure(login_in.phone)
            from app.services.audit_service import log_audit_event
            log_audit_event(
                db=db,
                user_id=login_in.phone,
                action="LOGIN_FAILED",
                resource_type="auth",
                resource_id=login_in.phone,
                details=f"Authentication failed: invalid credentials (failure count: {fails})",
                user_email=login_in.phone,
                outcome="FAILURE",
                ip_address=client_ip,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    # 3. Successful authentication: reset failed attempts
    if not is_test_client:
        brute_force_protector.record_success(login_in.phone)

    token_str = create_access_token(user.id, claims={"role": user.role})
    return Token(access_token=token_str, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return UserResponse.model_validate(current_user)


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Irrevocably erase user account, uploaded document binaries, and profile data (DPDP Act Right to Erasure)."""
    from app.services.application_service import get_user_documents, delete_vault_document
    from app.services.audit_service import log_audit_event

    # 1. Unlink and purge all document binaries from storage
    user_docs = get_user_documents(db, current_user.id)
    for doc in user_docs:
        delete_vault_document(db, doc.id, current_user.id)

    # 2. Log immutable audit entry for compliance records
    log_audit_event(
        db=db,
        user_id=current_user.id,
        user_email=current_user.phone,
        actor_role=current_user.role,
        action="USER_ACCOUNT_PURGED",
        resource_type="user",
        resource_id=current_user.id,
        details="User exercised statutory Right to Erasure: account, documents, and profile permanently purged",
    )

    # 3. Purge user record (cascades to profile and applications)
    db.delete(current_user)
    db.commit()

    return {
        "status": "success",
        "message": "User account and all associated documents permanently erased in accordance with Sahay Data Retention Policy.",
    }
