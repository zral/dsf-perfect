# Code Review: FINN Fase 6 — Polish
Dato: 2026-03-28
Reviewer: DSF Automated Review

## Sammendrag

Fase 6 leverer polish-funksjonalitet: skeleton loading, infinite scroll, SEO meta-tags, toast notifications, error boundary, 404-side, bilde-placeholder, og lignende annonser (backend + frontend). Reviewen dekker 15+ nye/endrede filer pa tvers av backend og frontend.

## Sjekkliste

### Korrekthet
- [x] Implementerer koden det designet spesifiserer? Alle Must have og Should have er implementert.
- [x] Handteres alle edge cases? SimilarAds viser null hvis tom liste, InfiniteScroll disconnecter observer, ErrorBoundary har reset.
- [x] Er feilhandtering tilstrekkelig? get_similar_ads kaster 404 for ukjent ad, frontend har error state.
- [x] Fungerer koden korrekt med eksisterende kode? AdGrid, AdDetail oppdatert med nye props.

### Integrasjon (LEARNING 001, LEARNING 007)
- [x] Frontend API-kall matcher backend-endepunkter: `/api/v1/ads/${adId}/similar` matcher GET `/{ad_id}/similar`.
- [x] HTTP-metoder korrekte: GET for similar ads.
- [x] Response-format matcher: backend returnerer `list[AdResponse]`, frontend forventer `Ad[]`.
- [x] **Datatype-match**: ad_id er UUID i backend, string i frontend — Axios sender string, FastAPI parser til UUID. OK.
- [x] Ingen FormData-kall i denne fasen.

### Krav-sporbarhet (LEARNING 002)
- [x] Must have: Skeleton loading (AdGrid, AdDetail, ConversationList?) — AdGrid og AdDetail har skeleton. ConversationList ikke eksplisitt oppdatert i denne reviewen, men eksisterte allerede.
- [x] Must have: Infinite scroll — implementert i kategori og sok via useInfiniteQuery.
- [x] Must have: SEO meta-tags — dynamiske title/description/OG for ad/[id] og category/[slug].
- [x] Must have: Toast notifications — Zustand store + ToastContainer i layout.
- [x] Must have: Custom 404-side — not-found.tsx med god UX.
- [x] Must have: Bilde-placeholder — ImagePlaceholder brukt i AdCard.
- [x] Should have: Lignende annonser — backend get_similar_ads + frontend SimilarAds i AdDetail.
- [x] Should have: Error boundaries — ErrorBoundary wraps main content i layout.
- [x] Won't have: Sokehistorikk, highlight — ikke implementert (korrekt).

### Auth-guards i globale komponenter (LEARNING 013)
- [x] ToastContainer i layout.tsx gjoer ingen API-kall. OK.
- [x] ErrorBoundary i layout.tsx gjoer ingen API-kall. OK.
- [x] Ingen `window.location.href` redirects i interceptors. OK.
- [x] useSimilarAds har `enabled: !!adId` guard. OK.
- [x] Uautentiserte brukere kan laste forsiden uten 401-feil. OK.

### Sikkerhet
- [x] Ingen injection-risiko. Similar ads bruker UUID-validering.
- [x] Similar endpoint er offentlig (ingen auth krevd) — korrekt for offentlige annonser.
- [x] Ingen sensitive data i SEO meta-tags.

### Kvalitet
- [x] Koden er lesbar og folger eksisterende konvensjoner.
- [x] Ingen duplisering utover categoryNames-map (duplisert mellom page.tsx og CategoryPageClient.tsx).
- [x] Naming er konsistent og beskrivende.
- [x] Ingen deprecated API-er.

### Ytelse
- [x] get_similar_ads: To queries (hent ad + hent similar). Akseptabelt med LIMIT 6.
- [x] InfiniteScroll bruker IntersectionObserver med 200px rootMargin. Effektivt.
- [x] Ingen N+1 problemer — _ad_query() bruker selectinload.

### Testing
- [x] Lignende annonser har 2 tester (same category, excludes current).
- [x] 61 backend-tester, 100% bestaende.
- [x] Frontend bygger feilfritt.

## Funn

### Kritisk
Ingen.

### Viktig
Ingen.

### Forslag

**F1: categoryNames duplisert.**
CategoryPageClient.tsx og page.tsx definerer begge `categoryNames`-map identisk. Kan flyttes til en delt fil.
Referanse: frontend/src/app/category/[slug]/page.tsx linje 4-17 og CategoryPageClient.tsx linje 11-24.

**F2: Toast auto-dismiss bruker setTimeout uten cleanup.**
toastStore.ts bruker `setTimeout` for auto-dismiss, men hvis store unmountes (uvanlig for Zustand) finnes ingen cleanup. Lav risiko men kan lage edge case ved HMR.

## Verdict
GODKJENT
