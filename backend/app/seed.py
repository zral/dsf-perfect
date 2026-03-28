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

# Subcategories: parent_slug -> list of {name, slug, icon}
SUBCATEGORIES: dict[str, list[dict]] = {
    "bil-og-motor": [
        {"name": "Biler", "slug": "biler", "icon": "Car"},
        {"name": "Motorsykler", "slug": "motorsykler", "icon": "Bike"},
        {"name": "Deler og tilbehør", "slug": "deler-og-tilbehor", "icon": "Wrench"},
    ],
    "elektronikk": [
        {"name": "Mobiltelefoner", "slug": "mobiltelefoner", "icon": "Smartphone"},
        {"name": "Datamaskiner", "slug": "datamaskiner", "icon": "Laptop"},
        {"name": "TV og lyd", "slug": "tv-og-lyd", "icon": "Tv"},
    ],
    "klaer-og-mote": [
        {"name": "Herre", "slug": "herre", "icon": "Shirt"},
        {"name": "Dame", "slug": "dame", "icon": "Shirt"},
        {"name": "Barn", "slug": "barneklaer", "icon": "Baby"},
    ],
    "mobler-og-interior": [
        {"name": "Sofaer", "slug": "sofaer", "icon": "Sofa"},
        {"name": "Bord og stoler", "slug": "bord-og-stoler", "icon": "Table"},
        {"name": "Oppbevaring", "slug": "oppbevaring", "icon": "Archive"},
    ],
    "sport-og-fritid": [
        {"name": "Ski", "slug": "ski", "icon": "Mountain"},
        {"name": "Sykkel", "slug": "sykkel", "icon": "Bike"},
        {"name": "Trening", "slug": "trening", "icon": "Dumbbell"},
        {"name": "Friluftsliv", "slug": "friluftsliv", "icon": "Tent"},
    ],
    "barn-og-familie": [
        {"name": "Leker", "slug": "leker", "icon": "Gamepad2"},
        {"name": "Barnevogn", "slug": "barnevogn", "icon": "Baby"},
        {"name": "Barnemøbler", "slug": "barnemobler", "icon": "Sofa"},
    ],
}


async def seed_categories() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if categories already exist
        result = await session.execute(select(Category).limit(1))
        if result.scalar_one_or_none() is not None:
            print("Categories already seeded, skipping.")
            return

        # Seed main categories
        parent_map: dict[str, uuid.UUID] = {}
        for cat_data in CATEGORIES:
            cat_id = uuid.uuid4()
            category = Category(id=cat_id, **cat_data)
            session.add(category)
            parent_map[cat_data["slug"]] = cat_id

        # Seed subcategories
        sub_count = 0
        for parent_slug, children in SUBCATEGORIES.items():
            parent_id = parent_map.get(parent_slug)
            if not parent_id:
                continue
            for pos, child in enumerate(children):
                sub = Category(
                    id=uuid.uuid4(),
                    parent_id=parent_id,
                    name=child["name"],
                    slug=child["slug"],
                    icon=child["icon"],
                    position=pos,
                )
                session.add(sub)
                sub_count += 1

        await session.commit()
        print(f"Seeded {len(CATEGORIES)} categories and {sub_count} subcategories.")


if __name__ == "__main__":
    asyncio.run(seed_categories())
