# Design: FINN.no Klone — Fase 2 (Kjerneprodukt)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase2-intake.md)

## Sammendrag

Bygge kjerneprodukt-funksjonaliteten: annonser med CRUD-operasjoner, bildeopplasting til MinIO med automatisk thumbnail-generering, kategori-browsing, og frontend med annonseopprettelse, visning og listing. Løser også teknisk gjeld fra Fase 1.

## Bakgrunn og motivasjon

Fase 1 ga oss infrastruktur og auth. Uten annonser har markedsplassen ingen verdi. Fase 2 leverer kjerneopplevelsen: legge ut, se og bla gjennom annonser.

## Krav

### Must have
- [x] Ad + AdImage modeller i database
- [x] CRUD-operasjoner for annonser (opprett, hent, oppdater, slett)
- [x] Annonseliste med paginering og filtrering (kategori, pris, tilstand)
- [x] Bildeopplasting (minst 1, maks 10 bilder per annonse)
- [x] Thumbnail-generering
- [x] Frontend: opprett annonse med bilder
- [x] Frontend: vis annonse med bildegalleri
- [x] Frontend: vis annonser per kategori
- [x] Rate limiting på auth-endepunkter (tech-debt)

### Should have
- [x] WebP-konvertering av bilder
- [x] JWT secret hard-fail i production
- [x] Annonser sortert etter nyeste/pris
- [x] Bilderekkefølge (drag-and-drop i fremtiden)
- [ ] Kategori-underkategorier i seed (utsettes hvis tid mangler)

### Could have
- [ ] Test for utløpt token
- [ ] Strukturert logging med correlation IDs
- [ ] Lignende annonser-endepunkt

### Won't have (Fase 2)
- Favoritter (Fase 7)
- Meldinger/chat (Fase 4)
- Fulltekstsøk (Fase 3)

## Arkitektur

### Komponentdesign — Backend (nye/endrede filer)
```
app/
├── models/
│   ├── ad.py              → Ad + PriceType/Condition/AdStatus enums
│   └── ad_image.py        → AdImage modell
│
├── schemas/
│   └── ad.py              → AdCreate, AdUpdate, AdResponse, AdListResponse, AdImageResponse
│
├── services/
│   ├── ad_service.py      → CRUD, list med filtre, paginering
│   └── image_service.py   → upload til MinIO, resize, thumbnail, WebP
│
├── routers/
│   ├── ads.py             → /api/v1/ads/* endepunkter
│   └── categories.py      → utvidet med /categories/{slug}/ads
│
├── middleware/
│   └── rate_limit.py      → In-memory rate limiter (tech-debt fix)
│
└── utils/
    └── image.py           → Pillow resize/thumbnail/WebP helpers
```

### Komponentdesign — Frontend (nye filer)
```
src/
├── types/
│   └── ad.ts              → Ad, AdImage, PriceType, Condition, AdStatus
│
├── hooks/
│   └── useAds.ts          → React Query hooks for ads API
│
├── components/
│   ├── ad/
│   │   ├── AdCard.tsx     → Kompakt kort med bilde, tittel, pris, sted
│   │   ├── AdGrid.tsx     → Responsivt grid av AdCards
│   │   ├── AdDetail.tsx   → Full visning med bildegalleri
│   │   ├── AdForm.tsx     → Flersteg: kategori → detaljer → bilder → forhåndsvis
│   │   ├── ImageGallery.tsx → Swipe-bar bildegalleri
│   │   ├── ImageUpload.tsx → Drag-drop bildeopplasting
│   │   ├── PriceTag.tsx   → Formatert prisvisning
│   │   └── Badge.tsx      → Status-badge (NY, SOLGT, GRATIS)
│   └── search/
│       ├── FilterPanel.tsx → Filtre for kategori, pris, tilstand
│       └── SortSelect.tsx  → Sorteringsvalg
│
├── app/
│   ├── ad/
│   │   ├── [id]/page.tsx  → Annonsevisning
│   │   └── new/page.tsx   → Opprett annonse
│   └── category/
│       └── [slug]/page.tsx → Kategoriside med annonser
```

### Datamodell

```sql
-- Enums
CREATE TYPE price_type AS ENUM ('FIXED', 'BID', 'FREE', 'CONTACT');
CREATE TYPE ad_condition AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');
CREATE TYPE ad_status AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED', 'DRAFT');

-- ads
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,          -- øre
    price_type price_type NOT NULL DEFAULT 'FIXED',
    condition ad_condition NOT NULL DEFAULT 'GOOD',
    status ad_status NOT NULL DEFAULT 'DRAFT',
    location VARCHAR(200),
    latitude FLOAT,
    longitude FLOAT,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ad_images
CREATE TABLE ad_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_ads_seller ON ads(seller_id);
CREATE INDEX idx_ads_category ON ads(category_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_created ON ads(created_at DESC);
CREATE INDEX idx_ads_price ON ads(price);
CREATE INDEX idx_ad_images_ad ON ad_images(ad_id);
```

### API-kontrakter

