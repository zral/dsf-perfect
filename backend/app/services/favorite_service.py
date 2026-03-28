import uuid

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ad import Ad, AdStatus
from app.models.favorite import Favorite


async def add_favorite(db: AsyncSession, user_id: uuid.UUID, ad_id: uuid.UUID) -> Favorite:
    # Check ad exists
    result = await db.execute(select(Ad).where(Ad.id == ad_id))
    ad = result.scalar_one_or_none()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found",
        )

    # Check if already favorited (idempotent)
    result = await db.execute(
        select(Favorite).where(Favorite.user_id == user_id, Favorite.ad_id == ad_id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    fav = Favorite(id=uuid.uuid4(), user_id=user_id, ad_id=ad_id)
    db.add(fav)
    await db.flush()
    return fav


async def remove_favorite(db: AsyncSession, user_id: uuid.UUID, ad_id: uuid.UUID) -> None:
    await db.execute(
        delete(Favorite).where(Favorite.user_id == user_id, Favorite.ad_id == ad_id)
    )
    await db.flush()


async def list_favorites(db: AsyncSession, user_id: uuid.UUID) -> list[Ad]:
    result = await db.execute(
        select(Ad)
        .join(Favorite, Favorite.ad_id == Ad.id)
        .where(Favorite.user_id == user_id)
        .options(
            selectinload(Ad.images),
            selectinload(Ad.seller),
            selectinload(Ad.category),
        )
        .order_by(Favorite.created_at.desc())
    )
    return list(result.scalars().all())


async def is_favorited(db: AsyncSession, user_id: uuid.UUID, ad_id: uuid.UUID) -> bool:
    result = await db.execute(
        select(Favorite.id).where(Favorite.user_id == user_id, Favorite.ad_id == ad_id)
    )
    return result.scalar_one_or_none() is not None
