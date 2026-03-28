"""Phase 3: Search and discovery tests."""

import uuid

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _register_user(client: AsyncClient, email: str = "searcher@example.com") -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Search User", "password": "securepassword123"},
    )
    assert resp.status_code == 201
    return resp.json()


async def _auth_header(client: AsyncClient, email: str = "searcher@example.com") -> dict:
    data = await _register_user(client, email)
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _create_category(slug: str, name: str) -> uuid.UUID:
    from app.models.category import Category
    from tests.conftest import test_session_factory

    async with test_session_factory() as session:
        cat = Category(id=uuid.uuid4(), name=name, slug=slug, icon="tag", position=0)
        session.add(cat)
        await session.commit()
        return cat.id


async def _create_ad(
    client: AsyncClient,
    headers: dict,
    category_id: uuid.UUID,
    title: str = "Test Ad",
    description: str = "This is a test ad with enough characters",
    price: int = 1000,
    condition: str = "GOOD",
    location: str = "Oslo",
) -> dict:
    resp = await client.post(
        "/api/v1/ads/",
        json={
            "title": title,
            "description": description,
            "price": price,
            "price_type": "FIXED",
            "condition": condition,
            "category_id": str(category_id),
            "location": location,
        },
        headers=headers,
    )
    assert resp.status_code == 201, f"Failed to create ad: {resp.text}"
    return resp.json()