```
GET /api/v1/ads?page=1&per_page=20&category=<slug>&price_min=&price_max=&condition=&sort=newest|price_asc|price_desc
Response: {
  "items": [AdResponse],
  "total": int,
  "page": int,
  "per_page": int,
  "pages": int
}

POST /api/v1/ads (auth required)
Request: {
  "title": "str (3-200)",
  "description": "str (10-5000)",
  "price": int (≥0, øre),
  "price_type": "FIXED|BID|FREE|CONTACT",
  "condition": "NEW|LIKE_NEW|GOOD|FAIR",
  "category_id": "uuid",
  "location": "str (optional)"
}
Response: AdResponse (status 201)

GET /api/v1/ads/{id}
Response: AdResponse (med images, seller info)
Side-effect: views_count += 1

PATCH /api/v1/ads/{id} (auth required, kun eier)
Request: { partial AdCreate felter }
Response: AdResponse

DELETE /api/v1/ads/{id} (auth required, kun eier)
Response: 204 No Content

POST /api/v1/ads/{id}/images (auth required, kun eier, multipart/form-data)
Request: file (image/jpeg, image/png, image/webp, max 5MB)
Response: AdImageResponse (status 201)

DELETE /api/v1/ads/{id}/images/{image_id} (auth required, kun eier)
Response: 204 No Content

GET /api/v1/categories/{slug}/ads?page=1&per_page=20&sort=newest
Response: { items, total, page, per_page, pages }
```

**AdResponse**:
```json
{
  "id": "uuid",
  "title": "str",
  "description": "str",
  "price": 15000,
  "price_type": "FIXED",
  "condition": "GOOD",
  "status": "ACTIVE",
  "location": "Oslo",
  "views_count": 42,
  "created_at": "datetime",
  "updated_at": "datetime",
  "images": [{"id": "uuid", "url": "str", "thumbnail_url": "str", "position": 0}],
  "seller": {"id": "uuid", "name": "str", "avatar_url": "str|null", "rating": 0.0},
  "category": {"id": "uuid", "name": "str", "slug": "str", "icon": "str"}
}
```

### MinIO bildeopplasting-flyt

```
1. Frontend → POST /api/v1/ads/{id}/images (multipart file)
2. Backend validerer: filtype, størrelse (≤5MB), bruker er eier
3. Backend prosesserer med Pillow:
   - Original: resize til max 1200x1200, konverter til WebP
   - Thumbnail: 400x300, WebP
4. Backend laster opp til MinIO bucket "finn-images":
   - ads/{ad_id}/{image_id}.webp
   - ads/{ad_id}/{image_id}_thumb.webp
5. Backend lagrer URLs i ad_images-tabell
6. Response: AdImageResponse med URLs
```

### Rate Limiting (tech-debt fix)

```python
# In-memory sliding window rate limiter
# Bruker dict med timestamps per IP/bruker
# Konfigurerbart per endepunkt:
#   - /auth/login: 5 requests per minutt
#   - /auth/register: 3 requests per minutt
#   - /ads (POST): 10 requests per minutt
```

## Sikkerhetsvurdering

- **Autorisasjon**: Kun eier kan oppdatere/slette annonse og laste opp bilder
- **Bildeopplasting**: Filtype-validering (JPEG, PNG, WebP), maks 5MB, Pillow verifiserer at filen er et bilde
- **Input-validering**: Tittel 3-200 tegn, beskrivelse 10-5000, pris ≥0
- **Rate limiting**: Auth 5/min, register 3/min, opprett annonse 10/min
- **MinIO**: Intern nettverkstilgang, bilder serves via API (ikke direkte MinIO-URL)
- **SQL injection**: Parametriserte queries via SQLAlchemy

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | Opprett annonse med gyldige data | Integration | 201, annonse opprettet |
| 2 | Opprett annonse uten auth | Integration | 401 |
| 3 | Opprett annonse med ugyldig kategori | Integration | 404/422 |
| 4 | Opprett annonse med for kort tittel | Integration | 422 validation error |
| 5 | Hent annonse med ID | Integration | 200, komplett data inkl bilder/seller |
| 6 | Hent ikke-eksisterende annonse | Integration | 404 |
| 7 | Liste annonser med paginering | Integration | 200, pagineringsinformasjon |
| 8 | Filtrere annonser på kategori | Integration | 200, kun annonser i kategori |
| 9 | Filtrere annonser på pris-range | Integration | 200, kun innenfor range |
| 10 | Oppdater egen annonse | Integration | 200, oppdatert |
| 11 | Oppdater andres annonse | Integration | 403 Forbidden |
| 12 | Slett egen annonse | Integration | 204 |
| 13 | Slett andres annonse | Integration | 403 Forbidden |
| 14 | Last opp bilde (gyldig JPEG) | Integration | 201, URL returnert |
| 15 | Last opp bilde for andres annonse | Integration | 403 |
| 16 | Last opp ugyldig filtype | Integration | 422 |
| 17 | Rate limiting blokkerer etter grense | Integration | 429 Too Many Requests |
| 18 | Hent annonser i kategori via slug | Integration | 200, riktige annonser |
| 19 | Views count øker ved henting | Integration | views_count + 1 |

## Implementeringsplan

1. Backend: Ad + AdImage modeller, enums
2. Backend: Ad schemas (Pydantic)
3. Backend: Rate limiting middleware + JWT hardening (tech-debt)
4. Backend: Ad service (CRUD, paginering, filtrering)
5. Backend: Image service (MinIO, Pillow)
6. Backend: Ad router + categories/{slug}/ads
7. Backend: Test-stubs fra testplan (PE3)
8. Backend: Test-implementasjon
9. Frontend: Ad types + API hooks
10. Frontend: AdCard, AdGrid, PriceTag, Badge
11. Frontend: ImageGallery, ImageUpload, FilterPanel, SortSelect
12. Frontend: Opprett annonse (flersteg-skjema)
13. Frontend: Annonsevisning
14. Frontend: Kategoriside
15. Frontend: Oppdater forside

## Referanser
- Spesifikasjon: [finn.md](../../finn.md)
- Fase 1 design: [Fase 1 grunnmur](2026-03-28-finn-fase1-grunnmur.md)
- Tech-debt: [tech-debt.md](../../.dsf/logs/tech-debt.md)
- Learnings: 001-006 i .dsf/learnings/
