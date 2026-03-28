# Smoke test maa sjekke respons-struktur i tillegg til datatyper
Dato: 2026-03-28
Kategori: kode

## Kontekst
PE1 (endepunkt-sjekk) og PE4 (datatype-verifisering) fanget ikke at backend GET /conversations/{id} manglet `conversation`-feltet i responsen. Frontend `ConversationDetail`-typen forventet `{ conversation, messages, total, page }`, men backend returnerte bare `{ messages, total, page }`. Feilen ville gjort ChatWindow ubrukelig.

## Laering
Smoke test som sjekker endepunkt-eksistens (PE1) og datatyper (PE4) er utilstrekkelig for sammensatte responser. Naar frontend definerer en TypeScript-interface med spesifikke felter, maa smoke testen verifisere at ALLE disse feltene faktisk finnes i backend-responsen. Dette er spesielt viktig for wrappede responser (f.eks. `{ entity, items[], total, page }`) som er vanlige i list/detail-endepunkter.

## Tiltak
- Utvid smoke test (PE5) til aa sammenligne frontend TypeScript response-interfaces med backend respons-struktur felt-for-felt
- For hvert API-kall: list opp alle felter i frontend-typen og verifiser at de finnes i backend router-responsen
- Spesielt viktig for GET-endepunkter som returnerer sammensatte objekter

## Relevans
Frontend-backend integrasjon, API-kontrakter, TypeScript interfaces, respons-struktur, sammensatte responser, wrappede objekter
