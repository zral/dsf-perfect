import uuid

from fastapi import APIRouter, Depends, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.middleware.rate_limit import rate_limit
from app.models.user import User
from app.schemas.ad import AdCreate, AdImageResponse, AdListResponse, AdResponse, AdUpdate
from app.services import ad_service, image_service

router = APIRouter(prefix="/api/v1/ads", tags=["ads"])


@router.get("/", response_model=AdListResponse)
async def list_ads(
    page: int = 1,
    per_page: int = 20,
    category: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    condition: str | None = None,
    sort: str = "newest",
    db: AsyncSession = Depends(get_db),
) -> AdListResponse:
    result = await ad_service.list_ads(
        db,
        page=page,
        per_page=per_page,
        category_slug=category,
        price_min=price_min,
        price_max=price_max,
        condition=condition,
        sort=sort,
    )
    return AdListResponse(
        items=[AdResponse.model_validate(ad) for ad in result["items"]],
        total=result["total"],
        page=result["page"],
        per_page=result["per_page"],
        pages=result["pages"],
    )


@router.post(
    "/",
    response_model=AdResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(max_requests=10, window_seconds=60))],
)
async def create_ad(
    body: AdCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdResponse:
    ad = await ad_service.create_ad(db, current_user.id, body)
    return AdResponse.model_validate(ad)


@router.get("/{ad_id}", response_model=AdResponse)
async def get_ad(
    ad_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> AdResponse:
    ad = await ad_service.get_ad(db, ad_id)
    return AdResponse.model_validate(ad)


@router.patch("/{ad_id}", response_model=AdResponse)
async def update_ad(
    ad_id: uuid.UUID,
    body: AdUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdResponse:
    ad = await ad_service.update_ad(db, ad_id, current_user.id, body)
    return AdResponse.model_validate(ad)


@router.delete("/{ad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ad(
    ad_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await ad_service.delete_ad(db, ad_id, current_user.id)


@router.post(
    "/{ad_id}/images",
    response_model=AdImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    ad_id: uuid.UUID,
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdImageResponse:
    image = await image_service.upload_image(db, ad_id, current_user.id, file)
    return AdImageResponse.model_validate(image)


@router.delete(
    "/{ad_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_image(
    ad_id: uuid.UUID,
    image_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    await image_service.delete_image(db, ad_id, image_id, current_user.id)
