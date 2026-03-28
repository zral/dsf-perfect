import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.saved_search import SavedSearchCreate, SavedSearchResponse
from app.services import saved_search_service

router = APIRouter(prefix="/api/v1/saved-searches", tags=["saved-searches"])


@router.get("/", response_model=list[SavedSearchResponse])
async def list_saved_searches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SavedSearchResponse]:
    items = await saved_search_service.list_saved_searches(db, current_user.id)
    return [SavedSearchResponse.model_validate(s) for s in items]


@router.post(
    "/",
    response_model=SavedSearchResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_saved_search(
    body: SavedSearchCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SavedSearchResponse:
    ss = await saved_search_service.create_saved_search(db, current_user.id, body)
    return SavedSearchResponse.model_validate(ss)


@router.delete("/{search_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_search(
    search_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await saved_search_service.delete_saved_search(db, search_id, current_user.id)
