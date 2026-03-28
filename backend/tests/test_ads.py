import io
import uuid

import pytest
from httpx import AsyncClient
from PIL import Image

from app.middleware.rate_limit import reset_limiter


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _register_user(client: AsyncClient, email: str = "seller@example.com") -> dict:
    """Register a user and return the full token response."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Test Seller", "password": "securepassword123"},
    )
    assert resp.status_code == 201
    return resp.json()


async def _auth_header(client: AsyncClient, email: str = "seller@example.com") -> dict:
    """Register a user and return auth headers."""
    data = await _register_user(client, email)
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _create_category(client: AsyncClient, db_session=None) -> uuid.UUID:
    """Create a category directly via DB (using the async_client's override)."""
    # We'll create a category by importing the model directly
    from app.models.category import Category
    from tests.conftest import test_session_factory

    async with test_session_factory() as session:
        cat = Category(
            id=uuid.uuid4(),
            name="Elektronikk",
            slug="elektronikk",
            icon="laptop",
            position=0,
        )
        session.add(cat)
        await session.commit()
        return cat.id


async def _create_category_with_slug(slug: str, name: str = "Test Category") -> uuid.UUID:
    """Create a category with specific slug directly via DB."""
    from app.models.category import Category
    from tests.conftest import test_session_factory

    async with test_session_factory() as session:
        cat = Category(
            id=uuid.uuid4(),
            name=name,
            slug=slug,
            icon="tag",
            position=0,
        )
        session.add(cat)
        await session.commit()
        return cat.id


async def _create_ad(
    client: AsyncClient,
    headers: dict,
    category_id: uuid.UUID,
    title: str = "Test Annonse",
    price: int = 15000,
) -> dict:
    """Create an ad via API and return the response data."""
    resp = await client.post(
        "/api/v1/ads/",
        json={
            "title": title,
            "description": "This is a test ad with enough characters",
            "price": price,
            "price_type": "FIXED",
            "condition": "GOOD",
            "category_id": str(category_id),
            "location": "Oslo",
        },
        headers=headers,
    )
    assert resp.status_code == 201, f"Failed to create ad: {resp.text}"
    return resp.json()


def _make_test_jpeg() -> bytes:
    """Create a minimal valid JPEG image in memory."""
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()


def _make_test_text_file() -> bytes:
    """Create a text file to test invalid file type upload."""
    return b"This is not an image"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_ad_success(async_client: AsyncClient) -> None:
    """Scenario 1: Opprett annonse med gyldige data -> 201"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)

    data = await _create_ad(async_client, headers, category_id)

    assert data["title"] == "Test Annonse"
    assert data["price"] == 15000
    assert data["price_type"] == "FIXED"
    assert data["condition"] == "GOOD"
    assert data["status"] == "ACTIVE"
    assert data["location"] == "Oslo"
    assert data["seller"]["name"] == "Test Seller"
    assert data["category"]["slug"] == "elektronikk"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_ad_without_auth(async_client: AsyncClient) -> None:
    """Scenario 2: Opprett annonse uten auth -> 401"""
    category_id = await _create_category(async_client)

    resp = await async_client.post(
        "/api/v1/ads/",
        json={
            "title": "No Auth Ad",
            "description": "This should fail because no auth",
            "price": 100,
            "price_type": "FIXED",
            "condition": "GOOD",
            "category_id": str(category_id),
        },
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_ad_invalid_category(async_client: AsyncClient) -> None:
    """Scenario 3: Opprett annonse med ugyldig kategori -> 404"""
    headers = await _auth_header(async_client)

    resp = await async_client.post(
        "/api/v1/ads/",
        json={
            "title": "Bad Category Ad",
            "description": "This should fail because category does not exist",
            "price": 100,
            "price_type": "FIXED",
            "condition": "GOOD",
            "category_id": str(uuid.uuid4()),
        },
        headers=headers,
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_ad_short_title(async_client: AsyncClient) -> None:
    """Scenario 4: Opprett annonse med for kort tittel -> 422 validation error"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)

    resp = await async_client.post(
        "/api/v1/ads/",
        json={
            "title": "Ab",  # too short (min 3)
            "description": "Valid description with enough characters",
            "price": 100,
            "price_type": "FIXED",
            "condition": "GOOD",
            "category_id": str(category_id),
        },
        headers=headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_ad_by_id(async_client: AsyncClient) -> None:
    """Scenario 5: Hent annonse med ID -> 200, komplett data inkl bilder/seller"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    resp = await async_client.get(f"/api/v1/ads/{ad['id']}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == ad["id"]
    assert data["title"] == "Test Annonse"
    assert "seller" in data
    assert "category" in data
    assert "images" in data
    assert isinstance(data["images"], list)


@pytest.mark.asyncio
async def test_get_nonexistent_ad(async_client: AsyncClient) -> None:
    """Scenario 6: Hent ikke-eksisterende annonse -> 404"""
    resp = await async_client.get(f"/api/v1/ads/{uuid.uuid4()}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_ads_with_pagination(async_client: AsyncClient) -> None:
    """Scenario 7: Liste annonser med paginering -> 200, pagineringsinformasjon"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)

    # Create 3 ads
    for i in range(3):
        await _create_ad(async_client, headers, category_id, title=f"Annonse {i}", price=1000 * i)

    resp = await async_client.get("/api/v1/ads/", params={"page": 1, "per_page": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 3
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert data["pages"] == 2
    assert len(data["items"]) == 2


@pytest.mark.asyncio
async def test_filter_ads_by_category(async_client: AsyncClient) -> None:
    """Scenario 8: Filtrere annonser pa kategori -> 200, kun annonser i kategori"""
    cat1 = await _create_category_with_slug("elektronikk", "Elektronikk")
    cat2 = await _create_category_with_slug("mobler", "Mobler")

    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat1, title="Laptop Dell")
    await _create_ad(async_client, headers, cat2, title="Sofa Ikea")

    resp = await async_client.get("/api/v1/ads/", params={"category": "elektronikk"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Laptop Dell"


@pytest.mark.asyncio
async def test_filter_ads_by_price_range(async_client: AsyncClient) -> None:
    """Scenario 9: Filtrere annonser pa pris-range -> 200, kun innenfor range"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)

    await _create_ad(async_client, headers, category_id, title="Billig", price=500)
    await _create_ad(async_client, headers, category_id, title="Medium", price=5000)
    await _create_ad(async_client, headers, category_id, title="Dyr", price=50000)

    resp = await async_client.get(
        "/api/v1/ads/", params={"price_min": 1000, "price_max": 10000}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Medium"


@pytest.mark.asyncio
async def test_update_own_ad(async_client: AsyncClient) -> None:
    """Scenario 10: Oppdater egen annonse -> 200, oppdatert"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    resp = await async_client.patch(
        f"/api/v1/ads/{ad['id']}",
        json={"title": "Oppdatert Tittel", "price": 99999},
        headers=headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Oppdatert Tittel"
    assert data["price"] == 99999


@pytest.mark.asyncio
async def test_update_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 11: Oppdater andres annonse -> 403 Forbidden"""
    category_id = await _create_category(async_client)
    owner_headers = await _auth_header(async_client, "owner@example.com")
    ad = await _create_ad(async_client, owner_headers, category_id)

    other_headers = await _auth_header(async_client, "other@example.com")

    resp = await async_client.patch(
        f"/api/v1/ads/{ad['id']}",
        json={"title": "Hacked Title!!!"},
        headers=other_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_delete_own_ad(async_client: AsyncClient) -> None:
    """Scenario 12: Slett egen annonse -> 204"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    resp = await async_client.delete(f"/api/v1/ads/{ad['id']}", headers=headers)
    assert resp.status_code == 204

    # Verify it's gone
    resp = await async_client.get(f"/api/v1/ads/{ad['id']}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 13: Slett andres annonse -> 403 Forbidden"""
    category_id = await _create_category(async_client)
    owner_headers = await _auth_header(async_client, "owner2@example.com")
    ad = await _create_ad(async_client, owner_headers, category_id)

    other_headers = await _auth_header(async_client, "other2@example.com")

    resp = await async_client.delete(f"/api/v1/ads/{ad['id']}", headers=other_headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_upload_image_valid_jpeg(async_client: AsyncClient, tmp_path) -> None:
    """Scenario 14: Last opp bilde (gyldig JPEG) -> 201, URL returnert"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    jpeg_bytes = _make_test_jpeg()

    # Override UPLOAD_DIR to tmp_path for this test
    import app.config
    original_settings = app.config.get_settings()
    original_upload_dir = original_settings.UPLOAD_DIR
    original_settings.UPLOAD_DIR = str(tmp_path)

    try:
        resp = await async_client.post(
            f"/api/v1/ads/{ad['id']}/images",
            files={"file": ("test.jpg", jpeg_bytes, "image/jpeg")},
            headers=headers,
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert "url" in data
        assert "thumbnail_url" in data
        assert data["position"] == 0
    finally:
        original_settings.UPLOAD_DIR = original_upload_dir


@pytest.mark.asyncio
async def test_upload_image_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 15: Last opp bilde for andres annonse -> 403"""
    category_id = await _create_category(async_client)
    owner_headers = await _auth_header(async_client, "imgowner@example.com")
    ad = await _create_ad(async_client, owner_headers, category_id)

    other_headers = await _auth_header(async_client, "imgother@example.com")
    jpeg_bytes = _make_test_jpeg()

    resp = await async_client.post(
        f"/api/v1/ads/{ad['id']}/images",
        files={"file": ("test.jpg", jpeg_bytes, "image/jpeg")},
        headers=other_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_upload_invalid_file_type(async_client: AsyncClient) -> None:
    """Scenario 16: Last opp ugyldig filtype -> 422"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    text_bytes = _make_test_text_file()

    resp = await async_client.post(
        f"/api/v1/ads/{ad['id']}/images",
        files={"file": ("test.txt", text_bytes, "text/plain")},
        headers=headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_rate_limiting_blocks_after_limit(async_client: AsyncClient) -> None:
    """Scenario 17: Rate limiting blokkerer etter grense -> 429 Too Many Requests"""
    # Register endpoint has limit of 3 per minute
    # First 3 should work (or fail with 409 for duplicates, but not 429)
    for i in range(3):
        resp = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": f"ratelimit{i}@example.com",
                "name": "Rate Test",
                "password": "securepassword123",
            },
        )
        assert resp.status_code != 429, f"Request {i+1} should not be rate limited"

    # 4th request should be rate limited
    resp = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "ratelimit_blocked@example.com",
            "name": "Rate Test",
            "password": "securepassword123",
        },
    )
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers


@pytest.mark.asyncio
async def test_get_ads_by_category_slug(async_client: AsyncClient) -> None:
    """Scenario 18: Hent annonser i kategori via slug -> 200, riktige annonser"""
    cat_id = await _create_category_with_slug("biler", "Biler")
    headers = await _auth_header(async_client)
    await _create_ad(async_client, headers, cat_id, title="BMW 320i")

    resp = await async_client.get("/api/v1/categories/biler/ads")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "BMW 320i"


@pytest.mark.asyncio
async def test_views_count_increments(async_client: AsyncClient) -> None:
    """Scenario 19: Views count oker ved henting -> views_count + 1"""
    category_id = await _create_category(async_client)
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    # First fetch
    resp1 = await async_client.get(f"/api/v1/ads/{ad['id']}")
    assert resp1.status_code == 200
    views1 = resp1.json()["views_count"]

    # Second fetch
    resp2 = await async_client.get(f"/api/v1/ads/{ad['id']}")
    assert resp2.status_code == 200
    views2 = resp2.json()["views_count"]

    assert views2 == views1 + 1


@pytest.mark.asyncio
async def test_similar_ads_returns_same_category(async_client: AsyncClient) -> None:
    """Scenario 20: Lignende annonser returnerer annonser fra samme kategori."""
    cat_electronics = await _create_category_with_slug("elektronikk-sim", "Elektronikk")
    cat_furniture = await _create_category_with_slug("mobler-sim", "Mobler")
    headers = await _auth_header(async_client)

    # Create ads in electronics category
    ad1 = await _create_ad(async_client, headers, cat_electronics, title="iPhone 15")
    await _create_ad(async_client, headers, cat_electronics, title="Samsung Galaxy")
    await _create_ad(async_client, headers, cat_electronics, title="Google Pixel")

    # Create ad in furniture category (should NOT appear)
    await _create_ad(async_client, headers, cat_furniture, title="Sofa")

    resp = await async_client.get(f"/api/v1/ads/{ad1['id']}/similar")
    assert resp.status_code == 200
    data = resp.json()

    # Should return max 6 ads, all from electronics category
    assert len(data) <= 6
    assert len(data) == 2  # Samsung Galaxy + Google Pixel (not iPhone 15 itself, not Sofa)
    for ad in data:
        assert ad["category"]["slug"] == "elektronikk-sim"


@pytest.mark.asyncio
async def test_similar_ads_excludes_current(async_client: AsyncClient) -> None:
    """Scenario 21: Lignende annonser ekskluderer gjeldende annonse."""
    cat_id = await _create_category_with_slug("biler-sim", "Biler")
    headers = await _auth_header(async_client)

    target_ad = await _create_ad(async_client, headers, cat_id, title="BMW 320i")
    await _create_ad(async_client, headers, cat_id, title="Audi A4")
    await _create_ad(async_client, headers, cat_id, title="Mercedes C200")

    resp = await async_client.get(f"/api/v1/ads/{target_ad['id']}/similar")
    assert resp.status_code == 200
    data = resp.json()

    returned_ids = [ad["id"] for ad in data]
    assert target_ad["id"] not in returned_ids
    assert len(data) == 2  # Audi A4 + Mercedes C200
