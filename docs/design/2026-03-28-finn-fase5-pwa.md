# Design: FINN.no Klone — Fase 5 (PWA)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase5-intake.md)

## Sammendrag

Gjøre Markedsplass til en fullverdig Progressive Web App med service worker, smart caching, offline-støtte, installerbarhet og PWA-ikoner. Mål: Lighthouse PWA-score ≥90.

## Bakgrunn og motivasjon

PWA gir native app-følelse uten app store: installerbar, offline-kapabel, og rask. Brukere kan legge til appen på hjemskjermen og bruke den selv uten nett.

## Krav

### Must have
- Service worker med differensierte caching-strategier
- Offline fallback-side ("Du er offline")
- PWA-ikoner (192x192, 512x512, maskable)
- Komplett manifest.json
- App Shell caching (CSS, JS, fonts cache-first)
- API-data caching (network-first med fallback)
- Meta-tags for iOS og Android

### Should have
- Install prompt ("Legg til på hjemskjermen")
- Bilde-caching (stale-while-revalidate)
- Offline-indikator i UI

### Could have
- Background sync for meldinger sendt offline
- Periodic sync for oppdateringer

### Won't have (Fase 5)
- Push-varsler (krever backend push-infrastruktur)
- Full offline CRUD

## Arkitektur

### Service Worker-strategi

```
┌──────────────────────────────────────────┐
│           SERVICE WORKER                  │
│                                           │
│  Cache-first (App Shell):                │
│  ├── /_next/static/**  (JS, CSS)         │
│  ├── /fonts/**                            │
│  └── /icons/**                            │
│                                           │
│  Network-first (API):                    │
│  ├── /api/v1/ads/**                      │
│  ├── /api/v1/categories/**               │
│  └── /api/v1/search/**                   │
│  → Ved nettverksfeil: vis cachet data    │
│                                           │
│  Stale-while-revalidate (Bilder):        │
│  ├── /uploads/**                          │
│  └── Placeholder-bilder                   │
│                                           │
│  Offline fallback:                        │
│  └── /offline → cached HTML-side          │
└──────────────────────────────────────────┘
```

### Komponentdesign — Frontend
```
frontend/
├── public/
│   ├── sw.js              → Service worker (håndskrevet, ikke Workbox)
│   ├── offline.html       → Offline fallback-side
│   ├── manifest.json      → Oppdatert med alle ikoner
│   └── icons/
│       ├── icon-192.png   → Standard ikon
│       ├── icon-512.png   → Stor ikon
│       └── icon-maskable.png → Maskable ikon
│
├── src/
│   ├── app/
│   │   └── layout.tsx     → Oppdatert med SW-registrering og meta-tags
│   │
│   ├── components/
│   │   ├── pwa/
│   │   │   ├── InstallPrompt.tsx  → "Legg til på hjemskjermen" banner
│   │   │   ├── OfflineIndicator.tsx → "Du er offline" varsel
│   │   │   └── ServiceWorkerRegistration.tsx → SW registrering
│   │   └── layout/
│   │       └── Header.tsx → Inkluderer OfflineIndicator
```

### Service Worker (sw.js)

```javascript
// Cache names
const CACHE_SHELL = 'shell-v1';
const CACHE_API = 'api-v1';
const CACHE_IMAGES = 'images-v1';

// Install: precache app shell + offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) =>
      cache.addAll(['/offline.html', '/manifest.json'])
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => !VALID_CACHES.includes(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: strategy per request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/_next/static')) {
    // App Shell: cache-first
    event.respondWith(cacheFirst(event.request, CACHE_SHELL));
  } else if (url.pathname.startsWith('/api/')) {
    // API: network-first with cache fallback
    event.respondWith(networkFirst(event.request, CACHE_API));
  } else if (url.pathname.startsWith('/uploads/') || isImageRequest(event.request)) {
    // Images: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(event.request, CACHE_IMAGES));
  } else if (event.request.mode === 'navigate') {
    // Pages: network-first, fallback to offline.html
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
  }
});
```

