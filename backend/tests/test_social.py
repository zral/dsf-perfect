import uuid

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _register_user(client: AsyncClient, email: str = "social@example.com") -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": "Social User", "password": "securepassword123"},
    )
    assert resp.status_code == 201
    return resp.json()


async def _auth_header(client: AsyncClient, email: str = "social@example.com") -> dict:
    data = await _register_user(client, email)
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _user_id_from_token(client: AsyncClient, headers: dict) -> str:
    resp = await client.get("/api/v1/users/me", headers=headers)
    assert resp.status_code == 200
    return resp.json()["id"]


async def _create_category(slug: str = "elektronikk") -> uuid.UUID:
    from app.models.category import Category
    from tests.conftest import test_session_factory

    async with test_session_factory() as session:
        cat = Category(
            id=uuid.uuid4(),
            name="Elektronikk",
            slug=slug,
            icon="laptop",
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


# ---------------------------------------------------------------------------
# Favorite Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_add_favorite(async_client: AsyncClient) -> None:
    """Scenario 1: Favorittmerk annonse -> 201"""
    category_id = await _create_category()
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    resp = await async_client.post(f"/api/v1/ads/{ad['id']}/favorite", headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["ad_id"] == ad["id"]
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_remove_favorite(async_client: AsyncClient) -> None:
    """Scenario 2: Fjern favoritt -> 204"""
    category_id = await _create_category()
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    # Add then remove
    await async_client.post(f"/api/v1/ads/{ad['id']}/favorite", headers=headers)
    resp = await async_client.delete(f"/api/v1/ads/{ad['id']}/favorite", headers=headers)
    assert resp.status_code == 204

    # Verify it's gone from favorites list
    resp = await async_client.get("/api/v1/favorites/", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 0


@pytest.mark.asyncio
async def test_double_favorite_idempotent(async_client: AsyncClient) -> None:
    """Scenario 3: Dobbelt-favoritt (idempotent) -> ingen feil"""
    category_id = await _create_category()
    headers = await _auth_header(async_client)
    ad = await _create_ad(async_client, headers, category_id)

    resp1 = await async_client.post(f"/api/v1/ads/{ad['id']}/favorite", headers=headers)
    assert resp1.status_code == 201

    resp2 = await async_client.post(f"/api/v1/ads/{ad['id']}/favorite", headers=headers)
    assert resp2.status_code == 201
    # Should return the same favorite
    assert resp1.json()["id"] == resp2.json()["id"]


@pytest.mark.asyncio
async def test_favorite_without_auth(async_client: AsyncClient) -> None:
    """Scenario 4: Favoritter uten auth -> 401"""
    resp = await async_client.post(f"/api/v1/ads/{uuid.uuid4()}/favorite")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_list_my_favorites(async_client: AsyncClient) -> None:
    """Scenario 5: Liste mine favoritter -> 200, kun mine"""
    category_id = await _create_category()
    headers_a = await _auth_header(async_client, "usera@example.com")
    headers_b = await _auth_header(async_client, "userb@example.com")

    ad1 = await _create_ad(async_client, headers_a, category_id, title="Ad One for Fav")
    ad2 = await _create_ad(async_client, headers_a, category_id, title="Ad Two for Fav")

    # User A favorites both
    await async_client.post(f"/api/v1/ads/{ad1['id']}/favorite", headers=headers_a)
    await async_client.post(f"/api/v1/ads/{ad2['id']}/favorite", headers=headers_a)

    # User B favorites only ad1
    await async_client.post(f"/api/v1/ads/{ad1['id']}/favorite", headers=headers_b)

    # User A should see 2 favorites
    resp_a = await async_client.get("/api/v1/favorites/", headers=headers_a)
    assert resp_a.status_code == 200
    assert len(resp_a.json()) == 2

    # User B should see 1 favorite
    resp_b = await async_client.get("/api/v1/favorites/", headers=headers_b)
    assert resp_b.status_code == 200
    assert len(resp_b.json()) == 1
    assert resp_b.json()[0]["id"] == ad1["id"]


# ---------------------------------------------------------------------------
# Saved Search Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_saved_search(async_client: AsyncClient) -> None:
    """Scenario 6: Opprett lagret sok -> 201"""
    headers = await _auth_header(async_client)

    resp = await async_client.post(
        "/api/v1/saved-searches/",
        json={
            "query": "iPhone",
            "category_slug": "elektronikk",
            "filters": {"price_min": 1000, "price_max": 5000},
            "notify": True,
        },
        headers=headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["query"] == "iPhone"
    assert data["category_slug"] == "elektronikk"
    assert data["filters"]["price_min"] == 1000
    assert data["notify"] is True
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_list_saved_searches(async_client: AsyncClient) -> None:
    """Scenario 7: Liste lagrede sok -> 200, kun mine"""
    headers_a = await _auth_header(async_client, "ssa@example.com")
    headers_b = await _auth_header(async_client, "ssb@example.com")

    await async_client.post(
        "/api/v1/saved-searches/",
        json={"query": "BMW"},
        headers=headers_a,
    )
    await async_client.post(
        "/api/v1/saved-searches/",
        json={"query": "Audi"},
        headers=headers_b,
    )

    resp = await async_client.get("/api/v1/saved-searches/", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["query"] == "BMW"


@pytest.mark.asyncio
async def test_delete_saved_search(async_client: AsyncClient) -> None:
    """Scenario 8: Slett lagret sok -> 204"""
    headers = await _auth_header(async_client)

    create_resp = await async_client.post(
        "/api/v1/saved-searches/",
        json={"query": "Delete Me"},
        headers=headers,
    )
    assert create_resp.status_code == 201
    search_id = create_resp.json()["id"]

    resp = await async_client.delete(f"/api/v1/saved-searches/{search_id}", headers=headers)
    assert resp.status_code == 204

    # Verify it's gone
    list_resp = await async_client.get("/api/v1/saved-searches/", headers=headers)
    assert len(list_resp.json()) == 0


@pytest.mark.asyncio
async def test_delete_other_users_saved_search(async_client: AsyncClient) -> None:
    """Scenario 9: Slett andres lagrede sok -> 403"""
    headers_owner = await _auth_header(async_client, "ssowner@example.com")
    headers_other = await _auth_header(async_client, "ssother@example.com")

    create_resp = await async_client.post(
        "/api/v1/saved-searches/",
        json={"query": "Not Yours"},
        headers=headers_owner,
    )
    assert create_resp.status_code == 201
    search_id = create_resp.json()["id"]

    resp = await async_client.delete(
        f"/api/v1/saved-searches/{search_id}", headers=headers_other
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Public Profile Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_public_user_profile(async_client: AsyncClient) -> None:
    """Scenario 10: Hent offentlig brukerprofil -> 200, ingen sensitiv data"""
    headers = await _auth_header(async_client)
    user_id = await _user_id_from_token(async_client, headers)

    resp = await async_client.get(f"/api/v1/users/{user_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Social User"
    assert data["id"] == user_id
    assert "rating" in data
    assert "created_at" in data
    # Must NOT expose sensitive fields
    assert "email" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_get_user_ads(async_client: AsyncClient) -> None:
    """Scenario 11: Hent brukers annonser -> 200, kun aktive"""
    category_id = await _create_category("user-ads-cat")
    headers = await _auth_header(async_client, "userads@example.com")
    user_id = await _user_id_from_token(async_client, headers)

    # Create an active ad
    await _create_ad(async_client, headers, category_id, title="Active Ad")
    # Create another ad and then delete it (simulates non-active)
    ad2 = await _create_ad(async_client, headers, category_id, title="Will Delete")
    await async_client.delete(f"/api/v1/ads/{ad2['id']}", headers=headers)

    resp = await async_client.get(f"/api/v1/users/{user_id}/ads")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Active Ad"
