import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    ad_id: uuid.UUID
    conversation_id: uuid.UUID | None = None
    content: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationAdBrief(BaseModel):
    id: uuid.UUID
    title: str
    images: list[dict] = []

    model_config = {"from_attributes": True}


class ConversationUserBrief(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: uuid.UUID
    ad: ConversationAdBrief
    other_user: ConversationUserBrief
    last_message: MessageResponse | None = None
    unread_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class UnreadCountResponse(BaseModel):
    count: int