### Offline fallback-side (offline.html)

Enkel statisk HTML med:
- Markedsplass-logo
- "Du er offline" melding
- "Prøv igjen"-knapp (location.reload())
- Inline CSS (ingen external dependencies)
- Matches app-designet (blå, clean)

### PWA-ikoner

Generere SVG-baserte PNG-ikoner med et enkelt "M" (Markedsplass) på blå bakgrunn:
- 192x192 — standard ikon
- 512x512 — splash screen
- 512x512 maskable — med safe zone padding

### Install Prompt

```typescript
// Fanger 'beforeinstallprompt' event
// Viser en uaufdringende banner nederst med:
// "Legg til Markedsplass på hjemskjermen" + [Installer] + [Senere]
// Skjuler seg etter installasjon eller dismiss
// Husker dismiss i localStorage (vis ikke igjen på 7 dager)
```

### Meta-tags (layout.tsx)

```html
<!-- PWA -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563eb" />
<meta name="mobile-web-app-capable" content="yes" />

<!-- iOS -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Markedsplass" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />

<!-- Windows -->
<meta name="msapplication-TileImage" content="/icons/icon-192.png" />
<meta name="msapplication-TileColor" content="#2563eb" />
```

## Sikkerhetsvurdering

- **Service Worker scope**: Begrenset til appen, ingen cross-origin caching
- **API-cache**: Kun GET-requests caches, ingen auth-tokens i cache
- **Cache-invalidering**: Versjonerte cache-names, gamle slettes ved activate

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | SW registreres ved første besøk | Manuell | console: "SW registered" |
| 2 | App Shell caches etter første load | Manuell | DevTools → Application → Cache |
| 3 | Offline: forside viser cachet data | Manuell | Annonser synlige offline |
| 4 | Offline: navigasjon viser offline.html | Manuell | Offline-side med retry-knapp |
| 5 | manifest.json er korrekt | Build | Lighthouse PWA audit |
| 6 | Ikoner laster i manifest | Manuell | DevTools → Application → Manifest |
| 7 | Install prompt vises | Manuell | Banner på mobil/desktop |
| 8 | Offline-indikator vises | Manuell | Gul varsel ved nettverkstap |
| 9 | Frontend build OK | Build | npm run build passerer |

Note: PWA-testing er primært manuell — service workers fungerer ikke i test-rammeverk.

## Implementeringsplan

1. PWA-ikoner (generert med canvas/SVG script)
2. Oppdater manifest.json
3. Service Worker (sw.js) med alle caching-strategier
4. Offline fallback-side (offline.html)
5. ServiceWorkerRegistration komponent
6. InstallPrompt komponent
7. OfflineIndicator komponent
8. Oppdater layout.tsx med SW-registrering og meta-tags
9. Oppdater Header med OfflineIndicator
10. Verifiser build

### Avhengighetsgraf og parallellisering

```
Lag 1 (ingen avhengigheter):
  ├── [1] PWA-ikoner
  ├── [4] offline.html
  └── [6] InstallPrompt komponent

Lag 2:
  ├── [2] manifest.json          ← [1]
  ├── [3] Service Worker          ← [4]
  └── [7] OfflineIndicator        (ingen)

Lag 3:
  ├── [5] SW-registrering         ← [3]
  └── [9] Header + OfflineIndicator ← [7]

Lag 4:
  ├── [8] layout.tsx              ← [2, 5, 6]
  └── [10] Verifiser build        ← alle
```

**Parallellisering:**
- Lag 1: Ikoner [1], offline.html [4], og InstallPrompt [6] samtidig
- Lag 2: manifest [2], SW [3], og OfflineIndicator [7] samtidig

## Referanser
- Spesifikasjon: [finn.md](../../finn.md) PWA-krav
- MDN: Service Worker API
- web.dev: PWA Checklist
