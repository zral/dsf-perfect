import uuid
from datetime import datetime

from pydantic import BaseModel


class SavedSearchCreate(BaseModel):
    query: str | None = None
    category_slug: str | None = None
    filters: dict | None = None
    notify: bool = False


class SavedSearchResponse(BaseModel):
    id: uuid.UUID
    query: str | None = None
    category_slug: str | None = None
    filters: dict
    notify: bool
    created_at: datetime

    model_config = {"from_attributes": True}
