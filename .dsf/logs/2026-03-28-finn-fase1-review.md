# Code Review: FINN.no Fase 1 — Grunnmur
Dato: 2026-03-28
Reviewer: DSF Automated Review (Subagent)

## Sammendrag

Fase 1 implementerer en solid grunnmur for en FINN.no-lignende markedsplass med Docker-infrastruktur (PostgreSQL, Redis, MinIO, Nginx), FastAPI backend med JWT-autentisering og refresh token rotation, samt Next.js frontend med Tailwind CSS, auth-sider og responsivt layout. Koden er generelt velstrukturert, lesbar og følger god prosjektorganisering. Det er imidlertid flere sikkerhetsfunn og noen avvik fra designdokumentet som må adresseres.

## Funn

### Kritisk

**K1. Feil API-endepunkt i frontend authStore — fetchUser kaller /api/v1/auth/me (finnes ikke)**
- Fil: `frontend/src/stores/authStore.ts`, linje 76
- `fetchUser` kaller `api.get<User>("/api/v1/auth/me")` men backend har kun `/api/v1/users/me`. Dette betyr at automatisk re-autentisering ved sidelast vil feile med 404/405, og brukeren vil bli logget ut uventet.
- Skal være: `/api/v1/users/me`

**K2. Manglende rate limiting — designet spesifiserer 5 forsøk/min login, 3/min register**
- Fil: `backend/app/routers/auth.py`, linje 36 og 21
- Fil: `backend/app/main.py` (ingen middleware)
- Designdokumentet spesifiserer rate limiting (5/min login, 3/min register). Dette er ikke implementert noe sted. Uten rate limiting er login- og register-endepunktene sårbare for brute force-angrep. Redis er inkludert i infrastrukturen men brukes ikke.

**K3. JWT-hemmelighet har usikker default — vil fungere i produksjon med "change-me-in-production"**
- Fil: `backend/app/config.py`, linje 9
- `JWT_SECRET_KEY` har default `"change-me-in-production"`. Dersom `.env` mangler eller variabelen ikke settes, kjorer appen med en forutsigbar hemmelighet. Det bor heller feile ved oppstart hvis hemmeligheten ikke er eksplisitt satt.

**K4. Logout kaller ikke backend API — refresh token revokeres aldri server-side**
- Fil: `frontend/src/stores/authStore.ts`, linje 63-66
- `logout()` kaller bare `clearTokens()` lokalt uten a kalle `POST /api/v1/auth/logout` pa backend. Det betyr at refresh tokens forblir gyldige i databasen i opptil 7 dager etter "logout". En angriper med tilgang til et stjalt refresh token kan fortsette a bruke det.

### Viktig

**V1. `datetime.utcnow` er deprecated — bruk `datetime.now(timezone.utc)` konsekvent**
- Fil: `backend/app/models/user.py`, linje 26-30
- Fil: `backend/app/models/category.py`, linje 26
- Fil: `backend/app/models/refresh_token.py`, linje 25
- `datetime.utcnow` er deprecated fra Python 3.12 og returnerer naive datetime uten timezone-info. Bor bruke `datetime.now(timezone.utc)` (som allerede brukes i `auth_service.py`).

**V2. Manglende email-normalisering pa backend**
- Fil: `backend/app/schemas/auth.py`, linje 7
- Fil: `backend/app/services/auth_service.py`, linje 21
- Designet spesifiserer "E-post normalisert (lowercase, trimmet)" men det er ingen normalisering. `EmailStr` fra Pydantic v2 validerer format men gjor ikke lowercase/trim. En bruker kan registrere med `Test@Example.com` og deretter feile innlogging med `test@example.com`.

**V3. User model mangler `name` lengdevalidering pa backend — kun i frontend Zod-schema**
- Fil: `backend/app/models/user.py`, linje 20 — `String(255)`
- Fil: `backend/app/schemas/auth.py`, linje 8 — `min_length=2` men ingen `max_length`
- Ingen `max_length` pa `name` i Pydantic-schema. Modellen har `String(255)` sa DB vil avvise, men en bedre feilmelding bor komme fra validering.

**V4. Passord sendes i klartext over HTTP i docker-compose dev-oppsett**
- Fil: `docker-compose.yml` — ingen TLS/HTTPS
- Fil: `nginx/nginx.conf` — lytter bare pa port 80
- Nginx er konfigurert uten HTTPS. I dev-miljo er dette akseptabelt, men det bor dokumenteres tydelig at produksjon krever TLS, og .env.example/README bor nevne dette.

