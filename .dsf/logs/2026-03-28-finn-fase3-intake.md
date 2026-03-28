# Intake: FINN.no Klone — Fase 3 (Søk og oppdagelse)
Dato: 2026-03-28
Status: INTAKE ✅

## Krav
Fulltekstsøk med filtrering, autocomplete og søkeresultatside. Søkelinjen i Header kobles til ekte søk-API. URL-baserte filtre for delbare søkelenker.

## Oppgaver
- [ ] 1. Search service — fulltekstsøk (L)
- [ ] 2. Search router — /api/v1/search med filtre (M)
- [ ] 3. Autocomplete — /api/v1/search/suggest (M)
- [ ] 4. Kategori-underkategorier seed — tech-debt (S)
- [ ] 5. Backend tester — søk, suggest, filtre (L)
- [ ] 6. Frontend: useSearch hook (S)
- [ ] 7. Frontend: SearchResults /search side (L)
- [ ] 8. Frontend: SearchBar autocomplete i Header (M)
- [ ] 9. Frontend: Avansert FilterPanel (M)
- [ ] 10. Frontend: URL-baserte filtre med query params (M)

## Teknisk gjeld adressert
- [ ] Kategori-underkategorier seed

## Teknisk gjeld utsatt
- MinIO bildeopplasting → Fase 4+
- Redis rate limiter → Fase 4+
- Strukturert logging → Fase 4+
- Lignende annonser → Fase 4+

## Avhengigheter
- Oppgave 1-3 er backend-kjerne
- Oppgave 6-10 er frontend
- Backend og frontend kan parallelliseres etter router er klar

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| PostgreSQL fulltekstsøk | Lav | Treg søk | GIN-indeks, ILIKE fallback |
| Autocomplete UX | Medium | Dårlig UX | 300ms debounce, min 2 tegn |
| URL-state synk | Medium | Bugs | useSearchParams |

## Tidsbruk
| Fase | Start | Slutt | Varighet |
|------|-------|-------|----------|
| Intake | - | - | ~2m |

## Neste steg
→ DESIGN
