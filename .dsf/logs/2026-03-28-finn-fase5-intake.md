# Intake: FINN.no Klone — Fase 5 (PWA)
Dato: 2026-03-28
Status: INTAKE ✅

## Krav
Gjør appen til en fullverdig PWA: service worker med smart caching, offline-støtte, installerbarhet, og PWA-ikoner. Lighthouse PWA-score ≥90.

## Oppgaver
- [ ] 1. Service Worker med caching-strategier (L)
- [ ] 2. Offline fallback-side (S)
- [ ] 3. PWA-ikoner (SVG→generert) (S)
- [ ] 4. Komplett manifest.json med ikoner (S)
- [ ] 5. Install prompt — "Legg til på hjem-skjermen" (M)
- [ ] 6. App Shell caching — CSS, JS, fonts (M)
- [ ] 7. API-data caching — network-first med fallback (M)
- [ ] 8. Bilde-caching — stale-while-revalidate (M)
- [ ] 9. Offline-indikator i UI (S)
- [ ] 10. Meta-tags for iOS/Android (S)

## Teknisk gjeld
Ingen tech-debt adresseres denne fasen — ren PWA-fokus.

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| SW i Next.js dev mode | Medium | Vanskelig debug | Test i prod build |
| iOS PWA-begrensninger | Lav | Dårlig UX | Apple-spesifikke meta-tags |

## Tidsbruk
| Fase | Start | Slutt | Varighet |
|------|-------|-------|----------|
| Intake | - | - | ~1m |

## Neste steg
→ DESIGN
