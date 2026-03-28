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
