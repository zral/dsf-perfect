# Design: FINN.no Klone — Fase 6 (Polish)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase6-intake.md)

## Sammendrag

Polere brukeropplevelsen med skeleton loading, infinite scroll, SEO meta-tags, forbedrede animasjoner, toast notifications, feilhåndtering, 404-side, bildeplassholdere og lignende annonser.

## Krav

### Must have
- Skeleton loading for AdGrid, AdDetail, ConversationList
- Infinite scroll på søk og kategori-sider
- SEO: dynamiske meta-tags (title, description, OG) per annonse/kategori
- Toast notifications for brukerhandlinger
- Custom 404-side
- Bilde-placeholder for annonser uten bilder

### Should have
- Lignende annonser (backend + frontend) — tech-debt
- Error boundaries
- Forbedrede animasjoner (stagger, page transitions)

### Won't have
- Søkehistorikk, highlight (utsettes)

## Arkitektur

### Backend (kun lignende annonser)

```
app/services/ad_service.py  → get_similar_ads(db, ad_id, limit=6)
app/routers/ads.py          → GET /api/v1/ads/{id}/similar
```

**Lignende annonser-logikk**: Finn annonser i samme kategori, ekskluder gjeldende, sorter etter nyeste, maks 6.

### Frontend (nye/endrede filer)

```
src/
├── components/
│   ├── common/
│   │   ├── Skeleton.tsx         → Gjenbrukbar skeleton-komponent
│   │   ├── Toast.tsx            → Toast notification system
│   │   ├── InfiniteScroll.tsx   → Intersection Observer wrapper
│   │   └── ErrorBoundary.tsx    → Feilgrense med fallback-UI
│   ├── ad/
│   │   ├── AdGrid.tsx           → Oppdatert med skeleton og infinite scroll
│   │   ├── AdDetail.tsx         → Oppdatert med skeleton og lignende annonser
│   │   ├── AdCardSkeleton.tsx   → Skeleton for enkeltkort
│   │   └── SimilarAds.tsx       → Lignende annonser-seksjon
│   └── messages/
│       └── ConversationList.tsx → Oppdatert med skeleton
│
├── app/
│   ├── not-found.tsx            → Custom 404-side
│   ├── ad/[id]/page.tsx         → SEO meta-tags + lignende
│   ├── category/[slug]/page.tsx → SEO meta-tags + infinite scroll
│   └── search/                  → Infinite scroll
│
├── hooks/
│   └── useAds.ts                → Legg til useSimilarAds, useInfiniteAds
│
├── lib/
│   └── toast.ts                 → Toast context/store
```

### SEO-strategi

Annonsevisning (`/ad/[id]`):
```html
<title>iPhone 15 Pro Max — 12 999 kr | Markedsplass</title>
<meta name="description" content="Selger min iPhone 15 Pro Max... Elektronikk i Oslo" />
<meta property="og:title" content="iPhone 15 Pro Max — 12 999 kr" />
<meta property="og:description" content="Selger min iPhone 15 Pro Max..." />
<meta property="og:image" content="thumbnail_url" />
```

Kategoriside (`/category/[slug]`):
```html
<title>Elektronikk — Markedsplass</title>
<meta name="description" content="Kjøp og selg elektronikk. 15 annonser tilgjengelig." />
```

### Toast-system

```typescript
// Zustand store for toasts
type Toast = { id: string; message: string; type: 'success' | 'error' | 'info'; }
// Auto-dismiss etter 3s
// Stacker nederst til høyre (desktop) / øverst (mobil)
// framer-motion slide + fade
```

### Infinite Scroll

```typescript
// IntersectionObserver som trigger fetchNextPage
// Bruker useInfiniteQuery fra TanStack Query
// Laster neste side når siste element er synlig
// "Laster flere..." spinner nederst
```

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | Lignende annonser returnerer maks 6 fra samme kategori | Integration | 200, ≤6 annonser |
| 2 | Lignende annonser ekskluderer gjeldende annonse | Integration | Gjeldende ID ikke i resultat |
| 3 | Frontend build OK | Build | Alle sider bygger |

## Implementeringsplan

1. Backend: lignende annonser service + router
2. Backend: test for lignende annonser
3. Frontend: Skeleton, Toast, InfiniteScroll, ErrorBoundary komponenter
4. Frontend: AdCardSkeleton + oppdater AdGrid
5. Frontend: SimilarAds + oppdater AdDetail
6. Frontend: Infinite scroll i søk og kategori
7. Frontend: SEO meta-tags for annonse og kategori
8. Frontend: Custom 404-side
9. Frontend: Bilde-placeholder
10. Frontend: Toast integrert i handlinger

### Avhengighetsgraf og parallellisering

```
Lag 1 (ingen avhengigheter):
  ├── [1] Backend: lignende annonser
  ├── [3] Frontend: common komponenter (Skeleton, Toast, InfiniteScroll, ErrorBoundary)
  ├── [8] Frontend: 404-side
  └── [9] Frontend: Bilde-placeholder

Lag 2:
  ├── [2] Backend: test               ← [1]
  ├── [4] AdCardSkeleton + AdGrid     ← [3]
  ├── [5] SimilarAds + AdDetail       ← [1, 3]
  └── [6] Infinite scroll i sider     ← [3]

Lag 3:
  ├── [7] SEO meta-tags               ← [5]
  └── [10] Toast i handlinger         ← [3]
```

**Parallellisering:**
- Lag 1: Alle 4 oppgaver samtidig
- Lag 2: Alle 4 samtidig (etter Lag 1)

## Referanser
- finn.md: Fase 6 spesifikasjon
- Tech-debt: lignende annonser
