# FINN.no Klone — Komplett PWA Markedsplass

## Prosjektbeskrivelse

Bygg en fullverdig FINN.no-klone som Progressive Web App (PWA). Appen skal fungere sømløst på desktop og mobil, med offline-støtte, push-varsler og "installer app"-funksjonalitet. Moderne, rent design inspirert av FINN.no men med eget visuelt uttrykk.

## Teknologivalg

### Backend
- **Python 3.12+** med **FastAPI** (async, høy ytelse, automatisk OpenAPI-docs)
- **PostgreSQL** med **SQLAlchemy 2.0** (async ORM)
- **Redis** for caching, sessions og sanntids-funksjonalitet
- **Celery** for bakgrunnsjobber (bildebehandling, e-postvarsler)
- **MinIO / S3** for bildelagring
- **Alembic** for databasemigrasjoner

### Frontend
- **Next.js 15** (App Router) med **TypeScript**
- **Tailwind CSS 4** for styling
- **Lucide React** for moderne, konsistente ikoner
- **next-pwa** for PWA-funksjonalitet (service worker, manifest, offline)
- **Zustand** for state management
- **React Query (TanStack Query)** for server state og caching
- **React Hook Form + Zod** for skjemavalidering
- **Framer Motion** for animasjoner

### Infrastruktur
- **Docker Compose** for lokal utvikling (API, DB, Redis, MinIO)
- **Nginx** som reverse proxy

## Arkitektur

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js PWA)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ App Shell│ │ Service  │ │  Offline │            │
│  │ (cached) │ │ Worker   │ │  Fallback│            │
│  └──────────┘ └──────────┘ └──────────┘            │
│         │              │                             │
│    ┌────▼──────────────▼────┐                       │
│    │   API Client (axios)    │                       │
│    │   + React Query cache   │                       │
│    └────────────┬────────────┘                       │
└─────────────────┼───────────────────────────────────┘
                  │ REST + WebSocket
┌─────────────────┼───────────────────────────────────┐
│                 │        BACKEND (FastAPI)            │
│    ┌────────────▼────────────┐                       │
│    │     API Gateway          │                       │
│    │  Auth │ Rate Limit │ CORS│                       │
│    └────┬───────┬────────┬───┘                       │
│         │       │        │                            │
│    ┌────▼──┐ ┌──▼───┐ ┌──▼────┐                     │
│    │ Ads   │ │Users │ │Search │                      │
│    │Service│ │Serv. │ │Service│                      │
│    └───┬───┘ └──┬───┘ └───┬───┘                     │
│        │        │         │                           │
│    ┌───▼────────▼─────────▼───┐                      │
│    │      PostgreSQL           │                      │
│    │      Redis (cache)        │                      │
│    │      MinIO (bilder)       │                      │
│    └──────────────────────────┘                       │
└──────────────────────────────────────────────────────┘
```

## Datamodell

### Kjernentiteter

```python
# User
- id: UUID (PK)
- email: str (unique)
- password_hash: str
- name: str
- phone: str (optional)
- avatar_url: str (optional)
- location: str (optional)
- rating: float
- created_at: datetime
- is_verified: bool

# Ad (Annonse)
- id: UUID (PK)
- seller_id: UUID (FK → User)
- category_id: UUID (FK → Category)
- title: str
- description: text
- price: int (øre)
- price_type: enum (FIXED, BID, FREE, CONTACT)
- condition: enum (NEW, LIKE_NEW, GOOD, FAIR)
- status: enum (ACTIVE, SOLD, EXPIRED, DRAFT)
- location: str
- latitude: float (optional)
- longitude: float (optional)
- views_count: int
- created_at: datetime
- updated_at: datetime
- expires_at: datetime

# AdImage
- id: UUID (PK)
- ad_id: UUID (FK → Ad)
- url: str
- thumbnail_url: str
- position: int (rekkefølge)

# Category
- id: UUID (PK)
- parent_id: UUID (FK → Category, nullable)
- name: str
- slug: str
- icon: str (Lucide icon name)
- position: int

# Favorite
- id: UUID (PK)
- user_id: UUID (FK → User)
- ad_id: UUID (FK → Ad)
- created_at: datetime

