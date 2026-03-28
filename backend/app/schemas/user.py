import uuid
from datetime import datetime

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    phone: str | None = None
    avatar_url: str | None = None
    location: str | None = None
    rating: float
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserPublicResponse(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None
    location: str | None = None
    rating: float
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    location: str | None = None
