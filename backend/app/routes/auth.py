
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
