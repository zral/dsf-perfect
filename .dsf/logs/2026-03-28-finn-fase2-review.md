# Code Review: Fase 2 Kjerneprodukt (Annonser, Bilder, Rate Limiting)
Dato: 2026-03-28
Reviewer: DSF Automated Review (uavhengig)
Branch: finn-test (10 nye commits)

## Sammendrag

Fase 2 leverer annonse-CRUD, bildeopplasting med WebP-konvertering, kategori-browsing, og frontend med flersteg-skjema, bildegalleri, filtre og sortering. Rate limiting og JWT-hardening fra teknisk gjeld er implementert. Koden er gjennomgaende velstrukturert og lesbar.

Reviewen avdekker 2 kritiske funn, 4 viktige funn, og 5 forslag.

## Funn

### KRITISK

**K1: AdForm sender kategori-slug som category_id, backend forventer UUID (LEARNING 001)**
Fil: `frontend/src/components/ad/AdForm.tsx` linje 209
AdForm bruker `selectedCategory` som er satt til `category.id` fra `categoryOptions`-arrayet (linje 42-123). Disse ID-ene er slugs (f.eks. `"bil-og-motor"`, `"elektronikk"`), IKKE UUIDs. Backend `AdCreate`-skjemaet (schemas/ad.py linje 15) forventer `category_id: uuid.UUID`, og `create_ad` slaar opp kategorien paa UUID (ad_service.py linje 29). Kallet vil feile med en 422 valideringsfeil fordi en slug ikke kan parses som UUID.

**Forslag til fix**: Hent kategorier fra API (`GET /api/v1/categories`) og bruk faktiske UUID-er som ID i AdForm, eller legg til et endepunkt/logikk som resolves slug til UUID.

---

**K2: Frontend sender `Content-Type: multipart/form-data` header eksplisitt - Axios haandterer dette feil (LEARNING 001)**
Fil: `frontend/src/hooks/useAds.ts` linje 119
Naar du eksplisitt setter `Content-Type: multipart/form-data` med Axios, vil headeren mangle `boundary`-parameteren som Axios normalt setter automatisk naar den detekterer FormData. Resultatet er at backend ikke kan parse multipart-dataen, og bildeopplasting vil feile med en 422-feil.

**Forslag til fix**: Fjern `{ headers: { "Content-Type": "multipart/form-data" } }` - Axios setter korrekt Content-Type automatisk for FormData.

---

### VIKTIG

**V1: Prisfilter mangler ore-konvertering paa forsiden, men konverterer paa kategorisiden**
Forside (`page.tsx`): `useAds({ per_page: 8, sort: "newest" })` har ingen filtre, OK.
Kategoriside (`category/[slug]/page.tsx` linje 42-43): Konverterer `price_min/max * 100` korrekt.
MEN: `buildParams` i `useAds.ts` sender `price_min`/`price_max` som rene tall uten konvertering. Hvis noen kalte `useAds` med prisfiltre i kroner (ikke ore), ville verdiene vaere feil. Typen `AdFilters` dokumenterer ikke om price_min/max er i kroner eller ore. Dette er en inkonsistens som vil foraarsake bugs naar prisfiltre legges til paa andre sider.

**Forslag til fix**: Dokumenter enheten i `AdFilters`-typen, og vurder a gjore konverteringen i `buildParams` istedenfor paa kallestedet.

---

**V2: `datetime.utcnow()` er deprecated i Python 3.12+**
Filer: `backend/app/models/ad.py`, `user.py`, `category.py`, `refresh_token.py`
`datetime.utcnow()` returnerer en naive datetime (uten timezone) og er deprecated fra Python 3.12. Bor bruke `datetime.now(timezone.utc)` konsekvent. Merk at `ad_service.py` linje 48 allerede bruker den korrekte `datetime.now(timezone.utc)` for `expires_at`, saa det er inkonsistens innad i kodebasen.

---

