"""Seed script for categories, test users and sample ads.

Usage:
    python -m app.seed
    python -m app.seed --with-data   # Include test users and ads
"""

import asyncio
import random
import sys
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.database import Base, async_session_factory, engine
from app.models.ad import Ad
from app.models.category import Category
from app.models.user import User
from app.utils.security import hash_password

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


TEST_USERS = [
    {"name": "Ola Nordmann", "email": "ola@example.com", "location": "Oslo"},
    {"name": "Kari Hansen", "email": "kari@example.com", "location": "Bergen"},
    {"name": "Per Olsen", "email": "per@example.com", "location": "Trondheim"},
    {"name": "Lisa Johansen", "email": "lisa@example.com", "location": "Stavanger"},
    {"name": "Erik Larsen", "email": "erik@example.com", "location": "Tromsø"},
    {"name": "Maria Pedersen", "email": "maria@example.com", "location": "Drammen"},
    {"name": "Anders Berg", "email": "anders@example.com", "location": "Kristiansand"},
    {"name": "Sofie Nilsen", "email": "sofie@example.com", "location": "Fredrikstad"},
    {"name": "Jonas Bakken", "email": "jonas@example.com", "location": "Bodø"},
    {"name": "Ingrid Dahl", "email": "ingrid@example.com", "location": "Ålesund"},
]

