
"""Authentication and identity routes."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_id,
    get_user_by_phone,
)
from app.core.security import create_access_token, decode_access_token
from app.core.rate_limit import InMemoryRateLimiter
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
security_scheme = HTTPBearer(auto_error=False)
auth_rate_limiter = InMemoryRateLimiter(times=30, seconds=60)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency extracting and validating the authenticated User from Bearer JWT."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account does not exist or is inactive",
        )

    return user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Return the authenticated user if a valid token is provided, otherwise None."""
    if not credentials:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
        if not payload or "sub" not in payload:
            return None

        user = get_user_by_id(db, payload["sub"])
        if not user or not user.is_active:
            return None

        return user
    except Exception:
        return None


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
    dependencies=[Depends(auth_rate_limiter)],
)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Login via phone & password or development OTP verification."""
    user = authenticate_user(
        db, login_in.phone, password=login_in.password, otp=login_in.otp
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    token_str = create_access_token(user.id, claims={"role": user.role})
    return Token(access_token=token_str, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return UserResponse.model_validate(current_user)