**V3: Maks antall bilder per annonse er ikke validert i backend**
Designdokumentet spesifiserer "minst 1, maks 10 bilder per annonse". Frontend begrenser til 10 i ImageUpload (maxImages=10), men backend `upload_image` i `image_service.py` har ingen sjekk paa antall eksisterende bilder for den tillater opplasting. En ondsinnet klient kan laste opp ubegrenset antall bilder via API.

**Forslag til fix**: Legg til sjekk i `upload_image` som avviser opplasting naar `position >= 10`.

---

**V4: In-memory rate limiter lekker minne over tid**
Fil: `backend/app/middleware/rate_limit.py`
Cleanup kjorer kun naar en ny request kommer inn for samme key (linje 19). Keys som ikke faar nye requests vil aldri bli ryddet opp. Over tid vil `_requests`-dicten vokse ubegrenset med forlatte keys. Dette er dokumentert som tech-debt (bytt til Redis), men memory leak bor noteres eksplisitt.

---

### FORSLAG

**F1: `timeAgo` er duplisert i AdCard.tsx og AdDetail.tsx**
Samme funksjon er copy-pastet i to filer. Bor trekkes ut til en felles util/helper.

---

**F2: "Se alle annonser"-lenke paa forsiden peker hardkodet til `/category/elektronikk`**
Fil: `frontend/src/app/page.tsx` linje 140
Burde peke til en generell annonseliste, f.eks. `/ads` eller `/search`, ikke en spesifikk kategori.

---

**F3: FilterPanel stoetter flere conditions, men bare forste sendes til API**
Fil: `frontend/src/app/category/[slug]/page.tsx` linje 44
`filters.conditions[0]` - kun forste valgte condition sendes. Backend stoetter kun en condition-parameter. Enten begrens UI til en enkelt condition (radio-buttons), eller utvid backend til a stotte flere conditions.

---

**F4: Forsidesoket (hero search bar) er ikke funksjonelt**
Fil: `frontend/src/app/page.tsx` linje 69-74
Input-feltet har ingen onChange-handler, ingen form-submit, og ingen kobling til sok. Greit for Fase 2 (fulltekstsok er Fase 3), men bor markeres tydeligere som placeholder/disabled.

---

**F5: `views_count` inkrementeres ved hvert GET-kall uten noen form for rate limiting eller dedup**
Fil: `backend/app/services/ad_service.py` linje 67
Enhver robot eller bruker som refresher siden vil oke telleren. Kan gi misvisende statistikk.

---

## Integrasjonssjekk (LEARNING 001)

| Frontend-kall | Backend-endepunkt | HTTP | Match? |
|---|---|---|---|
| `useAds`: GET `/api/v1/ads` | `ads.py` GET `/` | GET | OK - params matcher (page, per_page, category, price_min, price_max, condition, sort) |
| `useAd`: GET `/api/v1/ads/${id}` | `ads.py` GET `/{ad_id}` | GET | OK |
| `useCategoryAds`: GET `/api/v1/categories/${slug}/ads` | `categories.py` GET `/{slug}/ads` | GET | OK - params matcher |
| `useCreateAd`: POST `/api/v1/ads` | `ads.py` POST `/` | POST | FEIL - category_id er slug, ikke UUID (se K1) |
| `useUpdateAd`: PATCH `/api/v1/ads/${id}` | `ads.py` PATCH `/{ad_id}` | PATCH | OK |
| `useDeleteAd`: DELETE `/api/v1/ads/${id}` | `ads.py` DELETE `/{ad_id}` | DELETE | OK |
| `useUploadImage`: POST `/api/v1/ads/${adId}/images` | `ads.py` POST `/{ad_id}/images` | POST | FEIL - Content-Type header problem (se K2) |

**Resultat**: 2 av 7 API-integrasjoner har problemer. Forbedring fra Fase 1, men fortsatt kritiske funn.

## Krav-sporbarhet (LEARNING 002)

| Designkrav (Must have) | Implementert? | Kommentar |
|---|---|---|
| Ad + AdImage modeller | JA | |
| CRUD-operasjoner | JA | |
| Annonseliste med paginering/filtrering | JA | |
| Bildeopplasting (1-10) | DELVIS | Maks 10 ikke validert i backend (V3) |
| Thumbnail-generering | JA | |
| Frontend: opprett annonse | JA | Men category_id-bug (K1) |
| Frontend: vis annonse | JA | |
| Frontend: vis per kategori | JA | |
| Rate limiting | JA | |

