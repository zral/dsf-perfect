# Teknisk gjeld-register

Alle designkrav som bevisst utsettes dokumenteres her med kilde og planlagt fase.

| Krav | Prioritet | Kilde | Planlagt fase | Status | Dato |
|------|-----------|-------|---------------|--------|------|
| Rate limiting (5/min login, 3/min register) | Should | Design Fase 1 | Fase 2 | Lukket | 2026-03-28 |
| Strukturert logging med correlation IDs | Should | Design Fase 1 | Fase 3 | Åpen | 2026-03-28 |
| JWT secret hard-fail i production | Should | Retro Fase 1 | Fase 2 | Lukket | 2026-03-28 |
| Test: /users/me med utløpt token | Could | Testplan Fase 1 | Fase 3 | Åpen | 2026-03-28 |
| MinIO bildeopplasting (erstatt lokal lagring) | Should | Design Fase 2 | Fase 3 | Åpen | 2026-03-28 |
| Kategori-underkategorier i seed-data | Should | Design Fase 2 | Fase 3 | Lukket | 2026-03-28 |
| Lignende annonser-endepunkt | Could | Design Fase 2 | Fase 3+ | Åpen | 2026-03-28 |
| Rate limiter: bytt fra in-memory til Redis | Should | Design Fase 2 | Fase 3 | Åpen | 2026-03-28 |
| Elasticsearch/fulltekst-indeks (erstatt ILIKE) | Won't | Design Fase 3 | Fase 5+ | Åpen | 2026-03-28 |
| Geolokasjon/kart-basert søk | Won't | Design Fase 3 | Fase 5+ | Åpen | 2026-03-28 |
| Lagrede søk med varsler | Won't | Design Fase 3 | Fase 7 | Åpen | 2026-03-28 |
| Søkehistorikk (localStorage) | Could | Design Fase 3 | Fase 4 | Åpen | 2026-03-28 |
| Highlight søkeord i resultater | Could | Design Fase 3 | Fase 4 | Åpen | 2026-03-28 |
| Rate limiting på suggest-endepunkt (10/min) | Should | Design Fase 3 | Fase 4 | Åpen | 2026-03-28 |
