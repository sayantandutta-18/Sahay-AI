"""Security, authentication, and RBAC authorization utilities."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

security_scheme = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed password."""
    if not plain_password or not hashed_password:
        return False
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt password hash (truncated safely to 72 bytes)."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def create_access_token(
    subject: str,
    claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if claims:
        to_encode.update(claims)

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.PyJWTError:
        return None


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency extracting and validating the authenticated User from Bearer JWT against the database."""
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

    user = db.query(User).filter(User.id == payload["sub"]).first()
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

        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user or not user.is_active:
            return None

        return user
    except Exception:
        return None


def require_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    """Reusable RBAC dependency ensuring only authenticated users with admin/super_admin role in DB proceed.

    Reads role from the live database record, never trusting token claim alone.
    Raises 403 Forbidden for non-admin users.
    """
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user or not db_user.is_active or db_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required. Access denied.",
        )
    return db_user


# =========================================================================
# Checkpoint 14: Sensitive Financial Data Masking & Encryption-at-Rest
# =========================================================================

import base64
import hashlib
from cryptography.fernet import Fernet


def get_encryption_cipher(secret_key: Optional[str] = None) -> Fernet:
    """Derive a URL-safe 32-byte Fernet key deterministically from secret key."""
    key_source = (secret_key or settings.JWT_SECRET_KEY or "sahay-default-secret-key-32bytes!").encode("utf-8")
    derived_key = base64.urlsafe_b64encode(hashlib.sha256(key_source).digest())
    return Fernet(derived_key)


def encrypt_sensitive_data(plain_text: str, secret_key: Optional[str] = None) -> str:
    """Encrypt sensitive string (PAN, Aadhaar, Bank Account) with AES-128-CBC + HMAC-SHA256."""
    if not plain_text:
        return ""
    cipher = get_encryption_cipher(secret_key)
    return cipher.encrypt(plain_text.encode("utf-8")).decode("utf-8")


def decrypt_sensitive_data(cipher_text: str, secret_key: Optional[str] = None) -> str:
    """Decrypt sensitive cipher string with integrity verification."""
    if not cipher_text:
        return ""
    try:
        cipher = get_encryption_cipher(secret_key)
        return cipher.decrypt(cipher_text.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""


def mask_pan(pan: str) -> str:
    """Mask PAN number according to RBI/Income Tax security standards: ABCDE****F."""
    if not pan:
        return ""
    clean = pan.strip().upper()
    if len(clean) == 10:
        return f"{clean[:5]}****{clean[-1]}"
    if len(clean) > 4:
        return f"{'*' * (len(clean) - 4)}{clean[-4:]}"
    return "****"


def mask_aadhaar(aadhaar: str) -> str:
    """Mask 12-digit Aadhaar according to UIDAI guidelines: XXXX-XXXX-1234."""
    if not aadhaar:
        return ""
    digits = "".join(filter(str.isdigit, aadhaar))
    if len(digits) >= 12:
        return f"XXXX-XXXX-{digits[-4:]}"
    if len(digits) > 4:
        return f"XXXX-XXXX-{digits[-4:]}"
    return "XXXX-XXXX-XXXX"


def mask_bank_account(account: str) -> str:
    """Mask bank account number showing only last 4 digits: XXXXXXX1234."""
    if not account:
        return ""
    clean = account.strip()
    if len(clean) > 4:
        return f"{'X' * (len(clean) - 4)}{clean[-4:]}"
    return "XXXX"