async def _set_ad_status(ad_id: str, new_status: str) -> None:
    """Set ad status directly in DB."""
    from sqlalchemy import update

    from app.models.ad import Ad
    from tests.conftest import test_session_factory

    async with test_session_factory() as session:
        await session.execute(
            update(Ad).where(Ad.id == uuid.UUID(ad_id)).values(status=new_status)
        )
        await session.commit()


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_search_by_title(async_client: AsyncClient) -> None:
    """Scenario 1: Search with match in title -> 200, relevant ads."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="iPhone 15 Pro Max")
    await _create_ad(async_client, headers, cat_id, title="Samsung Galaxy S24")

    resp = await async_client.get("/api/v1/search/", params={"q": "iPhone"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "iPhone 15 Pro Max"
    assert data["query"] == "iPhone"


@pytest.mark.asyncio
async def test_search_by_description(async_client: AsyncClient) -> None:
    """Scenario 2: Search with match in description -> 200, relevant ads."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(
        async_client, headers, cat_id,
        title="Mobiltelefon til salgs",
        description="Selger min iPhone 15 i perfekt stand",
    )
    await _create_ad(
        async_client, headers, cat_id,
        title="Nettbrett til salgs",
        description="Samsung Galaxy Tab i god stand",
    )

    resp = await async_client.get("/api/v1/search/", params={"q": "iPhone"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Mobiltelefon til salgs"


@pytest.mark.asyncio
async def test_search_no_results(async_client: AsyncClient) -> None:
    """Scenario 3: Search with no results -> 200, empty list."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Samsung Galaxy S24")

    resp = await async_client.get("/api/v1/search/", params={"q": "xyznonexistent"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_search_filter_category(async_client: AsyncClient) -> None:
    """Scenario 4: Search with category filter -> 200, only ads in category."""
    cat_elec = await _create_category("elektronikk", "Elektronikk")
    cat_mobler = await _create_category("mobler", "Mobler")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_elec, title="Laptop Dell XPS")
    await _create_ad(async_client, headers, cat_mobler, title="Sofa fra IKEA")

    resp = await async_client.get("/api/v1/search/", params={"category": "elektronikk"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Laptop Dell XPS"


@pytest.mark.asyncio
async def test_search_filter_price_range(async_client: AsyncClient) -> None:
    """Scenario 5: Search with price range -> 200, only within range."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Billig ting", price=100)
    await _create_ad(async_client, headers, cat_id, title="Medium ting", price=5000)
    await _create_ad(async_client, headers, cat_id, title="Dyr ting", price=50000)

    resp = await async_client.get(
        "/api/v1/search/", params={"price_min": 1000, "price_max": 10000}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Medium ting"


@pytest.mark.asyncio
async def test_search_filter_condition(async_client: AsyncClient) -> None:
    """Scenario 6: Search with condition filter -> 200, only matching condition."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Ny telefon", condition="NEW")
    await _create_ad(async_client, headers, cat_id, title="Brukt telefon", condition="GOOD")

    resp = await async_client.get("/api/v1/search/", params={"condition": "NEW"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Ny telefon"


@pytest.mark.asyncio
async def test_search_filter_location(async_client: AsyncClient) -> None:
    """Scenario 7: Search with location filter -> 200, only matching location."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Oslo-ting", location="Oslo")
    await _create_ad(async_client, headers, cat_id, title="Bergen-ting", location="Bergen")

    resp = await async_client.get("/api/v1/search/", params={"location": "Bergen"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Bergen-ting"


@pytest.mark.asyncio
async def test_search_combined_filters(async_client: AsyncClient) -> None:
    """Scenario 8: Search with combined filters -> 200, all filters applied."""
    cat_elec = await _create_category("elektronikk", "Elektronikk")
    cat_mobler = await _create_category("mobler", "Mobler")
    headers = await _auth_header(async_client)

    # This ad matches all filters
    await _create_ad(
        async_client, headers, cat_elec,
        title="iPhone 15", price=8000, condition="NEW", location="Oslo",
    )
    # Wrong category
    await _create_ad(
        async_client, headers, cat_mobler,
        title="iPhone case stand", price=8000, condition="NEW", location="Oslo",
        description="iPhone-shaped furniture piece for sale",
    )
    # Wrong price
    await _create_ad(
        async_client, headers, cat_elec,
        title="iPhone 14", price=100, condition="NEW", location="Oslo",
    )
    # Wrong condition
    await _create_ad(
        async_client, headers, cat_elec,
        title="iPhone 13", price=8000, condition="FAIR", location="Oslo",
    )

    resp = await async_client.get("/api/v1/search/", params={
        "q": "iPhone",
        "category": "elektronikk",
        "price_min": 5000,
        "condition": "NEW",
        "location": "Oslo",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "iPhone 15"


@pytest.mark.asyncio
async def test_search_sort_price_asc(async_client: AsyncClient) -> None:
    """Scenario 9: Search with sort price_asc -> 200, sorted ascending."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Dyr", price=50000)
    await _create_ad(async_client, headers, cat_id, title="Billig", price=500)
    await _create_ad(async_client, headers, cat_id, title="Medium", price=5000)

    resp = await async_client.get("/api/v1/search/", params={"sort": "price_asc"})
    assert resp.status_code == 200
    data = resp.json()
    prices = [item["price"] for item in data["items"]]
    assert prices == [500, 5000, 50000]


@pytest.mark.asyncio
async def test_search_pagination(async_client: AsyncClient) -> None:
    """Scenario 10: Search with pagination -> 200, correct page/total."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    for i in range(5):
        await _create_ad(async_client, headers, cat_id, title=f"Ad nummer {i}", price=1000 * i)

    resp = await async_client.get("/api/v1/search/", params={"page": 1, "per_page": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 5
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert data["pages"] == 3
    assert len(data["items"]) == 2

    # Page 3 should have 1 item
    resp2 = await async_client.get("/api/v1/search/", params={"page": 3, "per_page": 2})
    data2 = resp2.json()
    assert len(data2["items"]) == 1


@pytest.mark.asyncio
async def test_suggest_prefix_match(async_client: AsyncClient) -> None:
    """Scenario 11: Suggest with prefix match -> 200, relevant suggestions."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="iPhone 15 Pro")
    await _create_ad(async_client, headers, cat_id, title="iPhone 14")
    await _create_ad(async_client, headers, cat_id, title="Samsung Galaxy")

    resp = await async_client.get("/api/v1/search/suggest", params={"q": "iP"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["suggestions"]) >= 1
    texts = [s["text"] for s in data["suggestions"]]
    assert all("iPhone" in t or "iP" in t.lower() for t in texts)
    # Each suggestion has the required fields
    for s in data["suggestions"]:
        assert "text" in s
        assert "category" in s
        assert "count" in s


@pytest.mark.asyncio
async def test_suggest_short_query(async_client: AsyncClient) -> None:
    """Scenario 12: Suggest with too short query (<2 chars) -> 200, empty list."""
    resp = await async_client.get("/api/v1/search/suggest", params={"q": "a"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["suggestions"] == []


@pytest.mark.asyncio
async def test_suggest_with_limit(async_client: AsyncClient) -> None:
    """Scenario 13: Suggest with limit parameter -> 200, max N suggestions."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    for i in range(5):
        await _create_ad(async_client, headers, cat_id, title=f"Telefon modell {i}")

    resp = await async_client.get("/api/v1/search/suggest", params={"q": "Telefon", "limit": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["suggestions"]) <= 2


@pytest.mark.asyncio
async def test_search_empty_query_returns_all_active(async_client: AsyncClient) -> None:
    """Scenario 14: Empty search query returns all active ads -> 200, paginated list."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="Ad One")
    await _create_ad(async_client, headers, cat_id, title="Ad Two")
    await _create_ad(async_client, headers, cat_id, title="Ad Three")

    resp = await async_client.get("/api/v1/search/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert len(data["items"]) == 3
    assert "query" in data


@pytest.mark.asyncio
async def test_search_excludes_non_active_ads(async_client: AsyncClient) -> None:
    """Scenario 15: Search does not show DRAFT/SOLD/EXPIRED -> 200, only ACTIVE."""
    cat_id = await _create_category("elektronikk", "Elektronikk")
    headers = await _auth_header(async_client)

    ad_active = await _create_ad(async_client, headers, cat_id, title="Active Ad")
    ad_sold = await _create_ad(async_client, headers, cat_id, title="Sold Ad")
    ad_draft = await _create_ad(async_client, headers, cat_id, title="Draft Ad")

    # Set statuses directly in DB
    await _set_ad_status(ad_sold["id"], "SOLD")
    await _set_ad_status(ad_draft["id"], "DRAFT")

    resp = await async_client.get("/api/v1/search/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Active Ad"
