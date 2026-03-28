# Code Review: Fase 3 — Søk og oppdagelse
Dato: 2026-03-28
Reviewer: DSF Automated Review

## Sammendrag

Fase 3 implementerer fulltekstsøk, autocomplete, filtrering, sortering og paginering. Koden er gjennomgående solid og de to kritiske læringene fra tidligere faser (LEARNING 001: endepunkt-mismatch, LEARNING 007: datatype-mismatch) er begge unngått. Alle Must-have-krav fra design er implementert. Integrasjonen mellom frontend og backend er korrekt. Det er funnet ett viktig funn og to forslag, men ingen kritiske funn.

Mål for Fase 3: 0 kritiske funn — **INNFRIDD**.

---

## Funn

### Kritisk
Ingen.

---

### Viktig

#### V1: `suggest`-endepunkt mangler validering av `limit`-parameter (DoS-risiko)

**Fil**: `backend/app/routers/search.py` linje 50, `backend/app/services/search_service.py` linje 92

Designdokumentet spesifiserer at suggest-endepunktet skal ha rate limiting (10/min), dokumentert som tech-debt. Men det mangler også validering av selve `limit`-parameteren. En klient kan kalle `/api/v1/search/suggest?q=te&limit=100000` og tvinge databasen til å returnere et vilkårlig antall rader. SQLAlchemy sender dette direkte til `.limit(limit)`.

```python
# Router — ingen max-validering:
limit: int = 5,  # kan settes til hva som helst

# Service — bruker verdien direkte:
.limit(limit)
```

**Anbefaling**: Legg til `le=20` (eller tilsvarende) på `limit`-parameteren i routeren:
```python
limit: int = Query(default=5, ge=1, le=20),
```

Alvorlighetsgrad: Viktig (ikke kritisk da SQLite/Postgres har egne grenser, og rate limiting er planlagt i Fase 4, men bør fikses nå).

---

#### V2: Redundant/død kode i `handleFilterChange` — `q`-feltet evaluerer alltid til `params.q`

**Fil**: `frontend/src/app/search/SearchPageContent.tsx` linje 101–103

```typescript
q: newFilters.sort === "newest" && !newFilters.price_min && !newFilters.price_max
   && newFilters.conditions.length === 0 && !newFilters.location
  ? params.q
  : params.q,  // begge grener returnerer params.q
```

Den ternære operatoren er død kode: begge grener returnerer identisk verdi `params.q`. Søkestrengen `q` bevares alltid ved filterendringer, men denne logikken er forvirrende og indikerer en inkomplett refaktorering (muligens tiltenkt å fjerne `q` ved reset av alle filtre).

**Anbefaling**: Forenkle til `q: params.q` og dokumenter intensjonen — eller endre til å fjerne `q` fra URL når alle filtre er nullstilt.

---

### Forslag

#### F1: `SearchPageContent` — kun første betingelse sendes ved multiple checkboxes

**Fil**: `frontend/src/app/search/SearchPageContent.tsx` linje 96–97

`FilterPanel` tillater brukeren å krysse av flere tilstander (checkboxes), men `handleFilterChange` sender kun `conditions[0]` til URL og backend:

```typescript
condition:
  newFilters.conditions.length > 0
    ? newFilters.conditions[0]  // kun første valgte tilstand
    : undefined,
```

Backend støtter heller ikke multiple `condition`-verdier. Dette er en bevisst arkitekturavgjørelse (singel condition), men UI-et antyder at multiple valg er mulig (checkboxes fremfor radio buttons). Vurder å bruke radio buttons i FilterPanel, eller dokumenter begrensningen.

---

#### F2: Trailing slash-inkonsistens mellom frontend og tester

**Frontend** (`frontend/src/hooks/useSearch.ts` linje 54): kaller `/api/v1/search` (uten trailing slash).

**Backend-tester** (`backend/tests/test_search.py`, samtlige tester): kaller `/api/v1/search/` (med trailing slash).

FastAPI håndterer dette transparent med `redirect_slashes=True` (default), men inkonsistensen kan skjule en faktisk URL-mismatch i fremtiden. Anbefaler å standardisere — enten begge med eller begge uten trailing slash.

---

