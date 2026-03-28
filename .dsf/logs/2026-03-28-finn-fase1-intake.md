# Intake: FINN.no Klone — Fase 1 (Grunnmur)
Dato: 2026-03-28
Status: INTAKE ✅

## Krav
Bygg grunnmuren for en FINN.no PWA-klone: Docker-infrastruktur, FastAPI backend med auth-system, og Next.js frontend med grunnleggende layout og autentisering. Se finn.md for komplett spesifikasjon.

## Oppgaver
- [x] 1. Docker Compose + .env.example (S) ✅
- [x] 2. Backend pyproject.toml + FastAPI bootstrap (S) ✅
- [x] 3. Database config — async SQLAlchemy + Alembic (M) ✅
- [x] 4. User-modell + migrering (M) ✅
- [x] 5. Category-modell + migrering (S) ✅
- [x] 6. Auth service — JWT, hashing, refresh tokens (L) ✅
- [x] 7. Auth router — register, login, refresh, logout (M) ✅
- [x] 8. User router — me, profil (S) ✅
- [x] 9. Backend tester — auth, user (M) ✅ (7/7 bestått)
- [x] 10. Frontend Next.js bootstrap + Tailwind + PWA (M) ✅
- [x] 11. Frontend layout — Header, BottomNav (M) ✅
- [x] 12. Login/Register sider + auth hooks (M) ✅
- [x] 13. API client — axios + token management (S) ✅
- [x] 14. Nginx config (S) ✅

## Avhengigheter
- Oppgave 3 avhenger av 2
- Oppgave 4, 5 avhenger av 3
- Oppgave 6 avhenger av 4
- Oppgave 7, 8 avhenger av 6
- Oppgave 9 avhenger av 7, 8
- Oppgave 11-13 avhenger av 10
- Backend og frontend kan utvikles parallelt

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| Async SQLAlchemy setup | Medium | Forsinkelse | Følg FastAPI best practices |
| JWT refresh race conditions | Lav | Sikkerhetshull | Token rotation med grace period |
| Docker nettverk | Lav | Blokkering | depends_on + healthchecks |

## Neste steg
→ Gå til DESIGN-fase
