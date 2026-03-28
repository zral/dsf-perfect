# Usikre defaults i konfigurasjon
Dato: 2026-03-28
Kategori: sikkerhet

## Kontekst
JWT_SECRET_KEY hadde default-verdien "change-me-in-production". Appen ville starte og kjore normalt med denne verdien, noe som betyr at alle JWT-tokens i produksjon ville vare signert med en forutsigbar hemmelighet. Etter review ble det lagt til en advarsel, men appen feiler fortsatt ikke ved oppstart.

## Laering
"Fail-open" konfigurasjon for sikkerhetskritiske verdier er en vanlig felle. Utviklere setter en default for a forenkle lokal utvikling, men glemmer at samme kode kjorer i produksjon. En advarsel er bedre enn ingenting, men den kritiske losningen er "fail-closed": appen ma nekte a starte uten en eksplisitt, sikker hemmelighet i produksjonsmiljo.

## Tiltak
- Sikkerhetskritiske konfigurasjonsverdier (JWT secret, DB passord, API-nokler) skal IKKE ha defaults. Bruk `Field(...)` uten default i Pydantic Settings.
- Alternativt: la default eksistere for dev, men valider ved oppstart at verdien ikke er en kjent default nar miljoet er "production" eller "staging". Kast ValueError, ikke bare advar.
- Legg til dette som et standardpunkt i review-sjekklisten.

## Relevans
JWT, hemmeligheter, konfigurasjon, secrets management, Pydantic Settings, fail-open, produksjonssikkerhet
