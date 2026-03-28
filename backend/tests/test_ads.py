import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_ad_success(async_client: AsyncClient) -> None:
    """Scenario 1: Opprett annonse med gyldige data -> 201"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_create_ad_without_auth(async_client: AsyncClient) -> None:
    """Scenario 2: Opprett annonse uten auth -> 401"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_create_ad_invalid_category(async_client: AsyncClient) -> None:
    """Scenario 3: Opprett annonse med ugyldig kategori -> 404/422"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_create_ad_short_title(async_client: AsyncClient) -> None:
    """Scenario 4: Opprett annonse med for kort tittel -> 422 validation error"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_get_ad_by_id(async_client: AsyncClient) -> None:
    """Scenario 5: Hent annonse med ID -> 200, komplett data inkl bilder/seller"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_get_nonexistent_ad(async_client: AsyncClient) -> None:
    """Scenario 6: Hent ikke-eksisterende annonse -> 404"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_list_ads_with_pagination(async_client: AsyncClient) -> None:
    """Scenario 7: Liste annonser med paginering -> 200, pagineringsinformasjon"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_filter_ads_by_category(async_client: AsyncClient) -> None:
    """Scenario 8: Filtrere annonser pa kategori -> 200, kun annonser i kategori"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_filter_ads_by_price_range(async_client: AsyncClient) -> None:
    """Scenario 9: Filtrere annonser pa pris-range -> 200, kun innenfor range"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_update_own_ad(async_client: AsyncClient) -> None:
    """Scenario 10: Oppdater egen annonse -> 200, oppdatert"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_update_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 11: Oppdater andres annonse -> 403 Forbidden"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_delete_own_ad(async_client: AsyncClient) -> None:
    """Scenario 12: Slett egen annonse -> 204"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_delete_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 13: Slett andres annonse -> 403 Forbidden"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_upload_image_valid_jpeg(async_client: AsyncClient) -> None:
    """Scenario 14: Last opp bilde (gyldig JPEG) -> 201, URL returnert"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_upload_image_other_users_ad(async_client: AsyncClient) -> None:
    """Scenario 15: Last opp bilde for andres annonse -> 403"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_upload_invalid_file_type(async_client: AsyncClient) -> None:
    """Scenario 16: Last opp ugyldig filtype -> 422"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_rate_limiting_blocks_after_limit(async_client: AsyncClient) -> None:
    """Scenario 17: Rate limiting blokkerer etter grense -> 429 Too Many Requests"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_get_ads_by_category_slug(async_client: AsyncClient) -> None:
    """Scenario 18: Hent annonser i kategori via slug -> 200, riktige annonser"""
    pytest.skip("Not implemented yet — stub fra testplan")


@pytest.mark.asyncio
async def test_views_count_increments(async_client: AsyncClient) -> None:
    """Scenario 19: Views count oker ved henting -> views_count + 1"""
    pytest.skip("Not implemented yet — stub fra testplan")