# Message
- id: UUID (PK)
- conversation_id: UUID
- sender_id: UUID (FK → User)
- receiver_id: UUID (FK → User)
- ad_id: UUID (FK → Ad)
- content: text
- is_read: bool
- created_at: datetime

# SavedSearch
- id: UUID (PK)
- user_id: UUID (FK → User)
- query: str
- category_id: UUID (optional)
- filters: jsonb
- notify: bool
- created_at: datetime
```

## API-endepunkter

```
# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# Users
GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users/{id}
GET    /api/v1/users/{id}/ads
GET    /api/v1/users/{id}/reviews

# Ads
GET    /api/v1/ads                    # liste med filtrering, søk, paginering
POST   /api/v1/ads                    # opprett annonse
GET    /api/v1/ads/{id}               # hent annonse
PATCH  /api/v1/ads/{id}               # oppdater
DELETE /api/v1/ads/{id}               # slett
POST   /api/v1/ads/{id}/images        # last opp bilder
DELETE /api/v1/ads/{id}/images/{img}  # slett bilde
POST   /api/v1/ads/{id}/favorite      # legg til favoritt
DELETE /api/v1/ads/{id}/favorite      # fjern favoritt
GET    /api/v1/ads/{id}/similar       # lignende annonser

# Categories
GET    /api/v1/categories             # tre-struktur
GET    /api/v1/categories/{slug}/ads  # annonser i kategori

# Search
GET    /api/v1/search?q=&category=&location=&price_min=&price_max=&condition=&sort=
GET    /api/v1/search/suggest?q=      # autocomplete

# Messages
GET    /api/v1/messages/conversations
GET    /api/v1/messages/conversations/{id}
POST   /api/v1/messages               # send melding
WS     /api/v1/messages/ws            # sanntids chat

# Favorites
GET    /api/v1/favorites

# Saved Searches
GET    /api/v1/saved-searches
POST   /api/v1/saved-searches
DELETE /api/v1/saved-searches/{id}

# Images
POST   /api/v1/upload                 # pre-signed upload URL
```

## Sider og komponenter

### Sider

```
/                          → Forside (hero, kategorier, nyeste annonser)
/search                    → Søkeresultater med filtre
/ad/[id]                   → Annonsevisning
/ad/new                    → Opprett annonse (flersteg-skjema)
/ad/[id]/edit              → Rediger annonse
/category/[slug]           → Kategoriside
/messages                  → Meldingsoversikt
/messages/[conversationId] → Samtale
/profile                   → Min profil
/profile/ads               → Mine annonser
/profile/favorites         → Mine favoritter
/profile/saved-searches    → Lagrede søk
/profile/settings          → Innstillinger
/user/[id]                 → Annen brukers profil
/login                     → Innlogging
/register                  → Registrering
```

### Kjernekomponenter

```
Layout/
├── Header              → Logo, søkefelt, navigasjon, bruker-meny
├── BottomNav           → Mobil-navigasjon (hjem, søk, legg ut, meldinger, profil)
├── Footer              → Lenker, info
└── Sidebar             → Kategori-navigasjon og filtre

Ad/
├── AdCard              → Kompakt annonse-kort (bilde, tittel, pris, sted)
├── AdGrid              → Responsivt rutenett av AdCard
├── AdDetail            → Full annonsevisning med bildegalleri
├── AdForm              → Flersteg opprett/rediger (kategori → detaljer → bilder → forhåndsvis)
├── ImageGallery        → Swipeable bildegalleri med zoom
├── PriceTag            → Prisvisning med formatering
├── FavoriteButton      → Hjerte-ikon med animasjon
└── ShareButton         → Del annonse (native share API)

Search/
├── SearchBar           → Autocomplete med debounce
├── FilterPanel         → Kategori, pris, tilstand, sted, sortering
├── FilterChips         → Aktive filtre som fjernbare chips
├── SortSelect          → Sorteringsvalg
└── SearchSuggestions   → Dropdown med forslag

User/
├── UserAvatar          → Profilbilde med fallback-initialer
├── UserCard            → Brukerinfo-kort
├── LoginForm           → E-post/passord innlogging
├── RegisterForm        → Registreringsskjema
└── ProfileEditor       → Rediger profil

