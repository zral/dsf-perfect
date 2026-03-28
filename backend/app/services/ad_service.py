import math
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ad import Ad, AdStatus
from app.models.ad_image import AdImage
from app.models.category import Category
from app.schemas.ad import AdCreate, AdUpdate


def _ad_query():
    """Base query with eager-loaded relationships."""
    return select(Ad).options(
        selectinload(Ad.images),
        selectinload(Ad.seller),
        selectinload(Ad.category),
    )


async def create_ad(
    db: AsyncSession, user_id: uuid.UUID, data: AdCreate
) -> Ad:
    # Verify category exists
    result = await db.execute(select(Category).where(Category.id == data.category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    ad = Ad(
        id=uuid.uuid4(),
        seller_id=user_id,
        category_id=data.category_id,
        title=data.title,
        description=data.description,
        price=data.price,
        price_type=data.price_type.value,
        condition=data.condition.value,
        status=AdStatus.ACTIVE.value,
        location=data.location,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(ad)
    await db.flush()

    # Re-fetch with relationships
    result = await db.execute(_ad_query().where(Ad.id == ad.id))
    return result.scalar_one()


async def get_ad(db: AsyncSession, ad_id: uuid.UUID) -> Ad:
    result = await db.execute(_ad_query().where(Ad.id == ad_id))
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    # Increment views
    ad.views_count += 1
    await db.flush()
    return ad


async def list_ads(
    db: AsyncSession,
    page: int = 1,
    per_page: int = 20,
    category_slug: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    condition: str | None = None,
    sort: str = "newest",
) -> dict:
    query = _ad_query().where(Ad.status == AdStatus.ACTIVE.value)

    if category_slug:
        result = await db.execute(
            select(Category).where(Category.slug == category_slug)
        )
        category = result.scalar_one_or_none()
        if category:
            query = query.where(Ad.category_id == category.id)

    if price_min is not None:
        query = query.where(Ad.price >= price_min)
    if price_max is not None:
        query = query.where(Ad.price <= price_max)
    if condition:
        query = query.where(Ad.condition == condition)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sort
    if sort == "price_asc":
        query = query.order_by(Ad.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Ad.price.desc())
    else:  # newest
        query = query.order_by(Ad.created_at.desc())

    # Paginate
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)

    result = await db.execute(query)
    items = list(result.scalars().all())

    pages = math.ceil(total / per_page) if per_page > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


async def update_ad(
    db: AsyncSession, ad_id: uuid.UUID, user_id: uuid.UUID, data: AdUpdate
) -> Ad:
    result = await db.execute(_ad_query().where(Ad.id == ad_id))
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    if ad.seller_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own ads",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "price_type" and value is not None:
            value = value.value if hasattr(value, "value") else value
        if field == "condition" and value is not None:
            value = value.value if hasattr(value, "value") else value
        setattr(ad, field, value)

    await db.flush()
    await db.refresh(ad)
    return ad


async def delete_ad(
    db: AsyncSession, ad_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    result = await db.execute(select(Ad).where(Ad.id == ad_id))
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )
    if ad.seller_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own ads",
        )
    await db.delete(ad)
    await db.flush()


async def get_similar_ads(
    db: AsyncSession, ad_id: uuid.UUID, limit: int = 6
) -> list[Ad]:
    # Get the ad's category
    result = await db.execute(select(Ad).where(Ad.id == ad_id))
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )

    # Find other ACTIVE ads in same category, exclude current ad
    query = (
        _ad_query()
        .where(Ad.category_id == ad.category_id)
        .where(Ad.status == AdStatus.ACTIVE.value)
        .where(Ad.id != ad_id)
        .order_by(Ad.created_at.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    return list(result.scalars().all())
