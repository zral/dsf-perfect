import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func as sa_func
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.ad import Ad, AdStatus
from app.models.user import User
from app.schemas.ad import AdListResponse, AdResponse
from app.schemas.user import UserPublicResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.get("/{user_id}", response_model=UserPublicResponse)
async def get_public_profile(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> UserPublicResponse:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserPublicResponse.model_validate(user)


@router.get("/{user_id}/ads", response_model=AdListResponse)
async def get_user_ads(
    user_id: uuid.UUID,
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
) -> AdListResponse:
    # Check user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    query = (
        select(Ad)
        .where(Ad.seller_id == user_id, Ad.status == AdStatus.ACTIVE.value)
        .options(
            selectinload(Ad.images),
            selectinload(Ad.seller),
            selectinload(Ad.category),
        )
        .order_by(Ad.created_at.desc())
    )

    count_q = select(sa_func.count()).select_from(
        select(Ad.id)
        .where(Ad.seller_id == user_id, Ad.status == AdStatus.ACTIVE.value)
        .subquery()
    )
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    offset = (page - 1) * per_page
    result = await db.execute(query.offset(offset).limit(per_page))
    items = list(result.scalars().all())
    pages = math.ceil(total / per_page) if per_page > 0 else 0

    return AdListResponse(
        items=[AdResponse.model_validate(ad) for ad in items],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.flush()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)
