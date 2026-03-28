# Design: FINN.no Klone — Fase 3 (Søk og oppdagelse)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase3-intake.md)

## Sammendrag

Bygge søk og oppdagelse: fulltekstsøk med ILIKE (portabelt for SQLite tester), autocomplete med debounce, avansert filtrering, og en komplett søkeresultatside med URL-baserte filtre for delbare søkelenker.

## Bakgrunn og motivasjon

Med annonser på plass (Fase 2) trenger brukerne å finne det de leter etter. Søk er kjernefunksjonaliteten i en markedsplass — uten det er appen bare en liste.

## Krav

### Must have
- Fulltekstsøk i tittel og beskrivelse
- Filtrering: kategori, pris (min/max), tilstand, sted
- Sortering: nyeste, pris lav→høy, pris høy→lav
- Paginering i søkeresultater
- Autocomplete/suggest med min 2 tegn og debounce
- Søkeresultatside `/search` med filtre og AdGrid
- Header SearchBar koblet til ekte søk
- URL query params synkronisert med filtre (delbare søkelenker)

### Should have
- Kategori-underkategorier i seed (tech-debt)
- Sted/location-filter i søk
- Søkeresultat-telling ("42 annonser funnet")
- Tom-tilstand med illustrasjon ("Ingen treff")

### Could have
- Søkehistorikk (lokalt i localStorage)
- Highlight søkeord i resultater

### Won't have (Fase 3)
- Elasticsearch/fulltekst-indeks (bruker ILIKE for nå)
- Geolokasjon/kart-basert søk
- Lagrede søk med varsler (Fase 7)

## Arkitektur

### Komponentdesign — Backend (nye/endrede filer)
```
app/
├── services/
│   └── search_service.py    → Søk, filtrering, autocomplete
│
├── routers/
│   └── search.py            → /api/v1/search, /api/v1/search/suggest
│
├── schemas/
│   └── search.py            → SearchParams, SuggestResponse
│
└── seed.py                  → Utvidet med underkategorier
```

### Komponentdesign — Frontend (nye/endrede filer)
```
src/
├── hooks/
│   └── useSearch.ts         → React Query hooks for search API
│
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx    → Autocomplete-enabled søkefelt (erstatter Header-søk)
│   │   ├── FilterPanel.tsx  → Utvidet med sted-filter
│   │   └── SearchResults.tsx → Resultat-header med telling
│   └── common/
│       └── EmptyState.tsx   → "Ingen treff" komponent
│
├── app/
│   └── search/
│       └── page.tsx         → Søkeresultatside
│
└── components/layout/
    └── Header.tsx           → Oppdatert med ekte SearchBar
```

### API-kontrakter

```
GET /api/v1/search?q=<tekst>&category=<slug>&location=<str>&price_min=<int>&price_max=<int>&condition=<enum>&sort=<newest|price_asc|price_desc>&page=<int>&per_page=<int>
Response: {
  "items": [AdResponse],
  "total": int,
  "page": int,
  "per_page": int,
  "pages": int,
  "query": "str"   // Echo back for frontend sync
}

GET /api/v1/search/suggest?q=<tekst>&limit=<int, default 5>
Response: {
  "suggestions": [
    {"text": "iPhone 15", "category": "Elektronikk", "count": 12},
    {"text": "iPhone 14 Pro", "category": "Elektronikk", "count": 8}
  ]
}
```

### Søkestrategi

```python
# ILIKE-basert søk (portabelt, fungerer med SQLite i tester)
# Søker i både title og description
# Splitter query i ord og krever at alle matcher (AND)

query_words = search_query.strip().split()
for word in query_words:
    pattern = f"%{word}%"
    stmt = stmt.where(
        or_(
            Ad.title.ilike(pattern),
            Ad.description.ilike(pattern),
        )
    )
```

### Autocomplete-strategi

```python
# Distinct titler som matcher, gruppert med kategori og antall
# Maks 5-10 forslag
# Bruker ILIKE prefix-match for raskere resultater

pattern = f"{query}%"  # Prefix match for speed
# Fallback til %query% hvis for få resultater
```