| Utsatt krav | Dokumentert i tech-debt? |
|---|---|
| MinIO (bruker lokal lagring) | JA |
| Kategori-underkategorier | JA |
| Strukturert logging | JA (fra Fase 1) |
| Lignende annonser | JA |
| Redis rate limiter | JA |

**Resultat**: Alle utsatte krav er korrekt dokumentert i tech-debt.md. Klar forbedring fra Fase 1 (LEARNING 002).

## Konfigurasjon (LEARNING 003)

| Sjekk | Status |
|---|---|
| JWT_SECRET_KEY har hard-fail i production | OK - `config.py` kaster ValueError i production |
| JWT_SECRET_KEY har advarsel i dev | OK - warnings.warn() |
| JWT token-levetid | OK - 15 min access, 7 dager refresh |
| UPLOAD_DIR konfigurerbar | OK - via Settings |
| Hardkodede verdier | Se V3 (maks bilder), F2 (hardkodet lenke) |

**Resultat**: JWT-hardening er korrekt implementert iht. LEARNING 003.

## Sikkerhet (OWASP Top 10)

- **Input-validering**: OK - Pydantic schemas validerer tittel (3-200), beskrivelse (10-5000), pris (>=0)
- **Auth/Authz**: OK - get_current_user brukes konsekvent, eier-sjekk i update/delete/upload
- **Filtype-validering**: OK - content_type + Pillow verify()
- **Filstorrelse**: OK - 5MB grense
- **Rate limiting**: OK - 5/min login, 3/min register, 10/min opprett annonse
- **SQL injection**: OK - SQLAlchemy parametriserte queries
- **Sensitive data**: OK - password_hash ikke eksponert i UserResponse/SellerBrief

## Kvalitet

Koden er velstrukturert med god separasjon mellom models, schemas, services og routers. Frontend-komponentene er modulaere og gjenbrukbare. Loading states og skeleton-komponenter er gjennomgaende implementert.

## Verdict

**AVVIST** - 2 kritiske funn (K1, K2) maa fikses for koden kan godkjennes.

K1 (category_id slug vs UUID) vil forhindre opprettelse av annonser.
K2 (Content-Type header) vil forhindre bildeopplasting.

Etter fix av K1 og K2, re-kjoer `/review`.

---

## Re-review (etter fiks)
Dato: 2026-03-28

### K1: OK — Kategorier hentes fra API med ekte UUID

`AdForm.tsx` linje 186 henter kategorier fra `GET /api/v1/categories/`. `mapApiCategories` (linje 144-152) mapper `cat.id` (UUID fra backend) direkte inn i `CategoryOption.id`. Ved innsending sendes `category_id: selectedCategory!` (linje 251), som er en ekte UUID.

Merknad: Fallback-listen (linje 71-142) bruker fortsatt slugs som `id` og vil gi 422-feil hvis API er utilgjengelig. Dette er akseptabelt som feilsituasjon, men bor dokumenteres som kjent begrensning.

### K2: OK — Ingen manuell Content-Type header

`useAds.ts` linje 113-127: `useUploadImage` sender `formData` direkte til `api.post(...)` uten noen `Content-Type`-header. Kommentaren pa linje 116 bekrefter at dette er en bevisst fiks: `// Don't set Content-Type manually — Axios sets it automatically with correct boundary for FormData`. Axios vil korrekt sette `multipart/form-data; boundary=...` automatisk.

## Oppdatert Verdict
GODKJENT MED MERKNADER

Begge kritiske funn (K1, K2) er korrekt fikset. De 4 viktige funnene (V1-V4) og 5 forslagene (F1-F5) fra original review star fortsatt apen og bor adresseres i kommende faser. Sperielt V3 (ingen backend-validering av maks 10 bilder) og V4 (in-memory rate limiter memory leak) anbefales prioritert.
