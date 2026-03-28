# Code Review: FINN.no Fase 5 — PWA
Dato: 2026-03-28
Reviewer: DSF Automated Review

## Sammendrag

Fase 5 legger til Progressive Web App-funksjonalitet med service worker, offline-stoette, installerbarhet, og PWA-ikoner. Reviewen dekker 8 nye/endrede filer (sw.js, offline.html, manifest.json, 3 PWA-komponenter, layout.tsx, og 3 ikoner).

## Sjekkliste

### Korrekthet
- [x] Implementerer koden det designet spesifiserer? Ja, alle Must have og Should have er implementert.
- [x] Haandteres alle edge cases? SW hopper over non-GET, WebSocket, og non-HTTP requests.
- [x] Er feilhaandtering tilstrekkelig? cacheFirst/networkFirst/staleWhileRevalidate har alle catch-blokker.
- [x] Fungerer koden korrekt med eksisterende kode? layout.tsx integrerer PWA-komponenter uten aa bryte eksisterende Header/BottomNav.

### Auth-guards i globale komponenter (LEARNING 013)
- [x] Har API-kall i layout/Header/BottomNav `enabled: !!token` guard? PWA-komponentene gjoer INGEN API-kall. ServiceWorkerRegistration bruker kun navigator.serviceWorker. InstallPrompt bruker kun beforeinstallprompt-event og localStorage. OfflineIndicator bruker kun navigator.onLine og window online/offline events.
- [x] Er det noen `window.location.href` redirects i API-interceptors? Nei, ingen redirects i PWA-kode.
- [x] Kan uautentiserte brukere laste forsiden uten 401-feil? Ja, PWA-komponentene er fullstendig auth-uavhengige.

### Sikkerhet — Service Worker spesifikk
- [x] Cacher SW auth-tokens? NEI — kun GET-requests caches (linje 82), og POST/PATCH (login, register) hoppes over. API-cache lagrer kun respons-data fra GET-kall, ikke auth-headere.
- [x] Cache-invalidering: Versjonerte cache-names (shell-v1, api-v1, images-v1), activate-event sletter gamle cacher som ikke er i VALID_CACHES.
- [x] Cross-origin: SW scope er begrenset til appen, url.protocol-sjekk blokkerer non-HTTP.

### Sikkerhet (OWASP)
- [x] Ingen brukerinput behandles i PWA-komponentene
- [x] Ingen sensitive data eksponeres
- [x] offline.html bruker kun inline CSS, ingen external dependencies
- [x] manifest.json inneholder kun offentlig metadata

### Kvalitet
- [x] Koden er lesbar og foelger eksisterende konvensjoner ("use client", lucide-react ikoner, framer-motion animasjoner)
- [x] Ingen duplisering — tre separate komponenter med klare ansvarsomraader
- [x] Naming er konsistent (norsk UI-tekst, engelsk kode)

### Testing
- [ ] Ingen automatiserte tester for PWA-komponentene. Designdokumentet spesifiserer at PWA-testing er primaert manuell (service workers fungerer ikke i test-rammeverk). Akseptabelt for denne typen funksjonalitet.

### Krav-sporbarhet (LEARNING 002)
- [x] Must have: SW med differensierte caching-strategier, offline fallback, ikoner, manifest, app shell caching, API-data caching, meta-tags
- [x] Should have: Install prompt, bilde-caching (stale-while-revalidate), offline-indikator
- [x] Won't have dokumentert i design: Push-varsler, full offline CRUD

## Funn

### Kritisk
Ingen.

### Viktig
Ingen.

### Forslag
1. **F1: SW cache size limit** — API-cachen (CACHE_API) og bilde-cachen (CACHE_IMAGES) har ingen stoerrelsesbegrensning. Over tid kan disse vokse ubegrenset. Vurder aa implementere LRU-lignende opprydding (f.eks. maks 50 API-responser, maks 100 bilder).

2. **F2: SW update notification** — Naar en ny SW-versjon er tilgjengelig (CACHE_VERSION endres), faar brukeren ingen varsel. Vurder aa lytte paa `controllerchange`-event og vise "Ny versjon tilgjengelig — oppdater"-melding.

## Verdict
GODKJENT

Ingen kritiske eller viktige funn. To forslag for fremtidig forbedring (cache-stoerrelse og update-notifikasjon). Auth-guard-sjekken (LEARNING 013) er ren — ingen PWA-komponenter gjoer auth-avhengige kall. Service worker cacher aldri sensitive data.
