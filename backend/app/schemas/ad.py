import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.ad import AdCondition, AdStatus, PriceType


class AdCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    price: int = Field(ge=0)
    price_type: PriceType = PriceType.FIXED
    condition: AdCondition = AdCondition.GOOD
    category_id: uuid.UUID
    location: str | None = None


class AdUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10, max_length=5000)
    price: int | None = Field(default=None, ge=0)
    price_type: PriceType | None = None
    condition: AdCondition | None = None
    category_id: uuid.UUID | None = None
    location: str | None = None


class AdImageResponse(BaseModel):
    id: uuid.UUID
    url: str
    thumbnail_url: str
    position: int

    model_config = {"from_attributes": True}


class SellerBrief(BaseModel):
    id: uuid.UUID
    name: str
    avatar_url: str | None = None
    rating: float

    model_config = {"from_attributes": True}


class CategoryBrief(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    icon: str | None = None

    model_config = {"from_attributes": True}


class AdResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    price: int
    price_type: str
    condition: str
    status: str
    location: str | None = None
    views_count: int
    created_at: datetime
    updated_at: datetime
    images: list[AdImageResponse] = []
    seller: SellerBrief
    category: CategoryBrief

    model_config = {"from_attributes": True}


class AdListResponse(BaseModel):
    items: list[AdResponse]
    total: int
    page: int
    per_page: int
    pages: int
