from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.modules.auth.models import UserRole

# Request Models
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)
    preferred_language: str = Field(default="en", max_length=10)

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    preferred_language: Optional[str] = Field(None, max_length=10)

# Response Models
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    preferred_language: str
    created_at: datetime
    
    class Config:
        from_attributes = True # Allows ORM model parsing

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    role: Optional[UserRole] = None
    preferred_language: Optional[str] = Field(None, max_length=10)

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    id: Optional[UUID] = None