## Integrasjons-sjekkliste (LEARNING 001, LEARNING 007)

| Sjekk | Resultat |
|-------|---------|
| Frontend API-kall matcher backend-endepunkter | OK — `/api/v1/search` og `/api/v1/search/suggest` fins begge |
| HTTP-metoder korrekte | OK — kun GET brukes |
| Request-format: ingen manuell Content-Type | OK — ingen `Content-Type`-header satt manuelt |
| Datatype-match: `category` sendes som slug (string) | OK — backend forventer slug, frontend sender slug |
| Datatype-match: `price_min`/`price_max` er tall | OK — frontend konverterer til `String()` for URL, backend mottar som `int` |
| Datatype-match: `condition` er enum-streng | OK — `AdCondition` enum er identisk i frontend og backend |
| Datatype-match: `sort` er gyldig enum | OK — frontend-typen `"newest" \| "price_asc" \| "price_desc"` matcher backend |
| Response: `SearchResponse extends AdListResponse + query: string` | OK — backend returnerer korrekte felter |
| Suggest response: `{ suggestions: [{text, category, count}] }` | OK — matcher SuggestResponse schema |

---

## Krav-sporbarhet (LEARNING 002)

### Must have — alle implementert
- Fulltekstsøk i tittel og beskrivelse: **JA** (search_service.py, ILIKE AND-matching)
- Filtrering: kategori, pris, tilstand, sted: **JA** (alle fire implementert)
- Sortering: nyeste, pris lav/høy: **JA**
- Paginering: **JA**
- Autocomplete med debounce (min 2 tegn): **JA** (useSuggest med 300ms debounce)
- Søkeresultatside `/search`: **JA**
- Header SearchBar koblet til ekte søk: **JA**
- URL query params synkronisert: **JA**

### Should have
- Kategori-underkategorier i seed: **JA** (lukket tech-debt)
- Sted/location-filter: **JA**
- Søkeresultat-telling: **JA** (`${data.total} annonser funnet for «${params.q}»`)
- Tom-tilstand med illustrasjon: **JA** (EmptyState.tsx med PackageOpen-ikon)

### Utsatte krav (dokumentert i tech-debt.md)
- Rate limiting på suggest (10/min): dokumentert, planlagt Fase 4
- Elasticsearch/fulltekst-indeks: dokumentert, planlagt Fase 5+
- Søkehistorikk (localStorage): dokumentert, planlagt Fase 4
- Highlight søkeord: dokumentert, planlagt Fase 4

Krav-sporbarhet: **GODKJENT** — alle utsettelser er dokumentert.

---

## Sikkerhetsvurdering

| Område | Status | Kommentar |
|--------|--------|-----------|
| SQL injection via ILIKE | OK | SQLAlchemy parameteriserer alle verdier — `ilike(f"%{word}%")` er trygt |
| Input-sanitering (søkestreng) | OK | `max_length=200` på `q`-feltet i SearchParams |
| DoS: `per_page` maks 50 | OK | `le=50` på per_page |
| DoS: `page` maks | Mangel | Ingen øvre grense på `page` (design sa maks 100) — lavrisiko |
| DoS: `suggest limit` maks | Mangel | Ingen øvre grense — se **V1** |
| Rate limiting suggest | Utsatt | Dokumentert i tech-debt, planlagt Fase 4 |
| Condition-enum validering | OK | Direkte string-sammenligning er trygt, ugyldig condition gir bare 0 treff |

---

## Testing

Alle 15 testscenarier fra testplanen er implementert i `backend/tests/test_search.py`:
- Ingen `pytest.skip` gjenværende
- Edge cases dekket: tom query, ikke-aktive annonser, paginering, kombinerte filtre
- Testdekning: fullstendig for backend-laget
- Frontend: ingen automatiserte tester (som tidligere faser — akseptert mønster)

---

## Verdict

**GODKJENT MED MERKNADER**

Fase 3 er solid implementert. Ingen kritiske funn. PE4 (datatype-verifisering) fungerte som tiltenkt — ingen datatype-mismatch mellom frontend og backend. To viktige funn (V1: suggest limit-validering, V2: død kode) bør fikses før produksjonssetting. Kan gå videre til test-fase.
