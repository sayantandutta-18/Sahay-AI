"""User and authentication business logic."""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    """Retrieve user by unique phone number."""
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Retrieve user by primary key."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user with initialized empty business profile."""
    hashed_pwd = get_password_hash(user_in.password) if user_in.password else None
    user = User(
        phone=user_in.phone,
        name=user_in.name,
        hashed_password=hashed_pwd,
        role=user_in.role,
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


def authenticate_user(db: Session, phone: str, password: Optional[str] = None, otp: Optional[str] = None) -> Optional[User]:
    """Development-friendly authentication via phone/password or mock OTP."""
    user = get_user_by_phone(db, phone)
    if not user:
        # Development auto-registration for streamlined testing if user does not exist yet
        dev_create = UserCreate(
            phone=phone,
            name=f"User {phone[-4:]}",
            role="entrepreneur",
            language="en",
            state="West Bengal",
            district="Kolkata",
        )
        return create_user(db, dev_create)

    # In dev mode, if OTP is provided or password matches
    if otp and len(otp) == 6:
        return user
    if password and user.hashed_password:
        if verify_password(password, user.hashed_password):
            return user
    elif password == "dev_pass":
        return user

    return user
