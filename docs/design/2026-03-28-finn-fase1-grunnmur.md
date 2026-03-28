# Design: FINN.no Klone — Fase 1 (Grunnmur)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase1-intake.md)

## Sammendrag

Bygge grunnmuren for en FINN.no-lignende markedsplass-PWA: Docker-infrastruktur med PostgreSQL/Redis/MinIO, FastAPI backend med JWT-basert autentisering, og Next.js frontend med layout og auth-sider.

## Bakgrunn og motivasjon

Fase 1 etablerer alt som trengs for å begynne å bygge forretningslogikk. Uten solid auth, database-oppsett og prosjektstruktur vil alle påfølgende faser bli ineffektive.

## Krav

### Funksjonelle
- [x] Brukerregistrering med e-post og passord
- [x] Innlogging med JWT access + refresh tokens
- [x] Token refresh uten re-login
- [x] Logout (invalidere refresh token)
- [x] Hente og oppdatere egen profil
- [x] Kategorier seeded i databasen
- [x] Responsivt layout med header og mobil bottom-nav
- [x] Login og register sider i frontend

### Ikke-funksjonelle
- Ytelse: Async hele veien (asyncpg, async SQLAlchemy)
- Sikkerhet: bcrypt hashing, JWT RS256/HS256, refresh token rotation
- Skalerbarhet: Stateless API, horisontal skalerbar bak load balancer
- Observerbarhet: Strukturert logging med correlation IDs

## Arkitektur

### Kontekstdiagram
```
[Bruker/Nettleser]
       │
       ▼
[Nginx :80] ─── /api/* ──→ [FastAPI :8000] ──→ [PostgreSQL :5432]
       │                          │              [Redis :6379]
       └─── /* ──→ [Next.js :3000]               [MinIO :9000]
```

### Komponentdesign — Backend
```
app/
├── main.py              → FastAPI app, middleware, lifespan
├── config.py            → Pydantic Settings (env vars)
├── database.py          → async engine, sessionmaker, Base
├── dependencies.py      → get_db, get_current_user
│
├── models/
│   ├── __init__.py      → eksporter alle modeller
│   ├── user.py          → User SQLAlchemy-modell
│   └── category.py      → Category SQLAlchemy-modell
│
├── schemas/
│   ├── auth.py          → RegisterRequest, LoginRequest, TokenResponse
│   └── user.py          → UserResponse, UserUpdate
│
├── services/
│   └── auth_service.py  → create_user, authenticate, create_tokens, refresh
│
├── routers/
│   ├── auth.py          → /api/v1/auth/*
│   └── users.py         → /api/v1/users/*
│
└── utils/
    └── security.py      → hash_password, verify_password, create_jwt, decode_jwt
```

### Komponentdesign — Frontend
```
src/
├── app/
│   ├── layout.tsx       → Root layout, fonts, providers
│   ├── page.tsx         → Forside (placeholder)
│   ├── login/page.tsx   → Login-side
│   └── register/page.tsx → Register-side
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx   → Logo, søkefelt, nav, bruker-meny
│   │   └── BottomNav.tsx → Mobil bottom navigation
│   ├── user/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── common/
│       ├── Button.tsx
│       └── Input.tsx
│
├── lib/
│   ├── api.ts           → Axios instance med interceptors
│   └── auth.ts          → Token storage, refresh logic
│
├── hooks/
│   └── useAuth.ts       → Login, logout, register, currentUser
│
├── stores/
│   └── authStore.ts     → Zustand auth state
│
└── types/
    ├── user.ts          → User, LoginRequest, RegisterRequest
    └── api.ts           → ApiResponse, ApiError
```

### Datamodell

```sql
-- users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    location VARCHAR(100),
    rating FLOAT DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    position INT DEFAULT 0
);

-- refresh_tokens (for token rotation)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### API-kontrakter

```
POST /api/v1/auth/register
Request:  { "email": "str", "name": "str", "password": "str" }
Response: { "user": UserResponse, "access_token": "str", "refresh_token": "str" }
Status:   201

