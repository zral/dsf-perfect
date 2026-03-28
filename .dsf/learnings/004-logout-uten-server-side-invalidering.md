# Logout uten server-side invalidering
Dato: 2026-03-28
Kategori: sikkerhet

## Kontekst
Frontend logout-funksjonen slettet bare tokens lokalt (localStorage) uten a kalle backend logout-endepunktet. Refresh tokens forble gyldige i databasen i opptil 7 dager. En angriper med et stjalt refresh token kunne fortsette a bruke det etter at brukeren "logget ut".

## Laering
Client-side-only logout er en vanlig feil i SPA-arkitekturer. Det foler seg komplett fordi brukeren ser at de er logget ut, men server-side sesjonen lever videre. Dette er spesielt kritisk med refresh tokens som har lang levetid.

## Tiltak
- Logout-funksjonalitet skal alltid inkludere server-side token-revokering som forste steg.
- Legg til dette som et krav i auth-designmalen: "Logout = server-side revokering + client-side cleanup".
- Tester for logout bor verifisere bade at backend-kallet gjores OG at tokenet er ugyldig etter logout.

## Relevans
Autentisering, logout, refresh tokens, SPA, token-revokering, sessionshandtering, localStorage
