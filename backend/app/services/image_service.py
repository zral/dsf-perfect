import os
import uuid
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.ad import Ad
from app.models.ad_image import AdImage

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_ORIGINAL_SIZE = (1200, 1200)
THUMBNAIL_SIZE = (400, 300)


async def upload_image(
    db: AsyncSession, ad_id: uuid.UUID, user_id: uuid.UUID, file: UploadFile
) -> AdImage:
    # Verify ad exists and user is owner
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
            detail="You can only upload images to your own ads",
        )

    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid file type: {file.content_type}. Allowed: JPEG, PNG, WebP",
        )

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File too large. Maximum size is 5MB",
        )

    # Process with Pillow
    try:
        img = Image.open(BytesIO(contents))
        img.verify()
        # Re-open after verify
        img = Image.open(BytesIO(contents))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid image file",
        )

    # Resize original
    img.thumbnail(MAX_ORIGINAL_SIZE, Image.Resampling.LANCZOS)

    # Create thumbnail
    thumb = img.copy()
    thumb.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)

    # Save files
    settings = get_settings()
    image_id = uuid.uuid4()
    ad_dir = Path(settings.UPLOAD_DIR) / "ads" / str(ad_id)
    ad_dir.mkdir(parents=True, exist_ok=True)

    original_path = ad_dir / f"{image_id}.webp"
    thumb_path = ad_dir / f"{image_id}_thumb.webp"

    # Convert to RGB if necessary (e.g., RGBA PNGs)
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    if thumb.mode in ("RGBA", "P"):
        thumb = thumb.convert("RGB")

    img.save(str(original_path), "WEBP", quality=85)
    thumb.save(str(thumb_path), "WEBP", quality=80)

    # Count existing images to determine position
    from sqlalchemy import func as sqlfunc

    count_result = await db.execute(
        select(sqlfunc.count()).select_from(AdImage).where(AdImage.ad_id == ad_id)
    )
    position = count_result.scalar() or 0

    # Create DB record
    url = f"/uploads/ads/{ad_id}/{image_id}.webp"
    thumbnail_url = f"/uploads/ads/{ad_id}/{image_id}_thumb.webp"

    ad_image = AdImage(
        id=image_id,
        ad_id=ad_id,
        url=url,
        thumbnail_url=thumbnail_url,
        position=position,
    )
    db.add(ad_image)
    await db.flush()
    return ad_image


async def delete_image(
    db: AsyncSession, ad_id: uuid.UUID, image_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    # Verify ad ownership
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
            detail="You can only delete images from your own ads",
        )

    result = await db.execute(
        select(AdImage).where(AdImage.id == image_id, AdImage.ad_id == ad_id)
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found",
        )

    # Try to remove files
    settings = get_settings()
    for suffix in ["", "_thumb"]:
        file_path = Path(settings.UPLOAD_DIR) / "ads" / str(ad_id) / f"{image_id}{suffix}.webp"
        if file_path.exists():
            os.remove(file_path)

    await db.delete(image)
    await db.flush()
