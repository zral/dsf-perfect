from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.ad import AdResponse
from app.services import favorite_service

router = APIRouter(prefix="/api/v1/favorites", tags=["favorites"])


@router.get("/", response_model=list[AdResponse])
async def list_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AdResponse]:
    ads = await favorite_service.list_favorites(db, current_user.id)
    return [AdResponse.model_validate(ad) for ad in ads]
