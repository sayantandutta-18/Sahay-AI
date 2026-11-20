"""Security and authentication utilities."""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
import bcrypt
from app.core.config import settings


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
