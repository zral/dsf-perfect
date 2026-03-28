# Design: FINN.no Klone — Fase 7 (Sosial)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase7-intake.md)

## Sammendrag

Siste fase: favoritter med hjerte-animasjon, lagrede søk med varslings-toggles, Web Share API for deling, profilside med brukerens annonser, og offentlig brukerside.

## Krav

### Must have
- Favorite: legg til/fjern favoritt, liste favoritter
- Sjekk om annonse er favorittmerket (for hjerte-ikon)
- Lagrede søk: opprett, list, slett
- FavoriteButton i AdCard og AdDetail
- ShareButton i AdDetail (Web Share API med fallback)
- Profilside /profile (mine annonser, favoritter, lagrede søk)
- Brukerside /user/[id] (offentlig profil med annonser)
- Backend tester for alt

### Should have
- Hjerte-animasjon (scale + rød farge)
- Favoritt-count på annonser

### Won't have
- Brukeranmeldelser/rating-system (for stort scope)
- Varsler ved nye treff på lagrede søk (krever bakgrunnsjobber)

## Arkitektur

### Datamodell

```sql
-- favorites (allerede definert i finn.md)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ad_id)
);

-- saved_searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(200),
    category_slug VARCHAR(100),
    filters JSONB DEFAULT '{}',
    notify BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_ad ON favorites(ad_id);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
```

### Backend
```
app/
├── models/
│   ├── favorite.py        → Favorite modell
│   └── saved_search.py    → SavedSearch modell
├── schemas/
│   ├── favorite.py        → FavoriteResponse
│   └── saved_search.py    → SavedSearchCreate, SavedSearchResponse
├── services/
│   ├── favorite_service.py  → toggle, list, check, count
│   └── saved_search_service.py → create, list, delete
├── routers/
│   ├── ads.py             → POST/DELETE /{id}/favorite
│   ├── favorites.py       → GET /favorites
│   ├── saved_searches.py  → CRUD /saved-searches
│   └── users.py           → GET /users/{id}, GET /users/{id}/ads
```

### API-kontrakter

```
POST /api/v1/ads/{id}/favorite (auth) → 201 | 204 (toggle)
DELETE /api/v1/ads/{id}/favorite (auth) → 204
GET /api/v1/favorites (auth) → [AdResponse] med is_favorited=true

GET /api/v1/saved-searches (auth) → [SavedSearchResponse]
POST /api/v1/saved-searches (auth)
  Request: { query?, category_slug?, filters?: {price_min, price_max, condition}, notify?: bool }
  Response: SavedSearchResponse (201)
DELETE /api/v1/saved-searches/{id} (auth) → 204

GET /api/v1/users/{id} → UserPublicResponse
GET /api/v1/users/{id}/ads → AdListResponse
```

### Frontend
```
src/
├── hooks/
│   ├── useFavorites.ts     → useFavorites, useToggleFavorite, useIsFavorited
│   └── useSavedSearches.ts → useSavedSearches, useCreateSavedSearch, useDeleteSavedSearch
├── components/
│   ├── ad/
│   │   ├── FavoriteButton.tsx → Hjerte med scale-animasjon
│   │   └── ShareButton.tsx    → Web Share API + fallback copy
│   └── user/
│       └── UserCard.tsx       → Offentlig brukerkort
├── app/
│   ├── profile/
│   │   ├── page.tsx           → Mine annonser
│   │   ├── favorites/page.tsx → Mine favoritter
│   │   └── saved-searches/page.tsx → Lagrede søk
│   └── user/
│       └── [id]/page.tsx      → Offentlig brukerprofil
```

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | Favorittmerk annonse | Integration | 201, favoritt opprettet |
| 2 | Fjern favoritt | Integration | 204 |
| 3 | Dobbelt-favoritt (idempotent) | Integration | Ingen feil |
| 4 | Favoritter uten auth | Integration | 401 |
| 5 | Liste mine favoritter | Integration | 200, kun mine |
| 6 | Opprett lagret søk | Integration | 201 |
| 7 | Liste lagrede søk | Integration | 200, kun mine |
| 8 | Slett lagret søk | Integration | 204 |
| 9 | Slett andres lagrede søk | Integration | 403/404 |
| 10 | Hent offentlig brukerprofil | Integration | 200, ingen sensitiv data |
| 11 | Hent brukers annonser | Integration | 200, kun aktive |

### Avhengighetsgraf og parallellisering

```
Lag 1 (ingen avhengigheter):
  ├── [1] Favorite-modell + schemas
  ├── [4] SavedSearch-modell + schemas
  ├── [7] Share (ren frontend)
  └── [12] ShareButton

Lag 2:
  ├── [2] Favorite service       ← [1]
  ├── [5] SavedSearch service    ← [4]
  ├── [9] FavoriteButton         ← [1] (API-kontrakt)
  └── [14] /user/[id] side      ← (eksisterende users API)

Lag 3:
  ├── [3] Favorite router        ← [2]
  ├── [6] SavedSearch router     ← [5]
  ├── [10] /profile/favorites    ← [9]
  ├── [11] Lagrede søk side      ← [5]
  └── [13] /profile side         ← (eksisterende ads API)

Lag 4:
  └── [8] Backend tester         ← [3, 6]
```

## Referanser
- finn.md: Fase 7 spesifikasjon
- Datamodell: Favorite og SavedSearch fra finn.md
