# Smoke test fanger ikke datatype-mismatch mellom frontend og backend
Dato: 2026-03-28
Kategori: kode

## Kontekst
PE1 (smoke test) ble introdusert i Fase 2 for a verifisere frontend-backend integrasjon for review. Smoke testen sjekket at endepunkter eksisterer og HTTP-metoder matcher, men fanget IKKE at:
- K1: AdForm sendte kategori-slug som `category_id`, mens backend forventet UUID
- K2: Frontend satte `Content-Type: multipart/form-data` eksplisitt, noe som fikk Axios til a mangle boundary-parameter

Begge feilene er datatype/format-mismatch, ikke endepunkt-mismatch. Smoke testen sjekket "eksisterer endepunktet?" men ikke "matcher datatypene?".

## Laering
Smoke test som kun sjekker endepunkt-eksistens er utilstrekkelig. Den maa ogsaa verifisere:
1. At datatyper matcher (UUID vs string, number vs string)
2. At request-body-format er korrekt (JSON vs FormData, Content-Type headers)
3. At enum-verdier / ID-formater stemmer overens

## Tiltak
- Utvid smoke test-sjekklisten i develop.md til a inkludere datatype-verifisering
- Spesifikt: for hvert POST/PATCH-kall, sjekk at frontend-verdier matcher Pydantic schema-typer
- Spesifikt: for FormData-kall, verifiser at Content-Type IKKE settes manuelt

## Relevans
Frontend-backend integrasjon, API-kontrakter, datatyper, UUID, FormData, multipart, Axios, Pydantic
