from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.rate_limit import rate_limit
from app.schemas.ad import AdListResponse, AdResponse
from app.schemas.search import SearchParams, SuggestResponse, SuggestionItem
from app.services import search_service

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("/")
async def search_ads(
    q: str | None = None,
    category: str | None = None,
    location: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    condition: str | None = None,
    sort: str = "newest",
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
) -> dict:
    params = SearchParams(
        q=q,
        category=category,
        location=location,
        price_min=price_min,
        price_max=price_max,
        condition=condition,
        sort=sort,
        page=page,
        per_page=per_page,
    )
    result = await search_service.search_ads(db, params)
    return {
        "items": [AdResponse.model_validate(ad) for ad in result["items"]],
        "total": result["total"],
        "page": result["page"],
        "per_page": result["per_page"],
        "pages": result["pages"],
        "query": result["query"],
    }


@router.get(
    "/suggest",
    response_model=SuggestResponse,
    dependencies=[Depends(rate_limit(max_requests=10, window_seconds=60))],
)
async def suggest(
    q: str = "",
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
) -> SuggestResponse:
    results = await search_service.suggest(db, q, limit)
    return SuggestResponse(
        suggestions=[SuggestionItem(**item) for item in results]
    )
