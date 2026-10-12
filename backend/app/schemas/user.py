"""Pydantic schemas for authentication and user accounts."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, description="10-digit mobile number")
    name: str = Field(..., min_length=2, max_length=120, description="Full name of entrepreneur")
    language: str = Field(default="en", description="Preferred language (en, hi, bn)")
    state: str = Field(default="", description="State of operation")
    district: str = Field(default="", description="District")
    role: str = Field(default="entrepreneur", description="User role: entrepreneur, admin, lender")


class UserCreate(UserBase):
    password: Optional[str] = Field(default=None, min_length=6, description="Optional password for dev login")


class UserLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    password: Optional[str] = Field(default="dev_pass", description="Password or dev bypass code")
    otp: Optional[str] = Field(default=None, description="6-digit OTP code")


class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int