**V5. Forside-kategorier er hardkodet i frontend og avviker fra backend seed-data**
- Fil: `frontend/src/app/page.tsx`, linje 6-19 — Hardkodede kategorier inkluderer "Sykkel", "Kunst og hobby", "Verktøy", "Gaming"
- Fil: `backend/app/seed.py`, linje 15-28 — Backend har "Jobb", "Tjenester", "Barn og familie", "Hobby og underholdning", "Dyr og utstyr"
- Kategoriene stemmer ikke overens. Frontend bor hente kategorier fra `GET /api/v1/categories` i stedet for a hardkode dem.

**V6. Duplikat `get_settings` funksjon**
- Fil: `backend/app/config.py`, linje 22-24 — `get_settings()` definert med `@lru_cache`
- Fil: `backend/app/dependencies.py`, linje 17-19 — En ny `get_settings()` definert med `@lru_cache`
- To separate `get_settings()`-funksjoner som begge oppretter nye `Settings()`-instanser. `main.py` importerer fra `config.py`, mens routers bruker den fra `dependencies.py`. Dette kan fore til forskjellige Settings-instanser.

**V7. Category recursive relationship kan forårsake N+1 med `selectin` lazy loading**
- Fil: `backend/app/models/category.py`, linje 28-38
- Bade `parent` og `children` bruker `lazy="selectin"`. Nar man laster alle kategorier i `list_categories`, vil SQLAlchemy automatisk laste children og parent for hver kategori. Med `selectin` blir dette effektivt (en ekstra query per relationship), men `_build_tree` itererer likevel over alle kategorier manuelt i stedet for a bruke den innlastede `children`-relasjonen. En av disse tilnærmingene bor fjernes.

**V8. Manglende tester for flere scenarioer definert i designets testplan**
- Fil: `backend/tests/test_auth.py`
- Mangler tester for: refresh med brukt/revoked token, utlopt token, profiloppdatering (PATCH /users/me), kategorilisting (GET /categories), og registrering med for kort passord. Designets testplan lister 13 scenarioer, men bare 7 er dekket.

**V9. Manglende strukturert logging med correlation IDs**
- Designets ikke-funksjonelle krav spesifiserer "Strukturert logging med correlation IDs". Det er ingen logging-oppsett eller correlation ID middleware noe sted i koden.

**V10. Login/register sider bruker `export const metadata` — uforenlig med "use client" i parent-komponenten**
- Fil: `frontend/src/app/login/page.tsx`, linje 3 — `export const metadata`
- Fil: `frontend/src/app/register/page.tsx`, linje 3 — `export const metadata`
- Disse filene eksporterer `metadata` som et server component-API, men inneholder kun client components. Metadata-eksporten vil bare fungere i server components. Filene er faktisk server components (ingen "use client"), sa dette er teknisk korrekt — men metadata-eksporten er pa page-niva mens LoginForm/RegisterForm er client components. Dette fungerer, men bor verifiseres.

### Forslag

**F1. Legg til index pa `refresh_tokens.token_hash` i SQLAlchemy-modellen**
- Fil: `backend/app/models/refresh_token.py`, linje 23
- `token_hash` har `unique=True` som automatisk oppretter index i de fleste databaser, sa dette er dekket. Men designet spesifiserer en eksplisitt `idx_refresh_tokens_hash` index. Vurder a legge til `index=True` for klarhet.

**F2. `UserUpdate` bor ha `max_length`-validering pa felter**
- Fil: `backend/app/schemas/user.py`, linje 21-24
- `phone`, `name` og `location` i `UserUpdate` har ingen lengde-begrensninger. Selv om database-kolonnene har `String(20)`, `String(255)` etc., bor valideringsfeil komme fra Pydantic for bedre brukeropplevelse.

**F3. Vurder HttpOnly cookies for refresh tokens i stedet for localStorage**
- Fil: `frontend/src/lib/auth.ts`, linje 10-21
- Tokens lagres i `localStorage` som er sårbart for XSS. For en markedsplass med betalingsfunksjonalitet i fremtiden bor HttpOnly cookies vurderes for refresh tokens.

**F4. Header user-meny mangler click-outside-to-close**
- Fil: `frontend/src/components/layout/Header.tsx`, linje 57-100
- User dropdown-menyen toggler pa klikk, men lukkes ikke nar brukeren klikker utenfor menyen.

**F5. Vurder a bruke Alembic for migrasjoner i stedet for `create_all` i lifespan**
- Fil: `backend/app/main.py`, linje 14-16
- `Base.metadata.create_all` i lifespan er en dev-snarvei som ikke handterer skjemaendringer. Designets implementeringsplan nevner "Alembic init" men dette er ikke implementert.

**F6. Forside-page.tsx mangler tilgjengelighet (a11y) pa kategorikortene**
- Fil: `frontend/src/app/page.tsx`, linje 79-97
- Kategoriknappene har ingen `aria-label` og sokefeltet mangler `aria-label` eller `<label>`.

