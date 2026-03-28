import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_search import SavedSearch
from app.schemas.saved_search import SavedSearchCreate


async def create_saved_search(
    db: AsyncSession, user_id: uuid.UUID, data: SavedSearchCreate
) -> SavedSearch:
    ss = SavedSearch(
        id=uuid.uuid4(),
        user_id=user_id,
        query=data.query,
        category_slug=data.category_slug,
        filters=data.filters or {},
        notify=data.notify,
    )
    db.add(ss)
    await db.flush()
    return ss


async def list_saved_searches(db: AsyncSession, user_id: uuid.UUID) -> list[SavedSearch]:
    result = await db.execute(
        select(SavedSearch)
        .where(SavedSearch.user_id == user_id)
        .order_by(SavedSearch.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_saved_search(
    db: AsyncSession, search_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    result = await db.execute(select(SavedSearch).where(SavedSearch.id == search_id))
    ss = result.scalar_one_or_none()
    if not ss:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved search not found",
        )
    if ss.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own saved searches",
        )
    await db.delete(ss)
    await db.flush()