# (category_slug, title, description, price_øre, price_type, condition)
SAMPLE_ADS = [
    ("elektronikk", "iPhone 15 Pro Max 256GB", "Selger min iPhone 15 Pro Max, kjøpt i september. Helt strøken, alltid brukt med deksel og skjermbeskytter. Originaleske og lader medfølger.", 1299900, "FIXED", "LIKE_NEW"),
    ("elektronikk", "MacBook Pro 14\" M3 Pro", "Fantastisk bærbar for utvikling og kreativt arbeid. 18GB RAM, 512GB SSD. Brukt i 6 måneder, batterihelse 98%. Kvittering medfølger.", 2499900, "FIXED", "LIKE_NEW"),
    ("elektronikk", "Samsung Galaxy S24 Ultra", "Toppmodell med S Pen. 512GB lagring, titanium black. Komplett med originaleske. Har fått ny telefon gjennom jobb.", 999900, "FIXED", "GOOD"),
    ("elektronikk", "Sony WH-1000XM5 hodetelefoner", "Beste støydempende hodetelefoner på markedet. Brukt daglig i et halvt år, perfekt stand. Lader og etui medfølger.", 249900, "FIXED", "GOOD"),
    ("elektronikk", "iPad Air M2 256GB", "Brukt til notater på universitetet. Meget pen stand. Medfølger Apple Pencil 2 og tastaturetui.", 599900, "FIXED", "LIKE_NEW"),
    ("elektronikk", "Nintendo Switch OLED + 5 spill", "Selger min Switch OLED med Pro Controller og 5 spill (Zelda TOTK, Mario Kart, Smash Bros, Pokemon, Animal Crossing). Alt i originalemballasje.", 399900, "FIXED", "GOOD"),
    ("bil-og-motor", "Tesla Model 3 2022 Long Range", "Flott elbil med lang rekkevidde. 45 000 km, full servicehistorikk hos Tesla. Hvit med sort interiør. Vinterhjul inkludert.", 35990000, "FIXED", "GOOD"),
    ("bil-og-motor", "VW Golf GTI 2021", "Sporty og praktisk! 230hk, DSG-girkasse, LED-lys, adaptiv cruise. 38 000 km, nettopp servicert. EU godkjent til 2027.", 34990000, "FIXED", "GOOD"),
    ("bil-og-motor", "Toyota RAV4 Hybrid 2023", "Familiens favoritt-SUV. Lavt forbruk, masse plass. 22 000 km, som ny. Garanti til 2028.", 44990000, "FIXED", "LIKE_NEW"),
    ("bil-og-motor", "Yamaha MT-07 2022", "Perfekt first-bike eller pendlersykkel. 8 000 km, garasjelagret om vinteren. Nylig servicert.", 8990000, "FIXED", "LIKE_NEW"),
    ("mobler-og-interior", "IKEA KIVIK 3-seter sofa", "Grå stoffsofa i god stand. Trekket kan vaskes. Må hentes i Oslo sentrum.", 350000, "FIXED", "GOOD"),
    ("mobler-og-interior", "Eames Lounge Chair replika", "Flott replika i valnøtt og sort skinn. Veldig komfortabel. Brukt i 2 år, ingen slitasje. Nypris 15 000 kr.", 800000, "FIXED", "GOOD"),
    ("mobler-og-interior", "Spisebord i eik 180x90cm", "Massiv eik, skandinavisk design. 6 stoler inkludert (Hay J77 replika). Perfekt for familier.", 1200000, "BID", "LIKE_NEW"),
    ("mobler-og-interior", "Standing desk elektrisk 160cm", "Elektrisk hev/senk-pult fra Flexispot. Hvit plate, grått understell. Fungerer perfekt.", 350000, "FIXED", "GOOD"),
    ("klaer-og-mote", "Canada Goose Expedition Parka L", "Ekte Canada Goose, størrelse L. Kjøpt på Eger i Oslo. Brukt to vintre, meget godt vedlikeholdt. Kvittering finnes.", 800000, "FIXED", "GOOD"),
    ("klaer-og-mote", "Nike Air Jordan 1 Retro High OG str 43", "Chicago colorway, helt nye i eske. Aldri brukt, kjøpt via SNKRS. Størrelse EU 43.", 350000, "FIXED", "NEW"),
    ("klaer-og-mote", "Burberry trenchcoat dame M", "Klassisk Burberry trenchcoat i beige. Størrelse M/38. Kjøpt i London, brukt noen ganger. Tidløst plagg.", 600000, "FIXED", "LIKE_NEW"),
    ("sport-og-fritid", "Trek Fuel EX 8 2023 terrengsykkel", "Full-suspension terrengsykkel, str L. Shimano XT-gruppe, Fox-demping. Kjørt en sesong, godt vedlikeholdt.", 3500000, "FIXED", "GOOD"),
    ("sport-og-fritid", "Rossignol Experience 88 Ti ski 180cm", "Allround-ski i toppklasse. Brukt 20 dager, nyslipte kanter. Bindinger Marker Griffon 13 ID medfølger.", 450000, "FIXED", "GOOD"),
    ("sport-og-fritid", "Norrøna Trollveggen Gore-Tex Pro jakke L", "Ekspedisjonsjakke i beste kvalitet. Brukt på noen toppturer, godt vedlikeholdt. Nypris 6 500 kr.", 350000, "FIXED", "GOOD"),
    ("sport-og-fritid", "Garmin Fenix 7X Solar", "Toppmodell GPS-klokke med sollading. Brukt i 8 måneder. Perfekt for løping, sykling og fjellturer.", 549900, "FIXED", "LIKE_NEW"),
    ("barn-og-familie", "Stokke Tripp Trapp barnestol", "Klassikeren! Hvit farge, med babyset og pute. Brukt av ett barn, god stand.", 150000, "FIXED", "GOOD"),
    ("barn-og-familie", "Bugaboo Fox 5 barnevogn", "Komplett barnevogn med liggedel og sittedel. Sort/grå. Brukt i 1 år, velholdt. Regntrekk og insektsnett medfølger.", 800000, "FIXED", "GOOD"),
    ("barn-og-familie", "LEGO Technic Porsche 911 GT3 RS", "Uåpnet og forseglet. Perfekt gave! Modellnr 42056. Utgått fra LEGO.", 450000, "FIXED", "NEW"),
    ("hobby-og-underholdning", "PlayStation 5 + 3 spill", "PS5 disk-versjon med 2 kontrollere og 3 spill (Spider-Man 2, God of War, FF7 Rebirth). Alt fungerer perfekt.", 450000, "FIXED", "GOOD"),
    ("hobby-og-underholdning", "Canon EOS R6 Mark II + 24-70mm f/2.8", "Profesjonelt kamerasystem. Shuttercount ca 12 000. Alltid oppbevart i kameraveske. Kvittering og garanti til 2027.", 3500000, "FIXED", "LIKE_NEW"),
    ("hobby-og-underholdning", "Fender Stratocaster American Pro II", "Sunburst finish, maple neck. Fantastisk gitar i perfekt stand. Hardcase medfølger.", 1800000, "FIXED", "LIKE_NEW"),
    ("boker-og-media", "Samling Jørn Lier Horst - komplett", "Alle William Wisting-bøkene i pocket. 15 bøker totalt, lest én gang. Perfekt for krimfans.", 40000, "FIXED", "GOOD"),
    ("boker-og-media", "Kindle Paperwhite 2024", "Siste modell med 6.8\" skjerm. Brukt i noen uker, foretrekker papirbøker likevel. Deksel medfølger.", 150000, "FIXED", "LIKE_NEW"),
    ("dyr-og-utstyr", "Hundebur sammenleggbar XL", "Stort hundebur i metall, 107x71x76cm. Passer store raser. Sammenleggbar for enkel oppbevaring.", 80000, "FIXED", "GOOD"),
    ("dyr-og-utstyr", "Kattetre stort 180cm", "Stabilt kattetre med mange plattformer, huler og klorestolper. Brukt i 6 måneder, god stand.", 60000, "FIXED", "GOOD"),
    ("tjenester", "Flyttehjelp i Oslo-området", "Erfaren flyttemann med varebil. Kan hjelpe med småflytting, møbeltransport og lignende. Fleksibel på tider.", 50000, "CONTACT", "NEW"),
    ("tjenester", "Maler leiligheten din", "Profesjonell maler med 10 års erfaring. Innvendig maling, tapetsering, sparkling. Gratis befaring og pristilbud.", 0, "CONTACT", "NEW"),
    ("eiendom", "2-roms leilighet Grünerløkka", "Lys og fin 2-roms på 52 kvm i populært område. Balkong mot bakgård, oppusset bad 2023. Fellesvaskeri.", 380000000, "FIXED", "GOOD"),
    ("eiendom", "Hytte i Hemsedal med ski-in/ski-out", "Koselig fjellhytte på 85 kvm med 3 soverom. Direkte adkomst til løypene. Parkering og bod.", 450000000, "FIXED", "GOOD"),
    ("jobb", "Senior utvikler React/TypeScript", "Vi søker en erfaren frontend-utvikler til vårt team i Oslo. Hybrid arbeid, konkurransedyktig lønn, gode betingelser.", 0, "CONTACT", "NEW"),
    ("jobb", "Barista deltid sentrum", "Populær kafé i Oslo sentrum søker barista for helg og ettermiddager. Erfaring er en fordel men ikke et krav. Hyggelig arbeidsmiljø.", 0, "CONTACT", "NEW"),
]

