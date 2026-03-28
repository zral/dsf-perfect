---
description: "Generer og oppdater all nødvendig dokumentasjon for sporbarhet"
---

# DSF Document — Dokumentasjon og sporbarhet

Du er i DOCUMENT-fasen av DSF Development Loop.

## Instruksjoner

1. **Sporbarhetskjede** — verifiser at denne kjeden er komplett:
   ```
   Krav (intake) → Design (design-doc) → Kode (commits) → Tester → Dokumentasjon
   ```

2. **Oppdater changelog**:

   Legg til i `docs/changelog/CHANGELOG.md`:
   ```markdown
   ## [Dato] — <kort beskrivelse>

   ### Lagt til
   - <nye features>

   ### Endret
   - <endringer i eksisterende funksjonalitet>

   ### Fikset
   - <bugfixer>

   ### Refs
   - Design: docs/design/<fil>
   - ADR: docs/architecture/decisions/<fil>
   ```

3. **API-dokumentasjon** (hvis relevant):
   - Oppdater API-docs med nye/endrede endepunkter
   - Eksempler på bruk
   - Feilkoder og -meldinger

4. **Arkitekturdokumentasjon**:
   - Oppdater komponentdiagram hvis strukturen endret seg
   - Verifiser at ADR-er er komplette og oppdaterte

5. **README-oppdatering** (hvis relevant):
   - Nye oppsettstrinn
   - Endrede miljøvariabler
   - Nye avhengigheter

6. **Iterasjonssammendrag**:

   Oppdater iterasjonsloggen i `.dsf/logs/` med:
   - Komplett status for alle faser
   - Lenker til all generert dokumentasjon
   - Status: `DOCUMENT ✅`

7. **Verifiser dokumentasjons-gate**:
   - [ ] Changelog oppdatert
   - [ ] Design-doc komplett
   - [ ] ADR-er for alle vesentlige valg
   - [ ] Testrapport generert
   - [ ] Review-rapport generert
   - [ ] Iterasjonslogg komplett

## Neste steg
Etter dokumentasjon → `/retro`

Brukerens input: $ARGUMENTS
