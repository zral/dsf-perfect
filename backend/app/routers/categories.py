import uuid
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.category import Category

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
