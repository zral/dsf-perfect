# Changelog

Alle vesentlige endringer i prosjektet dokumenteres her.
Format basert på [Keep a Changelog](https://keepachangelog.com/).

## [2026-03-28] — Fase 6: Polish

### Lagt til
- Skeleton loading for AdGrid (8 skeleton-kort) og AdDetail (komplett layout-skeleton)
- Infinite scroll med IntersectionObserver for kategori- og soekesider (useInfiniteQuery)
- SEO: dynamiske meta-tags (title, description, Open Graph) for annonse- og kategorisider med generateMetadata
- Toast notification system med Zustand store, auto-dismiss (3s), desktop (bottom-right) og mobil (top) plassering
- Custom 404-side med norsk tekst og link til forsiden
- Bilde-placeholder (ImagePlaceholder) for annonser uten bilder, integrert i AdCard
- Lignende annonser: backend GET /api/v1/ads/{id}/similar (samme kategori, maks 6, ekskluderer gjeldende)
- Lignende annonser: frontend SimilarAds-komponent med horisontal scroll (mobil) og grid (desktop)
- Error boundary med fallback-UI og "Proev igjen"-knapp, wrapper rundt main content i layout
- InfiniteScroll-komponent med IntersectionObserver og 200px rootMargin
- Skeleton-komponent (gjenbrukbar, text/circular/rectangular varianter)
- AdCardSkeleton-komponent
- 2 nye backend-tester for lignende annonser (61 totalt, 100% bestaende)

### Dokumentert som teknisk gjeld
- categoryNames-map duplisert mellom page.tsx og CategoryPageClient.tsx
- Soekehistorikk og highlight (Won't have, utsatt)

### Refs
- Design: [docs/design/2026-03-28-finn-fase6-polish.md](../design/2026-03-28-finn-fase6-polish.md)

---

## [2026-03-28] — Fase 5: PWA (Progressive Web App)

### Lagt til
- Service worker (sw.js) med differensierte caching-strategier: cache-first for app shell, network-first for API, stale-while-revalidate for bilder
- Offline fallback-side (offline.html) med Markedsplass-branding og "Proev igjen"-knapp
- PWA-ikoner: 192x192, 512x512 og 512x512 maskable
- Komplett manifest.json med app-metadata, ikoner og standalone-modus
- ServiceWorkerRegistration komponent med automatisk SW-registrering
- InstallPrompt komponent ("Legg til paa hjemskjermen") med 7-dagers dismiss-hukommelse
- OfflineIndicator komponent med online/offline/reconnected-varsler
- PWA meta-tags i layout.tsx for iOS, Android og Windows
- Oppdatert layout.tsx med SW-registrering, install prompt og offline-indikator

### Sikkerhet
- Service worker cacher kun GET-requests — ingen auth-tokens eller sensitive data i cache
- Versjonerte cache-names med automatisk opprydding av gamle cacher
- Ingen cross-origin caching, non-HTTP-protokoller blokkeres

### Dokumentert som teknisk gjeld
- Cache size limit (ingen maks-grense paa API/bilde-cache)
- SW update notification (ingen varsel naar ny versjon er tilgjengelig)
- Push-varsler (krever backend push-infrastruktur)
- Full offline CRUD

### Refs
- Design: [docs/design/2026-03-28-finn-fase5-pwa.md](../design/2026-03-28-finn-fase5-pwa.md)

---

## [2026-03-28] — Fase 4: Kommunikasjon

### Lagt til
- Meldingssystem mellom kjoper og selger knyttet til annonser
- Conversation-modell med unik (ad, buyer, seller)-kombinasjon og samtale-deduplisering
- Message-modell med is_read-status og tidsstempler
- REST API: POST /messages (send melding / opprett samtale), GET /conversations, GET /conversations/{id}
- GET /unread-count endepunkt for ulest-teller
- Automatisk marking av meldinger som lest ved henting av samtale
- WebSocket-endepunkt for sanntidslevering av meldinger med ConnectionManager
- WebSocket-autentisering via JWT i query parameter
- Frontend: ConversationList med siste melding, ulest-badge og tidsformatering
- Frontend: ChatWindow med tidsstempel-gruppering (I dag, I gar, dato)
- Frontend: MessageBubble med lest/ulest-indikatorer (check/dobbeltcheck)
- Frontend: ChatInput med auto-resize textarea og Enter-sending
- Frontend: /meldinger oversiktsside og /meldinger/[id] samtale-side
- Frontend: "Kontakt selger"-knapp i AdDetail med modal for forstegangsmelding
- Frontend: Ulest-teller i Header (desktop) og BottomNav (mobil) med 30s polling
- Frontend: WebSocket-hook med auto-reconnect og cache-oppdatering
- 12 nye backend-integrasjonstester (59 totalt, 100% bestaaende)

### Fikset
- Backend GET /conversations/{id} inkluderer naa conversation-metadata (review-funn K1)
- Inline-imports i messages.py flyttet til toppen av filen (review-funn F2)

### Dokumentert som teknisk gjeld
- Typing-indikator via WebSocket (Should have, Fase 5)
- Rate limiting paa meldinger 30/min per bruker (Should have, Fase 5)
- Push-varsler (Could have, Fase 5 PWA)
- Blokkering av brukere (Could have, Fase 6+)
- Rapportering av meldinger (Could have, Fase 6+)

### Refs
- Design: [docs/design/2026-03-28-finn-fase4-kommunikasjon.md](../design/2026-03-28-finn-fase4-kommunikasjon.md)

---

## [2026-03-28] — Fase 3: Søk og oppdagelse

### Lagt til
- Fulltekstsøk med ILIKE i tittel og beskrivelse (AND-logikk mellom ord)
- Autocomplete/suggest med prefix-match og fallback
- Søkerouter: GET /search med alle filtre, GET /search/suggest
- Avansert filtrering: kategori, pris, tilstand, sted, sortering
- Kategori-underkategorier i seed (19 sub-kategorier)
- Frontend: SearchBar med autocomplete, tastaturnavigasjon og debounce
- Frontend: Søkeresultatside /search med URL-synkroniserte filtre
- Frontend: EmptyState komponent for "Ingen treff"
- Frontend: Sted-filter i FilterPanel
- Header og forside med ekte SearchBar
- 15 nye backend-tester (47 totalt, 100% bestått)

### Fikset
- Kategori-underkategorier (tech-debt fra Fase 2)

### Refs
- Design: [docs/design/2026-03-28-finn-fase3-sok.md](../design/2026-03-28-finn-fase3-sok.md)

---

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
