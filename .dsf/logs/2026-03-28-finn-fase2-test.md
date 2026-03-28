# Testrapport: FINN.no Klone — Fase 2 (Kjerneprodukt)

**Dato**: 2026-03-28
**Tester**: Uavhengig tester (DSF)
**Design-dokument**: `docs/design/2026-03-28-finn-fase2-kjerneprodukt.md`

## Testresultater — Backend

| # | Scenario | Forventet | Resultat |
|---|----------|-----------|----------|
| 1 | Opprett annonse med gyldige data | 201 | PASSED |
| 2 | Opprett annonse uten auth | 401 | PASSED |
| 3 | Opprett annonse med ugyldig kategori | 404 | PASSED |
| 4 | Opprett annonse med for kort tittel | 422 | PASSED |
| 5 | Hent annonse med ID | 200, komplett data | PASSED |
| 6 | Hent ikke-eksisterende annonse | 404 | PASSED |
| 7 | Liste annonser med paginering | 200, paginering | PASSED |
| 8 | Filtrere annonser pa kategori | 200, riktig filtrering | PASSED |
| 9 | Filtrere annonser pa pris-range | 200, riktig range | PASSED |
| 10 | Oppdater egen annonse | 200, oppdatert | PASSED |
| 11 | Oppdater andres annonse | 403 | PASSED |
| 12 | Slett egen annonse | 204 | PASSED |
| 13 | Slett andres annonse | 403 | PASSED |
| 14 | Last opp bilde (gyldig JPEG) | 201, URL returnert | PASSED |
| 15 | Last opp bilde for andres annonse | 403 | PASSED |
| 16 | Last opp ugyldig filtype | 422 | PASSED |
| 17 | Rate limiting blokkerer etter grense | 429 | PASSED |
| 18 | Hent annonser i kategori via slug | 200, riktige annonser | PASSED |
| 19 | Views count oker ved henting | views_count + 1 | PASSED |

## Testplan-dekning

**19/19 scenarier dekket og bestatt.**

Ingen `pytest.skip`-kall gjenstaar. Alle 19 tester er fullstendig implementert med reelle assertions.

## Gjenvarende test-stubs

Ingen. Alle tester er fullstendig implementert.

## Komplett testkjoring

```
32 passed, 160 warnings in 8.17s
```

- 19 tester i `tests/test_ads.py` (Fase 2 — annonser)
- 13 tester i `tests/test_auth.py` (Fase 1 — auth, fortsatt gronne)

### Advarsler (ikke-kritiske)

- `JWT_SECRET_KEY` bruker default usikker verdi (forventet i test-miljo)
- `datetime.utcnow()` deprecation i SQLAlchemy (lav prioritet)
- `HTTP_422_UNPROCESSABLE_ENTITY` deprecation i FastAPI (kosmetisk)
- `crypt` deprecation i passlib (tredjeparts-avhengighet)

## Frontend build status

**BESTATT** — Next.js 16.2.1 (Turbopack), kompilert uten feil.

Ruter verifisert:
- `/` — Forside (statisk)
- `/ad/[id]` — Annonsevisning (dynamisk)
- `/ad/new` — Opprett annonse (statisk)
- `/category/[slug]` — Kategoriside (dynamisk)
- `/login` — Innlogging (statisk)
- `/register` — Registrering (statisk)

## Verdict

**BESTATT**
