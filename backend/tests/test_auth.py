import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient) -> None:
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["name"] == "Test User"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient) -> None:
    payload = {
        "email": "duplicate@example.com",
        "name": "First User",
        "password": "securepassword123",
    }
    await async_client.post("/api/v1/auth/register", json=payload)

    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "duplicate@example.com",
            "name": "Second User",
            "password": "anotherpassword123",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient) -> None:
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "name": "Login User",
            "password": "securepassword123",
        },
    )

    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient) -> None:
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpw@example.com",
            "name": "Wrong PW User",
            "password": "securepassword123",
        },
    )

    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpw@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient) -> None:
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@example.com",
            "name": "Refresh User",
            "password": "securepassword123",
        },
    )
    refresh_token = reg_response.json()["refresh_token"]

    response = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    # New refresh token should be different (rotation)
    assert data["refresh_token"] != refresh_token


@pytest.mark.asyncio
async def test_get_me_authenticated(async_client: AsyncClient) -> None:
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "name": "Me User",
            "password": "securepassword123",
        },
    )
    access_token = reg_response.json()["access_token"]

    response = await async_client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["name"] == "Me User"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(async_client: AsyncClient) -> None:
    response = await async_client.get("/api/v1/users/me")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_register_weak_password(async_client: AsyncClient) -> None:
    """Designkrav: Minimum 8 tegn passord."""
    response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "name": "Weak User", "password": "short"},
    )
    assert response.status_code == 422  # Pydantic validation error


@pytest.mark.asyncio
async def test_login_nonexistent_user(async_client: AsyncClient) -> None:
    """Skal returnere 401 uten å lekke om brukeren finnes."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "somepassword123"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_refresh_with_revoked_token(async_client: AsyncClient) -> None:
    """Sikkerhetskritisk: Brukt refresh token skal avvises etter rotation."""
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "revoke@example.com",
            "name": "Revoke User",
            "password": "securepassword123",
        },
    )
    old_refresh = reg_response.json()["refresh_token"]

    # Use the token once (rotates it)
    await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )

    # Try to reuse the old (now revoked) token
    response = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": old_refresh},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_update_profile(async_client: AsyncClient) -> None:
    """Test PATCH /users/me profil-oppdatering."""
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "update@example.com",
            "name": "Update User",
            "password": "securepassword123",
        },
    )
    access_token = reg_response.json()["access_token"]

    response = await async_client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
        json={"name": "Updated Name", "phone": "12345678", "location": "Oslo"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["phone"] == "12345678"
    assert data["location"] == "Oslo"


@pytest.mark.asyncio
async def test_get_categories(async_client: AsyncClient) -> None:
    """Test GET /categories endepunkt."""
    response = await async_client.get("/api/v1/categories/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_email_normalization(async_client: AsyncClient) -> None:
    """Email skal normaliseres til lowercase."""
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "UPPER@Example.COM",
            "name": "Upper User",
            "password": "securepassword123",
        },
    )

    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "upper@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 200