LOCATIONS = ["Oslo", "Bergen", "Trondheim", "Stavanger", "Tromsø", "Drammen", "Kristiansand", "Fredrikstad", "Bodø", "Ålesund", "Lillehammer", "Hamar", "Sandefjord", "Tønsberg"]


async def seed_test_data() -> None:
    """Seed test users and sample ads."""
    async with async_session_factory() as session:
        # Check if users already exist
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none() is not None:
            print("Test data already seeded, skipping.")
            return

        # Get category map
        result = await session.execute(select(Category))
        categories = result.scalars().all()
        cat_by_slug = {c.slug: c.id for c in categories}

        if not cat_by_slug:
            print("ERROR: No categories found. Run seed_categories first.")
            return

        # Create users
        password_hash = hash_password("password123")
        users = []
        for user_data in TEST_USERS:
            user = User(
                id=uuid.uuid4(),
                email=user_data["email"],
                name=user_data["name"],
                password_hash=password_hash,
                location=user_data["location"],
                rating=round(random.uniform(3.5, 5.0), 1),
                is_verified=random.choice([True, True, True, False]),
            )
            session.add(user)
            users.append(user)

        await session.flush()
        print(f"Seeded {len(users)} test users (password: password123)")

        # Create ads
        ad_count = 0
        for i, (cat_slug, title, desc, price, price_type, condition) in enumerate(SAMPLE_ADS):
            cat_id = cat_by_slug.get(cat_slug)
            if not cat_id:
                print(f"  Warning: category '{cat_slug}' not found, skipping ad: {title}")
                continue

            seller = users[i % len(users)]
            days_ago = random.randint(0, 30)

            now = datetime.now(timezone.utc)
            created = now - timedelta(days=days_ago, hours=random.randint(0, 23))

            ad = Ad(
                id=uuid.uuid4(),
                seller_id=seller.id,
                category_id=cat_id,
                title=title,
                description=desc,
                price=price,
                price_type=price_type,
                condition=condition,
                status="ACTIVE",
                location=random.choice(LOCATIONS),
                views_count=random.randint(5, 500),
                created_at=created,
                updated_at=created,
                expires_at=now + timedelta(days=30 - days_ago),
            )
            session.add(ad)
            ad_count += 1

        await session.commit()
        print(f"Seeded {ad_count} sample ads across {len(cat_by_slug)} categories.")


async def main() -> None:
    await seed_categories()
    if "--with-data" in sys.argv or len(sys.argv) == 1:
        await seed_test_data()


if __name__ == "__main__":
    asyncio.run(main())