### URL Query Params-synk (frontend)

```typescript
// useSearchParams() fra Next.js
// Alle filtre synkroniseres til URL: /search?q=iphone&category=elektronikk&sort=price_asc
// Ved sidelast: les filtre fra URL og populer FilterPanel
// Ved filterendring: oppdater URL uten full page reload
// Resultat: delbare søkelenker
```

## Sikkerhetsvurdering

- **Input-sanitering**: Søkestreng trimmes og limiteres til 200 tegn
- **SQL injection**: ILIKE med parameterbinding via SQLAlchemy (trygt)
- **Rate limiting**: Søk har ingen spesifikk rate limit (generell bruk), men suggest har 10/min
- **DoS**: per_page maks 50, page maks 100

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | Søk med treff i tittel | Integration | 200, relevante annonser |
| 2 | Søk med treff i beskrivelse | Integration | 200, relevante annonser |
| 3 | Søk uten treff | Integration | 200, tom liste |
| 4 | Søk med kategori-filter | Integration | 200, kun annonser i kategori |
| 5 | Søk med pris-range | Integration | 200, kun innenfor range |
| 6 | Søk med tilstand-filter | Integration | 200, kun med riktig tilstand |
| 7 | Søk med sted-filter | Integration | 200, kun med matchende sted |
| 8 | Søk med kombinerte filtre | Integration | 200, alle filtre anvendt |
| 9 | Søk med sortering (pris asc) | Integration | 200, sortert stigende |
| 10 | Søk med paginering | Integration | 200, korrekt page/total |
| 11 | Suggest med prefix-match | Integration | 200, relevante forslag |
| 12 | Suggest med for kort query (<2 tegn) | Integration | 200, tom liste |
| 13 | Suggest med limit-parameter | Integration | 200, maks N forslag |
| 14 | Tom søkestreng returnerer alle aktive | Integration | 200, paginert liste |
| 15 | Søk viser ikke DRAFT/SOLD/EXPIRED | Integration | 200, kun ACTIVE |

## Implementeringsplan

1. Backend: Search schemas
2. Backend: Search service (søk + autocomplete)
3. Backend: Search router
4. Backend: Utvid seed med underkategorier
5. Backend: Test-stubs fra testplan (PE3)
6. Backend: Test-implementasjon
7. Frontend: useSearch hook
8. Frontend: SearchBar med autocomplete
9. Frontend: EmptyState komponent
10. Frontend: SearchResults side med URL-synk
11. Frontend: Oppdater Header med ekte SearchBar
12. Frontend: Utvid FilterPanel med sted

### Avhengighetsgraf og parallellisering

```
Lag 1 (ingen avhengigheter — kan kjøres parallelt):
  ├── [1] Search schemas
  ├── [4] Seed med underkategorier
  └── [9] EmptyState komponent

Lag 2 (avhenger av Lag 1):
  ├── [2] Search service          ← [1]
  └── [7] useSearch hook          ← [1] (API-kontrakt)

Lag 3 (avhenger av Lag 2):
  ├── [3] Search router           ← [1, 2]
  ├── [5] Test-stubs              ← [1, 2, 3]
  ├── [8] SearchBar m/autocomplete ← [7]
  └── [12] FilterPanel med sted   ← [7]

Lag 4 (avhenger av Lag 3):
  ├── [6] Test-implementasjon     ← [3, 4, 5]
  ├── [10] SearchResults side     ← [7, 9]
  └── [11] Header med SearchBar   ← [8]
```

**Parallelliseringsmuligheter:**
- Lag 1: [1], [4], [9] kan kjøres samtidig
- Lag 2: Backend service [2] og frontend hook [7] kan kjøres parallelt
- Lag 3: [8] og [12] kan kjøres parallelt; [3] og [5] sekvensielt
- Lag 4: [6], [10], [11] kan kjøres samtidig

## Referanser
- Spesifikasjon: [finn.md](../../finn.md)
- Fase 2 design: [Fase 2 kjerneprodukt](2026-03-28-finn-fase2-kjerneprodukt.md)
- Tech-debt: [tech-debt.md](../../.dsf/logs/tech-debt.md)
