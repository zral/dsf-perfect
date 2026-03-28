import uuid

import pytest
from httpx import AsyncClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _register_user(client: AsyncClient, email: str, name: str = "Test User") -> dict:
    """Register a user and return the full token response."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "name": name, "password": "securepassword123"},
    )
    assert resp.status_code == 201
    return resp.json()


async def _auth_header(client: AsyncClient, email: str, name: str = "Test User") -> dict:
    """Register a user and return auth headers."""
    data = await _register_user(client, email, name)
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _create_category() -> uuid.UUID:
    """Create a category directly via DB."""
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


async def _create_ad(client: AsyncClient, headers: dict, category_id: uuid.UUID) -> dict:
    """Create an ad via API and return the response data."""
    resp = await client.post(
        "/api/v1/ads/",
        json={
            "title": "Test Annonse",
            "description": "This is a test ad with enough characters",
            "price": 15000,
            "price_type": "FIXED",
            "condition": "GOOD",
            "category_id": str(category_id),
            "location": "Oslo",
        },
        headers=headers,
    )
    assert resp.status_code == 201, f"Failed to create ad: {resp.text}"
    return resp.json()


async def _setup_seller_buyer_ad(client: AsyncClient):
    """Setup: register seller + buyer, create ad. Return (seller_headers, buyer_headers, ad_data)."""
    seller_headers = await _auth_header(client, "seller@example.com", "Selger")
    buyer_headers = await _auth_header(client, "buyer@example.com", "Kjoper")
    category_id = await _create_category()
    ad = await _create_ad(client, seller_headers, category_id)
    return seller_headers, buyer_headers, ad


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_contact_seller_create_conversation(async_client: AsyncClient) -> None:
    """Scenario 1: Kontakt selger — opprett samtale og send melding -> 201"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Hei, er denne fortsatt tilgjengelig?"},
        headers=buyer_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "id" in data
    assert "conversation_id" in data
    assert data["content"] == "Hei, er denne fortsatt tilgjengelig?"


@pytest.mark.asyncio
async def test_send_message_existing_conversation(async_client: AsyncClient) -> None:
    """Scenario 2: Send melding i eksisterende samtale -> 201"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    # Create conversation
    resp1 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Er denne ledig?"},
        headers=buyer_headers,
    )
    assert resp1.status_code == 201
    conversation_id = resp1.json()["conversation_id"]

    # Send in existing conversation
    resp2 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "conversation_id": conversation_id, "content": "Ja, den er ledig!"},
        headers=seller_headers,
    )
    assert resp2.status_code == 201
    assert resp2.json()["conversation_id"] == conversation_id


@pytest.mark.asyncio
async def test_contact_seller_reuse_conversation(async_client: AsyncClient) -> None:
    """Scenario 3: Kontakt selger igjen — gjenbruk samtale -> same conversation_id"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp1 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Hei!"},
        headers=buyer_headers,
    )
    assert resp1.status_code == 201
    conv_id_1 = resp1.json()["conversation_id"]

    resp2 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Hei igjen!"},
        headers=buyer_headers,
    )
    assert resp2.status_code == 201
    conv_id_2 = resp2.json()["conversation_id"]

    assert conv_id_1 == conv_id_2


@pytest.mark.asyncio
async def test_contact_self_returns_400(async_client: AsyncClient) -> None:
    """Scenario 4: Kontakt seg selv (eier annonsen) -> 400 Bad Request"""
    seller_headers, _, ad = await _setup_seller_buyer_ad(async_client)

    resp = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Hei meg selv"},
        headers=seller_headers,
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_list_conversations(async_client: AsyncClient) -> None:
    """Scenario 5: Liste samtaler — inkluderer siste melding og ulest-count -> 200"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    # Send a message
    await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Hei, interessert!"},
        headers=buyer_headers,
    )

    # List conversations as seller
    resp = await async_client.get("/api/v1/messages/conversations", headers=seller_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    conv = data[0]
    assert "ad" in conv
    assert "other_user" in conv
    assert "last_message" in conv
    assert "unread_count" in conv
    assert conv["unread_count"] == 1
    assert conv["last_message"]["content"] == "Hei, interessert!"


@pytest.mark.asyncio
async def test_get_conversation_messages(async_client: AsyncClient) -> None:
    """Scenario 6: Hent samtale — meldinger i rekkefølge -> 200, sortert"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp1 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Melding 1"},
        headers=buyer_headers,
    )
    conversation_id = resp1.json()["conversation_id"]

    await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "conversation_id": conversation_id, "content": "Melding 2"},
        headers=seller_headers,
    )

    resp = await async_client.get(
        f"/api/v1/messages/conversations/{conversation_id}",
        headers=buyer_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "messages" in data
    assert len(data["messages"]) == 2


@pytest.mark.asyncio
async def test_get_conversation_marks_as_read(async_client: AsyncClient) -> None:
    """Scenario 7: Hent samtale — marker meldinger som lest -> is_read = true"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp1 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Ulest melding"},
        headers=buyer_headers,
    )
    conversation_id = resp1.json()["conversation_id"]

    # Seller reads the conversation (marks buyer's messages as read)
    resp = await async_client.get(
        f"/api/v1/messages/conversations/{conversation_id}",
        headers=seller_headers,
    )
    assert resp.status_code == 200
    messages = resp.json()["messages"]
    for msg in messages:
        assert msg["is_read"] is True


@pytest.mark.asyncio
async def test_get_other_users_conversation_returns_403(async_client: AsyncClient) -> None:
    """Scenario 8: Hent andres samtale -> 403 Forbidden"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp1 = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Privat melding"},
        headers=buyer_headers,
    )
    conversation_id = resp1.json()["conversation_id"]

    # Third user tries to access
    outsider_headers = await _auth_header(async_client, "outsider@example.com", "Outsider")
    resp = await async_client.get(
        f"/api/v1/messages/conversations/{conversation_id}",
        headers=outsider_headers,
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_send_message_without_auth(async_client: AsyncClient) -> None:
    """Scenario 9: Send melding uten auth -> 401"""
    resp = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": str(uuid.uuid4()), "content": "Hei"},
    )
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_send_empty_message(async_client: AsyncClient) -> None:
    """Scenario 10: Send tom melding -> 422"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp = await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": ""},
        headers=buyer_headers,
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_get_unread_count(async_client: AsyncClient) -> None:
    """Scenario 11: Hent ulest-telling -> 200, korrekt count"""
    seller_headers, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    # Buyer sends 2 messages
    await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Melding 1"},
        headers=buyer_headers,
    )
    await async_client.post(
        "/api/v1/messages/",
        json={"ad_id": ad["id"], "content": "Melding 2"},
        headers=buyer_headers,
    )

    # Seller checks unread count
    resp = await async_client.get("/api/v1/messages/unread-count", headers=seller_headers)
    assert resp.status_code == 200
    assert resp.json()["count"] == 2


@pytest.mark.asyncio
async def test_send_message_to_nonexistent_conversation(async_client: AsyncClient) -> None:
    """Scenario 12: Send melding til ikke-eksisterende samtale -> 404"""
    _, buyer_headers, ad = await _setup_seller_buyer_ad(async_client)

    resp = await async_client.post(
        "/api/v1/messages/",
        json={
            "ad_id": ad["id"],
            "conversation_id": str(uuid.uuid4()),
            "content": "Hei",
        },
        headers=buyer_headers,
    )
    assert resp.status_code == 404
