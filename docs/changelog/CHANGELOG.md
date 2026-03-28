# Changelog

Alle vesentlige endringer i prosjektet dokumenteres her.
Format basert på [Keep a Changelog](https://keepachangelog.com/).

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
