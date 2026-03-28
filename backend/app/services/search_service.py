import math

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ad import Ad, AdStatus
from app.models.category import Category
from app.schemas.search import SearchParams


def _ad_query():
    """Base query with eager-loaded relationships."""
    return select(Ad).options(
        selectinload(Ad.images),
        selectinload(Ad.seller),
        selectinload(Ad.category),
    )


async def search_ads(db: AsyncSession, params: SearchParams) -> dict:
    """Full-text search with filters, sorting, and pagination."""
    query = _ad_query().where(Ad.status == AdStatus.ACTIVE.value)

    # Text search: split into words, AND across words, OR(title, description) per word
    if params.q:
        words = params.q.strip().split()
        for word in words:
            pattern = f"%{word}%"
            query = query.where(
                or_(
                    Ad.title.ilike(pattern),
                    Ad.description.ilike(pattern),
                )
            )

    # Category filter by slug
    if params.category:
        result = await db.execute(
            select(Category).where(Category.slug == params.category)
        )
        category = result.scalar_one_or_none()
        if category:
            query = query.where(Ad.category_id == category.id)

    # Location filter
    if params.location:
        query = query.where(Ad.location.ilike(f"%{params.location}%"))

    # Price range
    if params.price_min is not None:
        query = query.where(Ad.price >= params.price_min)
    if params.price_max is not None:
        query = query.where(Ad.price <= params.price_max)

    # Condition filter
    if params.condition:
        query = query.where(Ad.condition == params.condition)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Sort
    if params.sort == "price_asc":
        query = query.order_by(Ad.price.asc())
    elif params.sort == "price_desc":
        query = query.order_by(Ad.price.desc())
    else:  # newest
        query = query.order_by(Ad.created_at.desc())

    # Paginate
    offset = (params.page - 1) * params.per_page
    query = query.offset(offset).limit(params.per_page)

    result = await db.execute(query)
    items = list(result.scalars().all())

    pages = math.ceil(total / params.per_page) if params.per_page > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": params.page,
        "per_page": params.per_page,
        "pages": pages,
        "query": params.q or "",
    }


async def suggest(db: AsyncSession, q: str, limit: int = 5) -> list[dict]:
    """Autocomplete suggestions based on ad titles."""
    if len(q) < 2:
        return []

    # Prefix match first
    prefix_pattern = f"{q}%"
    suggestions = await _get_suggestions(db, prefix_pattern, limit)

    # Fallback to contains if prefix gives < limit results
    if len(suggestions) < limit:
        contains_pattern = f"%{q}%"
        fallback = await _get_suggestions(db, contains_pattern, limit)
        # Merge, avoiding duplicates
        seen = {s["text"] for s in suggestions}
        for item in fallback:
            if item["text"] not in seen:
                suggestions.append(item)
                seen.add(item["text"])
            if len(suggestions) >= limit:
                break

    return suggestions[:limit]


async def _get_suggestions(db: AsyncSession, pattern: str, limit: int) -> list[dict]:
    """Get title suggestions matching a pattern, grouped by category."""
    query = (
        select(
            Ad.title,
            Category.name.label("category_name"),
            func.count().label("cnt"),
        )
        .join(Category, Ad.category_id == Category.id)
        .where(Ad.status == AdStatus.ACTIVE.value)
        .where(Ad.title.ilike(pattern))
        .group_by(Ad.title, Category.name)
        .order_by(func.count().desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        {"text": row.title, "category": row.category_name, "count": row.cnt}
        for row in rows
    ]