Messages/
├── ConversationList    → Liste over samtaler
├── ChatWindow          → Sanntids chat
├── MessageBubble       → Enkelt meldingsboble
└── ChatInput           → Meldingsinput med send-knapp

Common/
├── Button              → Primær, sekundær, ghost, danger varianter
├── Input               → Tekstfelt med label, feil, ikon
├── Select              → Dropdown
├── Modal               → Dialogboks
├── Toast               → Varselmeldinger
├── Skeleton            → Loading-placeholder
├── EmptyState          → Tom tilstand med illustrasjon
├── InfiniteScroll      → Uendelig scroll med intersection observer
├── Badge               → Statusmerker (NY, SOLGT, GRATIS)
└── Breadcrumb          → Navigasjonsti
```

## Design-system

### Fargepalett
```css
/* Primær — inspirert av nordisk design */
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;    /* Hovedfarge — klar blå */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Sekundær — varm aksent */
--accent-500:  #06b6d4;    /* Cyan for CTA-er */

/* Status */
--success:     #22c55e;
--warning:     #f59e0b;
--error:       #ef4444;

/* Nøytrale */
--gray-50:     #f9fafb;
--gray-100:    #f3f4f6;
--gray-200:    #e5e7eb;
--gray-500:    #6b7280;
--gray-800:    #1f2937;
--gray-900:    #111827;
```

### Typografi
```css
/* Font: Inter (lesbarhet) + display font for overskrifter */
--font-sans:    'Inter', system-ui, sans-serif;
--font-display: 'Plus Jakarta Sans', sans-serif;

