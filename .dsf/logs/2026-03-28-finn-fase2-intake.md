# Intake: FINN.no Klone — Fase 2 (Kjerneprodukt)
Dato: 2026-03-28
Status: INTAKE ✅

## Krav
Bygg kjerneproduktet: Annonser CRUD med bildeopplasting, kategori-browsing, og annonsevisning. Inkluderer teknisk gjeld fra Fase 1 (rate limiting, JWT hardening).

## Oppgaver
- [ ] 1. Ad + AdImage datamodeller (M)
- [ ] 2. Ad Pydantic schemas (S)
- [ ] 3. Ad service — CRUD, paginering, filtrering (L)
- [ ] 4. Ad router — alle endepunkter (M)
- [ ] 5. Bildeopplasting til MinIO (L)
- [ ] 6. Bildebehandling — resize, thumbnail, WebP (M)
- [ ] 7. Kategori-underkategorier seeding (S)
- [ ] 8. Rate limiting middleware — tech-debt (M)
- [ ] 9. JWT secret hard-fail i production — tech-debt (S)
- [ ] 10. Backend tester — ads, bilder, rate limiting (L)
- [ ] 11. Frontend: Ad types og API hooks (S)
- [ ] 12. Frontend: AdCard + AdGrid (M)
- [ ] 13. Frontend: Opprett annonse — flersteg-skjema (L)
- [ ] 14. Frontend: Annonsevisning — AdDetail + bildegalleri (L)
- [ ] 15. Frontend: Kategoriside med annonseliste (M)
- [ ] 16. Frontend: Oppdater forside med ekte data (S)

## Teknisk gjeld løst
- [ ] Rate limiting (5/min login, 3/min register)
- [ ] JWT secret hard-fail i production
- [ ] Test: /users/me med utløpt token

## Avhengigheter
- Alle oppgaver avhenger av Fase 1 (auth, database, docker)
- Oppgave 3-6 er backend-kjerne, 11-16 er frontend
- Backend og frontend kan delvis parallelliseres

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| MinIO-integrasjon | Medium | Blokkering | Test tidlig, fallback til disk |
| Bildebehandling ytelse | Lav | Treg UX | Async, thumbnails |
| Flersteg-skjema | Medium | Forsinkelse | Enklere steg |

## Tidsbruk
| Fase | Start | Slutt | Varighet |
|------|-------|-------|----------|
| Intake | - | - | ~2m |

## Neste steg
→ Gå til DESIGN-fase
