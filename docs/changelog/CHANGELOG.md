# Changelog

Alle vesentlige endringer i prosjektet dokumenteres her.
Format basert på [Keep a Changelog](https://keepachangelog.com/).

## [2026-03-28] — Fase 2: Kjerneprodukt

### Lagt til
- Ad og AdImage datamodeller med enums (PriceType, AdCondition, AdStatus)
- Komplett CRUD API for annonser med paginering og filtrering
- Bildeopplasting med Pillow — resize, thumbnail, WebP-konvertering
- Rate limiting middleware (5/min login, 3/min register, 10/min opprett annonse)
- JWT secret hard-fail i production-miljø
- Kategori/{slug}/ads endepunkt
- Frontend: AdCard, AdGrid, AdDetail, ImageGallery, ImageUpload, PriceTag, Badge
- Frontend: Flersteg annonse-skjema (kategori→detaljer→bilder→forhåndsvis)
- Frontend: Annonsevisning med bildegalleri
- Frontend: Kategoriside med filtre og paginering
- Frontend: FilterPanel og SortSelect komponenter
- Oppdatert forside med ekte annonsedata
- 19 nye backend-tester (32 totalt, 100% bestått)

### Fikset
- Rate limiting (tech-debt fra Fase 1)
- JWT secret hardening i production (tech-debt fra Fase 1)
- AdForm henter kategorier fra API med ekte UUID-er (review-funn K1)
- Axios FormData uten manuell Content-Type header (review-funn K2)

### Refs
- Design: [docs/design/2026-03-28-finn-fase2-kjerneprodukt.md](../design/2026-03-28-finn-fase2-kjerneprodukt.md)

---

## [2026-03-28] — Fase 1: Grunnmur

### Lagt til
- Docker Compose-oppsett med PostgreSQL 16, Redis 7, MinIO og Nginx
- FastAPI backend med async SQLAlchemy 2.0 og asyncpg
- Brukerregistrering og innlogging med JWT access + refresh tokens
- Refresh token rotation for sikker token-fornyelse
- User, Category og RefreshToken datamodeller
- Auth-router: register, login, refresh, logout
- User-router: GET/PATCH profil
- Category-router: liste med trestruktur
- Seed-script med 12 norske markedsplass-kategorier
- Next.js 16 frontend med Tailwind CSS, TypeScript og PWA-manifest
- Responsivt layout: Header med søkefelt, mobil BottomNav
- Login og registreringssider med Zod-validering
- Axios API-klient med automatisk token refresh
- Zustand auth store
- 13 integrasjonstester (100% bestått)
- Forside med hero-seksjon og kategorikort

### Sikkerhet
- JWT HS256 med 15 min access token levetid
- bcrypt passord-hashing
- Refresh token rotation med revokering
- Email-normalisering (lowercase)
- JWT secret advarsel ved usikker default

### Refs
- Design: [docs/design/2026-03-28-finn-fase1-grunnmur.md](../design/2026-03-28-finn-fase1-grunnmur.md)
- ADR: [ADR-0001 JWT Auth-strategi](../architecture/decisions/0001-jwt-auth-strategi.md)
