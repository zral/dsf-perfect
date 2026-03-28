import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.category import Category
from app.schemas.ad import AdListResponse, AdResponse
from app.services import ad_service

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


class CategoryChild(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    icon: str | None = None
    position: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    icon: str | None = None
    position: int
    created_at: datetime
    children: list[CategoryChild] = []

    model_config = {"from_attributes": True}


def _build_tree(categories: list[Category]) -> list[CategoryResponse]:
    """Build a nested tree from a flat list of categories."""
    top_level = [c for c in categories if c.parent_id is None]
    top_level.sort(key=lambda c: c.position)

    result = []
    for cat in top_level:
        children = sorted(
            [c for c in categories if c.parent_id == cat.id],
            key=lambda c: c.position,
        )
        result.append(
            CategoryResponse(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                icon=cat.icon,
                position=cat.position,
                created_at=cat.created_at,
                children=[CategoryChild.model_validate(ch) for ch in children],
            )
        )
    return result


@router.get("/", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryResponse]:
    result = await db.execute(select(Category).order_by(Category.position))
    categories = list(result.scalars().all())
    return _build_tree(categories)


@router.get("/{slug}/ads", response_model=AdListResponse)
async def list_category_ads(
    slug: str,
    page: int = 1,
    per_page: int = 20,
    sort: str = "newest",
    db: AsyncSession = Depends(get_db),
) -> AdListResponse:
    result = await ad_service.list_ads(
        db,
        page=page,
        per_page=per_page,
        category_slug=slug,
        sort=sort,
    )
    return AdListResponse(
        items=[AdResponse.model_validate(ad) for ad in result["items"]],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
        pages=result["pages"],
    )
