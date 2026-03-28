# Code Review: FINN Fase 7 — Sosial
Dato: 2026-03-28
Reviewer: DSF Automated Review

## Sammendrag

Fase 7 leverer favoritter (toggle, liste), lagrede sok (CRUD), FavoriteButton med hjerte-animasjon, ShareButton med Web Share API, profilside, og offentlig brukerside. Backend har 2 nye modeller, 2 services, 4 router-filer (favorites, saved_searches, users, ads utvidet). Frontend har 6 nye sider/komponenter og 3 hooks. 11 nye backend-tester dekker alle scenarier fra testplanen.

## Integrasjonssjekk (PE1 + PE4 + PE5)

| Frontend-kall | Backend-endepunkt | Metode | Datatyper | Respons-struktur |
|---|---|---|---|---|
| `api.get<Ad[]>("/api/v1/favorites")` | GET /api/v1/favorites/ | GET | OK | OK — returnerer Ad[] |
| `api.post("/api/v1/ads/${adId}/favorite")` | POST /api/v1/ads/{ad_id}/favorite | POST | string->UUID OK | 201 FavoriteResponse |
| `api.delete("/api/v1/ads/${adId}/favorite")` | DELETE /api/v1/ads/{ad_id}/favorite | DELETE | string->UUID OK | 204 |
| `api.get<SavedSearch[]>("/api/v1/saved-searches")` | GET /api/v1/saved-searches/ | GET | OK | OK — returnerer SavedSearch[] |
| `api.post<SavedSearch>("/api/v1/saved-searches", request)` | POST /api/v1/saved-searches/ | POST | SavedSearchCreateRequest matches SavedSearchCreate | 201 SavedSearchResponse |
| `api.delete("/api/v1/saved-searches/${id}")` | DELETE /api/v1/saved-searches/{search_id} | DELETE | string->UUID OK | 204 |
| `api.get<PublicUser>("/api/v1/users/${userId}")` | GET /api/v1/users/{user_id} | GET | string->UUID OK | OK — UserPublicResponse matches PublicUser |
| `api.get<AdListResponse>("/api/v1/users/${userId}/ads")` | GET /api/v1/users/{user_id}/ads | GET | string->UUID OK | OK — AdListResponse matches |

Alle 8 integrasjoner verifisert. Endepunkter, HTTP-metoder, datatyper og respons-strukturer matcher.

## Auth-guards sjekk (LEARNING 013)

| Hook | Krever auth? | `enabled: !!token` guard? | Status |
|---|---|---|---|
| useFavorites | Ja (backend: get_current_user) | MANGLER | FIKSET |
| useSavedSearches | Ja (backend: get_current_user) | MANGLER | FIKSET |
| useToggleFavorite | Ja (mutation — OK uten guard) | N/A | OK |
| useCreateSavedSearch | Ja (mutation — OK uten guard) | N/A | OK |
| useDeleteSavedSearch | Ja (mutation — OK uten guard) | N/A | OK |
| usePublicUser | Nei (offentlig endepunkt) | `enabled: !!userId` | OK |
| useUserAds | Nei (offentlig endepunkt) | `enabled: !!userId` | OK |

Begge query-hooks som krever auth manglet `enabled: !!token`. Fikset ved aa legge til `getAccessToken()` + `enabled: !!token`.

## Respons-struktur sjekk (LEARNING 012)

| Frontend-type | Backend-respons | Status |
|---|---|---|
| `Favorite` (types/favorite.ts) | Ubrukt — hook bruker Ad[] direkte | FIKSET (type oppdatert) |
| `FavoriteListResponse` (types/favorite.ts) | Backend returnerer Ad[], ikke wrappet | FIKSET (fjernet) |
| `SavedSearch` (types/saved-search.ts) | Matcher SavedSearchResponse | OK |
| `SavedSearchListResponse` (types/saved-search.ts) | Backend returnerer SavedSearch[], ikke wrappet | FIKSET (fjernet) |
| `PublicUser` (hooks/useUser.ts) | Matcher UserPublicResponse | OK |

Frontend type-definisjoner hadde wrapper-typer (FavoriteListResponse, SavedSearchListResponse) som ikke matchet backend (flat arrays). Hooks var korrekt typet, men type-filene var misvisende. Oppdatert til aa matche faktisk API.

## Funn

### Kritisk
Ingen (etter fiks av auth-guards og type-mismatch).

### Viktig
Ingen.

### Forslag

**F1: StarRating duplisert mellom ProfilePage og UserPageClient.**
Identisk StarRating-komponent finnes i baade `/app/profile/page.tsx` og `/app/user/[id]/UserPageClient.tsx`. Boer flyttes til felles komponent.

**F2: useIsFavorited kaller useFavorites paa nytt per komponent.**
Hvert FavoriteButton-kall trigger useIsFavorited som kaller useFavorites. React Query cacher dette, men det er en unodvendig kobling. Kunne brukt queryClient.getQueryData i stedet.

## Sjekkliste

- [x] Implementerer koden det designet spesifiserer?
- [x] Haandteres alle edge cases? (dobbelt-favoritt idempotent, slett andres lagrede sok = 403)
- [x] Er feilhaandtering tilstrekkelig?
- [x] Matcher frontend API-kall faktiske backend-endepunkter? (8/8 verifisert)
- [x] Er HTTP-metoder korrekte?
- [x] Matcher request/response-formater? (etter fiks)
- [x] Har API-kall i globale komponenter `enabled: !!token`? (etter fiks)
- [x] Er alle Must have implementert? (favoritter, lagrede sok, FavoriteButton, ShareButton, profilside, brukerside, tester)
- [x] Er input validert? (Pydantic schemas, Field validering)
- [x] Er autorisasjon sjekket? (get_current_user paa alle auth-endepunkter, eiersjekk paa delete saved search)
- [x] Offentlig brukerprofil eksponerer IKKE email/password
- [x] Ingen N+1-problemer (selectinload brukt konsekvent)
- [x] Har all ny kode tester? (11 tester dekker alle 11 scenarier)

## Verdict

GODKJENT (etter fiks av 2 auth-guards og 3 type-definisjoner)
