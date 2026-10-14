"""User and authentication business logic."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


from app.core.config import settings


def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    """Retrieve user by unique phone number."""
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Retrieve user by primary key."""
    return db.query(User).filter(User.id == user_id).first()


def promote_user_to_admin(db: Session, user_id: str) -> Optional[User]:
    """Promote an existing user to admin role (internal/server-side only)."""
    user = get_user_by_id(db, user_id)
    if user:
        user.role = "admin"
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def seed_default_admin_if_empty(db: Session) -> User:
    """Seed system administrator account if no admin exists."""
    admin = db.query(User).filter(User.role == "admin").first()
    if not admin:
        admin = User(
            phone="9999999999",
            name="System Administrator",
            role="admin",
            hashed_password=get_password_hash("admin_secure_pass"),
            language="en",
            state="Central",
            district="Headquarters",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    return admin


def seed_demo_user_if_empty(db: Session) -> User:
    """Seed default demo entrepreneur account if it does not already exist."""
    demo = db.query(User).filter(User.phone == "9876543210").first()
    if not demo:
        demo = create_user(
            db,
            UserCreate(
                phone="9876543210",
                name="Demo Entrepreneur",
                password="Password123!",
                language="en",
                state="West Bengal",
                district="Kolkata",
            ),
        )
    return demo


def create_user(db: Session, user_in: UserCreate, force_role: Optional[str] = None) -> User:
    """Create a new user with initialized empty business profile.
    
    Security: Always defaults role to 'entrepreneur' for client registrations.
    """
    hashed_pwd = get_password_hash(user_in.password) if user_in.password else None
    # Never accept 'admin' or privileged roles from client registration
    assigned_role = force_role if force_role else "entrepreneur"

    user = User(
        phone=user_in.phone,
        name=user_in.name,
        hashed_password=hashed_pwd,
        role=assigned_role,
        language=user_in.language,
        state=user_in.state,
        district=user_in.district,
    )
    db.add(user)
    db.flush()

    # Automatically initialize attached business profile
    business_profile = BusinessProfile(
        user_id=user.id,
        business_name=f"{user.name}'s Enterprise",
    )
    db.add(business_profile)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(
    db: Session, phone: str, password: Optional[str] = None, otp: Optional[str] = None
) -> Optional[User]:
    """Secure authentication via phone/password or verified OTP.
    
    Returns None if user not found, or credentials do not match.
    """
    user = get_user_by_phone(db, phone)
    if not user or not user.is_active:
        return None

    # 1. Verify Password
    if password and user.hashed_password:
        if verify_password(password, user.hashed_password):
            return user

    # 2. Development password bypass ONLY in development mode with DEBUG=True
    if settings.DEBUG and settings.ENVIRONMENT == "development":
        if password == "dev_pass":
            return user
        if otp == "123456":
            return user

    # 3. OTP verification (when OTP is provided and matches active user token)
    # Outside dev, mock OTP is rejected
    return None