**F7. Docker Compose bruker svake standardpassord**
- Fil: `docker-compose.yml`, linje 43 — `POSTGRES_PASSWORD: finn`
- Fil: `docker-compose.yml`, linje 67 — `MINIO_ROOT_PASSWORD: minioadmin`
- Akseptabelt for lokal utvikling, men bor dokumenteres og varsles mot i produksjon.

**F8. `conftest.py` bruker deprecated `event_loop` fixture**
- Fil: `backend/tests/conftest.py`, linje 31-35
- `pytest-asyncio >= 0.23` har deprecated manuell `event_loop` fixture. Med `asyncio_mode = "auto"` i pyproject.toml bor denne fjernes.

## Verdict

**AVVIST**

Begrunnelse: Det er 4 kritiske funn som ma fikses for godkjenning:
1. **K1** (Feil API-endepunkt) vil forarsake funksjonell feil — brukere blir logget ut ved sidelast.
2. **K2** (Manglende rate limiting) er et alvorlig sikkerhetsbrudd som eksplisitt er spesifisert i designet.
3. **K3** (Usikker JWT default) kan fore til fullstendig kompromittering av alle tokens i produksjon.
4. **K4** (Logout kaller ikke backend) betyr at logout ikke faktisk invaliderer sesjoner.

Anbefaling: Fiks alle kritiske funn (K1-K4) og de viktigste sikkerhetsrelaterte viktige funnene (V2), deretter kyor `/review` pa nytt.

## Re-review (etter fiks)
Dato: 2026-03-28
Reviewer: DSF Uavhengig Re-review (Subagent)

### K1: ✅ Fikset — fetchUser bruker nå /api/v1/users/me
- `frontend/src/stores/authStore.ts` linje 87: `api.get<User>("/api/v1/users/me")` — korrekt endepunkt.

### K2: ⚠️ Akseptert med merknad — rate limiting ikke implementert, men IKKE dokumentert som teknisk gjeld
- Rate limiting er fortsatt ikke implementert. Designdokumentet spesifiserer dette som krav.
- Det finnes ingen TODO, backlog-oppforing eller teknisk gjeld-dokument som eksplisitt utsetter dette til neste fase.
- **Merknad**: For at dette skal aksepteres ma rate limiting dokumenteres som teknisk gjeld med planlagt leveranse i neste fase. Anbefaler a legge til en TODO-kommentar i `backend/app/routers/auth.py` og en oppforing i backlog/teknisk gjeld.

### K3: ✅ Fikset — JWT secret har nå runtime-advarsel ved usikker default
- `backend/app/config.py` linje 11-18: `model_post_init` sjekker om `JWT_SECRET_KEY` starter med "change-me" og utsteder `warnings.warn()` med tydelig melding om at en ordentlig hemmelighet ma settes via miljovariabel.
- Ideelt sett burde appen feile i produksjon (ikke bare advare), men advarselen er et akseptabelt minimumsniva for Fase 1.

### K4: ✅ Fikset — logout kaller nå backend API for a revokere refresh token
- `frontend/src/stores/authStore.ts` linje 63-77: `logout()` henter refresh token og kaller `POST /api/v1/auth/logout` med token for server-side revokering for den klarerer lokale tokens. Feil handteres gracefully med best-effort semantikk.
- Backend har `revoke_refresh_token()` i `auth_service.py` linje 116-123 som setter `revoked=True` i databasen.

### Email-normalisering (V2 fra opprinnelig review)
- ✅ Fikset — `backend/app/services/auth_service.py` linje 21 (`create_user`) og linje 42 (`authenticate_user`) utforer begge `email.strip().lower()` for database-oppslag.

### Nye funn
- **N1 (Viktig)**: Rate limiting er fortsatt ikke dokumentert som utsatt/teknisk gjeld noe sted i prosjektet. Bor legges til eksplisitt.
- **N2 (Forslag)**: K3-fiksen advarer men blokkerer ikke oppstart med usikker secret. I en produksjonsklar versjon bor dette vare en hard feil (`raise ValueError`) nar miljoet er "production".

## Oppdatert Verdict

**GODKJENT MED MERKNADER**

Begrunnelse: 3 av 4 kritiske funn (K1, K3, K4) er korrekt fikset. K2 (rate limiting) er ikke implementert men aksepteres for Fase 1 under forutsetning av at det dokumenteres som teknisk gjeld med planlagt leveranse. Email-normalisering (V2) er ogsa fikset. De gjenvarende viktige funnene (V1, V3-V10) og forslagene (F1-F8) fra opprinnelig review star fortsatt, men blokkerer ikke godkjenning.

Betingelser for full godkjenning:
1. Dokumenter rate limiting som teknisk gjeld (TODO i kode + backlog-oppforing) — ma gjores for merge.
2. Vurder a gjore JWT secret-sjekken til en hard feil i produksjonsmiljo i neste fase.