/* Størrelser */
--text-xs:   0.75rem;   /* 12px — metadata */
--text-sm:   0.875rem;  /* 14px — sekundær tekst */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — fremhevet */
--text-xl:   1.25rem;   /* 20px — korttitler */
--text-2xl:  1.5rem;    /* 24px — seksjonstitler */
--text-3xl:  1.875rem;  /* 30px — sidetitler */
--text-4xl:  2.25rem;   /* 36px — hero */
```

### Ikoner (Lucide React)
```
Navigasjon:  Home, Search, PlusCircle, MessageCircle, User
Annonser:    Heart, Share2, MapPin, Clock, Eye, Tag, Camera
Kategorier:  Car, Home, Briefcase, Smartphone, Shirt, Sofa, Wrench, Baby
Status:      CheckCircle, AlertCircle, XCircle, Star
UI:          ChevronRight, ChevronDown, Filter, SlidersHorizontal, X, Menu
```

### Responsive breakpoints
```css
sm:  640px   /* Mobil landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Stor desktop */
2xl: 1536px  /* Ekstra stor */
```

## PWA-krav

### manifest.json
```json
{
  "name": "Markedsplass",
  "short_name": "Marked",
  "description": "Kjøp og selg brukt — enkelt og trygt",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Service Worker-strategi
- **App Shell**: Cache-first (HTML-rammeverk, CSS, JS)
- **API-data**: Network-first med cache-fallback
- **Bilder**: Cache-first med stale-while-revalidate
- **Offline-side**: Vises når nettverket er utilgjengelig

### Push-varsler
- Ny melding mottatt
- Svar på din annonse
- Prisendring på favoritt
- Nye treff på lagret søk

## Mappestruktur

```
finn-clone/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── pyproject.toml
│   ├── alembic/
│   │   └── versions/
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── config.py               # Pydantic settings
│   │   ├── database.py             # Async SQLAlchemy engine
│   │   ├── dependencies.py         # DI (auth, db session)
│   │   ├── models/                 # SQLAlchemy-modeller
│   │   │   ├── user.py
│   │   │   ├── ad.py
│   │   │   ├── category.py
│   │   │   ├── message.py
│   │   │   └── favorite.py
│   │   ├── schemas/                # Pydantic request/response
│   │   │   ├── user.py
│   │   │   ├── ad.py
│   │   │   └── message.py
│   │   ├── routers/                # API-endepunkter
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── ads.py
│   │   │   ├── categories.py
│   │   │   ├── search.py
│   │   │   ├── messages.py
│   │   │   └── favorites.py
│   │   ├── services/               # Forretningslogikk
│   │   │   ├── auth_service.py
│   │   │   ├── ad_service.py
│   │   │   ├── search_service.py
│   │   │   ├── message_service.py
│   │   │   └── image_service.py
│   │   ├── utils/
│   │   │   ├── security.py         # JWT, hashing
│   │   │   └── image.py            # Bildeprosessering
│   │   └── tasks/                  # Celery bakgrunnsjobber
│   │       ├── notifications.py
│   │       └── image_processing.py
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_ads.py
│       └── test_search.py
│
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── public/
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   └── icons/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout med providers
│   │   │   ├── page.tsx            # Forside
│   │   │   ├── search/page.tsx
│   │   │   ├── ad/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── category/[slug]/page.tsx
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ads/page.tsx
│   │   │   │   └── favorites/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── ad/
│   │   │   ├── search/
│   │   │   ├── user/
│   │   │   ├── messages/
│   │   │   └── common/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAds.ts
│   │   │   ├── useSearch.ts
│   │   │   └── useMessages.ts
│   │   ├── lib/
│   │   │   ├── api.ts              # Axios instance
│   │   │   ├── auth.ts             # Token management
│   │   │   └── utils.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   └── types/
│   │       ├── ad.ts
│   │       ├── user.ts
│   │       └── api.ts
│   └── tests/
│       ├── components/
│       └── e2e/
│
└── nginx/
    └── nginx.conf
```

## Seed-data og kategorier

### Hovedkategorier (med Lucide-ikoner)
```
🚗 Bil og motor        → Car
🏠 Eiendom             → Home
💼 Jobb                → Briefcase
📱 Elektronikk         → Smartphone
👕 Klær og mote        → Shirt
🛋️ Møbler og interiør  → Sofa
🔧 Tjenester           → Wrench
👶 Barn og familie     → Baby
🏋️ Sport og fritid     → Dumbbell
🎮 Hobby og underholdning → Gamepad2
📚 Bøker og media      → BookOpen
🐾 Dyr og utstyr       → PawPrint
```

### Seed-script
Opprett et seed-script som genererer:
- 12 hovedkategorier med underkategorier
- 10 testbrukere med profilbilder
- 100+ realistiske annonser med placeholder-bilder
- Noen meldingssamtaler

## Kjøremiljø

### docker-compose.yml
```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql+asyncpg://finn:finn@db:5432/finn
      REDIS_URL: redis://redis:6379
      MINIO_ENDPOINT: minio:9000
    depends_on: [db, redis, minio]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: finn
      POSTGRES_USER: finn
      POSTGRES_PASSWORD: finn
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

volumes:
  pgdata:
```

### Oppstart
```bash
# 1. Klon og start
docker compose up -d

# 2. Kjør migrasjoner
docker compose exec api alembic upgrade head

# 3. Seed data
docker compose exec api python -m app.seed

# 4. Åpne
open http://localhost:3000
```

## Kvalitetskrav

### Ytelse
- Lighthouse PWA-score: ≥90
- Largest Contentful Paint: <2.5s
- First Input Delay: <100ms
- Cumulative Layout Shift: <0.1
- Bilder: WebP med lazy loading og blur placeholder

### Sikkerhet
- JWT med refresh token rotation
- Rate limiting på auth-endepunkter
- Input-sanitisering på alle felt
- CSRF-beskyttelse
- Helmet-headers
- Bildeopplasting: filtype-validering, størrelsesbegrensning, virus-scan

### Tilgjengelighet
- WCAG 2.1 AA
- Tastaturnavigasjon
- Skjermleser-vennlig
- Tilstrekkelig fargekontrast

## Implementeringsrekkefølge

1. **Fase 1 — Grunnmur**: Docker, database, auth, brukerregistrering
2. **Fase 2 — Kjerneprodukt**: Annonser CRUD, bildeopplasting, kategorier
3. **Fase 3 — Søk og oppdagelse**: Fulltekstsøk, filtre, sortering, autocomplete
4. **Fase 4 — Kommunikasjon**: Meldinger, WebSocket, varsler
5. **Fase 5 — PWA**: Service worker, offline, push-varsler, installasjon
6. **Fase 6 — Polish**: Animasjoner, skeleton loading, infinite scroll, SEO
7. **Fase 7 — Sosial**: Favoritter, lagrede søk, brukeranmeldelser, deling
