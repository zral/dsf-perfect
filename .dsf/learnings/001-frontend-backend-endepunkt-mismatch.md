# Frontend-backend endepunkt-mismatch slipper gjennom til review
Dato: 2026-03-28
Kategori: kode

## Kontekst
Frontend authStore kalte `/api/v1/auth/me` mens backend kun eksponerte `/api/v1/users/me`. Feilen ble ikke oppdaget under utvikling fordi det ikke fantes integrasjonstester som kjorte frontend mot backend. Revieweren fanget det som kritisk funn K1.

## Laering
Nar frontend og backend utvikles i samme iterasjon uten kjorende integrasjon, er det hoy risiko for endepunkt-mismatch. Utvikleren antar at endepunktet finnes fordi det "foler riktig", uten a verifisere mot faktisk backend-kode.

## Tiltak
- I develop-fasen: krev at API-klienten i frontend genereres fra eller verifiseres mot OpenAPI-spec (FastAPI genererer dette automatisk).
- Legg til en pre-review sjekk som sammenligner frontend API-kall mot backend-router-definisjoner.
- Vurder a kjore `docker-compose up` og gjore en smoke test for review-fasen starter.

## Relevans
Fullstack-utvikling, API-integrasjon, frontend-backend kommunikasjon, REST-endepunkter, authStore, fetchUser
