"""Seed script for initial categories.

Usage:
    python -m app.seed
"""

import asyncio
import uuid

from sqlalchemy import select

from app.database import Base, async_session_factory, engine
from app.models.category import Category

CATEGORIES = [
    {"name": "Bil og motor", "slug": "bil-og-motor", "icon": "Car", "position": 0},
    {"name": "Eiendom", "slug": "eiendom", "icon": "Home", "position": 1},
    {"name": "Jobb", "slug": "jobb", "icon": "Briefcase", "position": 2},
    {"name": "Elektronikk", "slug": "elektronikk", "icon": "Smartphone", "position": 3},
    {"name": "Klær og mote", "slug": "klaer-og-mote", "icon": "Shirt", "position": 4},
    {"name": "Møbler og interiør", "slug": "mobler-og-interior", "icon": "Sofa", "position": 5},
    {"name": "Tjenester", "slug": "tjenester", "icon": "Wrench", "position": 6},
    {"name": "Barn og familie", "slug": "barn-og-familie", "icon": "Baby", "position": 7},
    {"name": "Sport og fritid", "slug": "sport-og-fritid", "icon": "Dumbbell", "position": 8},
    {"name": "Hobby og underholdning", "slug": "hobby-og-underholdning", "icon": "Gamepad2", "position": 9},
    {"name": "Bøker og media", "slug": "boker-og-media", "icon": "BookOpen", "position": 10},
    {"name": "Dyr og utstyr", "slug": "dyr-og-utstyr", "icon": "PawPrint", "position": 11},
]


async def seed_categories() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if categories already exist
        result = await session.execute(select(Category).limit(1))
        if result.scalar_one_or_none() is not None:
            print("Categories already seeded, skipping.")
            return

        for cat_data in CATEGORIES:
            category = Category(id=uuid.uuid4(), **cat_data)
            session.add(category)

        await session.commit()
        print(f"Seeded {len(CATEGORIES)} categories successfully.")


if __name__ == "__main__":
    asyncio.run(seed_categories())
