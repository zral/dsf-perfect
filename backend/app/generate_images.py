"""Generate mock product images for seed ads.

Usage:
    python -m app.generate_images
"""

import asyncio
import os
import uuid
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.database import Base, async_session_factory, engine
from app.models.ad import Ad
from app.models.ad_image import AdImage
from app.models.category import Category

settings = get_settings()
UPLOAD_DIR = Path(settings.UPLOAD_DIR)

# Category-based color schemes (bg_color, accent_color)
CATEGORY_COLORS = {
    "bil-og-motor": ("#1e3a5f", "#4a90d9"),
    "eiendom": ("#2d5016", "#6abf40"),
    "jobb": ("#3d3d3d", "#a0a0a0"),
    "elektronikk": ("#1a1a2e", "#e94560"),
    "klaer-og-mote": ("#4a1942", "#c74b7a"),
    "mobler-og-interior": ("#5c3d2e", "#d4a574"),
    "tjenester": ("#1b4332", "#40916c"),
    "barn-og-familie": ("#0077b6", "#90e0ef"),
    "sport-og-fritid": ("#d62828", "#f77f00"),
    "hobby-og-underholdning": ("#7b2cbf", "#c77dff"),
    "boker-og-media": ("#3d405b", "#e07a5f"),
    "dyr-og-utstyr": ("#606c38", "#dda15e"),
}

CATEGORY_ICONS = {
    "bil-og-motor": "🚗",
    "eiendom": "🏠",
    "jobb": "💼",
    "elektronikk": "📱",
    "klaer-og-mote": "👕",
    "mobler-og-interior": "🛋️",
    "tjenester": "🔧",
    "barn-og-familie": "👶",
    "sport-og-fritid": "🏋️",
    "hobby-og-underholdning": "🎮",
    "boker-og-media": "📚",
    "dyr-og-utstyr": "🐾",
}


def create_product_image(
    title: str,
    category_slug: str,
    size: tuple[int, int] = (800, 600),
) -> Image.Image:
    """Create a styled mock product image."""
    bg_color, accent = CATEGORY_COLORS.get(category_slug, ("#2c3e50", "#3498db"))

    img = Image.new("RGB", size, bg_color)
    draw = ImageDraw.Draw(img)

    # Gradient-like effect with rectangles
    w, h = size
    for i in range(0, h, 4):
        factor = i / h
        r = int(int(bg_color[1:3], 16) * (1 - factor * 0.3))
        g = int(int(bg_color[3:5], 16) * (1 - factor * 0.3))
        b = int(int(bg_color[5:7], 16) * (1 - factor * 0.3))
        draw.rectangle([(0, i), (w, i + 4)], fill=(r, g, b))

    # Accent circle
    circle_size = min(w, h) // 3
    cx, cy = w // 2, h // 2 - 30
    draw.ellipse(
        [cx - circle_size, cy - circle_size, cx + circle_size, cy + circle_size],
        fill=accent,
        outline=None,
    )

    # Icon emoji in center
    icon = CATEGORY_ICONS.get(category_slug, "📦")
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 64)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except (OSError, IOError):
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
        except (OSError, IOError):
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()

    # Title text at bottom
    short_title = title[:40] + ("..." if len(title) > 40 else "")
    bbox = draw.textbbox((0, 0), short_title, font=font_small)
    tw = bbox[2] - bbox[0]
    draw.text(
        ((w - tw) // 2, h - 80),
        short_title,
        fill="white",
        font=font_small,
    )

    # Category label top-left
    draw.rounded_rectangle(
        [20, 20, 200, 55],
        radius=8,
        fill=accent,
    )
    cat_name = category_slug.replace("-", " ").title()[:20]
    draw.text((30, 25), cat_name, fill="white", font=font_small)

    return img


def create_thumbnail(img: Image.Image, size: tuple[int, int] = (400, 300)) -> Image.Image:
    """Create thumbnail from full image."""
    thumb = img.copy()
    thumb.thumbnail(size, Image.Resampling.LANCZOS)
    return thumb


async def generate_all_images() -> None:
    """Generate images for all ads that don't have any."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Get ads without images, with category
        result = await session.execute(
            select(Ad)
            .options(selectinload(Ad.images), selectinload(Ad.category))
            .where(Ad.status == "ACTIVE")
        )
        ads = result.scalars().all()

        count = 0
        for ad in ads:
            if ad.images:
                continue

            cat_slug = ad.category.slug if ad.category else "unknown"

            # Create directories
            ad_dir = UPLOAD_DIR / "ads" / str(ad.id)
            ad_dir.mkdir(parents=True, exist_ok=True)

            # Generate 1-2 images per ad
            num_images = 2 if len(ad.title) > 20 else 1

            for pos in range(num_images):
                image_id = uuid.uuid4()

                # Create images
                full_img = create_product_image(ad.title, cat_slug)
                thumb_img = create_thumbnail(full_img)

                # Save as WebP
                full_path = ad_dir / f"{image_id}.webp"
                thumb_path = ad_dir / f"{image_id}_thumb.webp"
                full_img.save(str(full_path), "WEBP", quality=80)
                thumb_img.save(str(thumb_path), "WEBP", quality=80)

                # Create DB record
                ad_image = AdImage(
                    id=image_id,
                    ad_id=ad.id,
                    url=f"/uploads/ads/{ad.id}/{image_id}.webp",
                    thumbnail_url=f"/uploads/ads/{ad.id}/{image_id}_thumb.webp",
                    position=pos,
                )
                session.add(ad_image)
                count += 1

        await session.commit()
        print(f"Generated {count} mock images for {len([a for a in ads if not a.images])} ads.")


if __name__ == "__main__":
    asyncio.run(generate_all_images())