POST /api/v1/auth/login
Request:  { "email": "str", "password": "str" }
Response: { "user": UserResponse, "access_token": "str", "refresh_token": "str" }
Status:   200

POST /api/v1/auth/refresh
Request:  { "refresh_token": "str" }
Response: { "access_token": "str", "refresh_token": "str" }
Status:   200

POST /api/v1/auth/logout
Headers:  Authorization: Bearer <access_token>
Request:  { "refresh_token": "str" }
Response: { "message": "Logged out" }
Status:   200

GET /api/v1/users/me
Headers:  Authorization: Bearer <access_token>
Response: UserResponse
Status:   200

PATCH /api/v1/users/me
Headers:  Authorization: Bearer <access_token>
Request:  { "name?": "str", "phone?": "str", "location?": "str" }
Response: UserResponse
Status:   200

GET /api/v1/categories
Response: CategoryResponse[] (nested tree)
Status:   200
```

**UserResponse**:
```json
{
  "id": "uuid",
  "email": "str",
  "name": "str",
  "phone": "str|null",
  "avatar_url": "str|null",
  "location": "str|null",
  "rating": 0.0,
  "is_verified": false,
  "created_at": "datetime"
}
```

## Sikkerhetsvurdering

- **Autentisering**: JWT HS256 med kort levetid (15 min access, 7 dager refresh). Refresh token rotation — gammel token invalideres ved bruk.
- **Passord**: bcrypt med cost factor 12. Minimum 8 tegn, validert i Pydantic.
- **Input-validering**: Pydantic på backend, Zod på frontend. E-post normalisert (lowercase, trimmet).
- **Sensitive data**: Passord-hash aldri eksponert i API. Refresh tokens hashet i DB (SHA-256).
- **Rate limiting**: 5 forsøk/minutt på login, 3/minutt på register.
- **CORS**: Bare tillat frontend-origin.

## Testplan

| Scenario | Type | Forventet resultat |
|----------|------|--------------------|
| Registrer ny bruker | Integration | 201, bruker opprettet, tokens returnert |
| Registrer med eksisterende e-post | Integration | 409 Conflict |
| Registrer med svakt passord | Unit | Valideringsfeil |
| Login med korrekt passord | Integration | 200, tokens returnert |
| Login med feil passord | Integration | 401 Unauthorized |
| Login med ikke-eksisterende bruker | Integration | 401 Unauthorized |
| Refresh med gyldig token | Integration | 200, nye tokens, gammel invalidert |
| Refresh med brukt/revoked token | Integration | 401 Unauthorized |
| Hent /users/me med gyldig token | Integration | 200, brukerdata |
| Hent /users/me uten token | Integration | 401 Unauthorized |
| Hent /users/me med utløpt token | Integration | 401 Unauthorized |
| Oppdater profil | Integration | 200, oppdatert brukerdata |
| Hent kategorier | Integration | 200, nestede kategorier |

## Implementeringsplan

1. Docker Compose + .env.example + Dockerfiler
2. Backend bootstrap (pyproject.toml, main.py, config.py)
3. Database (database.py, Alembic init)
4. Modeller (User, Category, RefreshToken) + migrering
5. Auth service + security utils
6. Auth router + user router
7. Backend tester
8. Frontend bootstrap (Next.js, Tailwind, PWA manifest)
9. Layout-komponenter (Header, BottomNav)
10. Common-komponenter (Button, Input)
11. API client + auth hooks + store
12. Login/Register sider
13. Nginx config

## Åpne spørsmål
- Ingen — Fase 1 er godt definert i finn.md

## Referanser
- ADR: [ADR-0001 JWT-strategi](../architecture/decisions/0001-jwt-auth-strategi.md)
- Spesifikasjon: [finn.md](../../finn.md)
