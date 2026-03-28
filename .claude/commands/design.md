---
description: "Arkitektur- og komponentdesign med ADR-er og designdokumenter"
---

# DSF Design — Arkitektur og komponentdesign

Du er i DESIGN-fasen av DSF Development Loop.

## Instruksjoner

1. **Hent kontekst**:
   - Les CLAUDE.md for gjeldende regler
   - Les siste intake-logg fra `.dsf/logs/`
   - Les `.dsf/learnings/` for relevante arkitekturerfaringer
   - Kartlegg eksisterende arkitektur og mønstre i kodebasen

2. **Arkitekturanalyse** (C4-modell tenkning):
   - **Context**: Hvordan passer dette i systemlandskapet?
   - **Container**: Hvilke tjenester/prosesser er involvert?
   - **Component**: Hvilke moduler/komponenter påvirkes?
   - **Code**: Hvilke klasser/funksjoner må endres/opprettes?

3. **API-design** (hvis relevant):
   - Definer kontrakter (request/response)
   - Vurder bakoverkompatibilitet
   - Feilhåndtering og statuskoder
   - Versjonering

4. **Sikkerhetsdesign**:
   - Autentisering og autorisasjon
   - Input-validering
   - Dataflyt og tilgangskontroll
   - Kryptering (data in transit / at rest)

5. **Testbarhet**:
   - Hvordan skal dette testes?
   - Hvilke mocking/stubbing er nødvendig?
   - Definér test-scenarier på forhånd

6. **ADR** (for vesentlige arkitekturvalg):

Opprett `docs/architecture/decisions/NNNN-<tittel>.md` med malen fra `.dsf/templates/adr.md`:
- Kontekst: Hvorfor tar vi denne beslutningen?
- Alternativer vurdert
- Beslutning og begrunnelse
- Konsekvenser

7. **Design-dokument**:

Opprett `docs/design/YYYY-MM-DD-<feature>.md` med malen fra `.dsf/templates/design-doc.md`.

8. **Oppdater iterasjonslogg**:
   - Oppdater status i `.dsf/logs/` til `DESIGN ✅`
   - Legg til lenker til design-doc og ADR-er

9. **GATE: Design Review**:
   - Presenter designet for bruker
   - Fremhev viktige beslutninger og trade-offs
   - Be om eksplisitt godkjenning: "Godkjenner du dette designet?"
   - **STOPP og vent på godkjenning før du går videre til utvikling**

## Output
- Design-dokument i `docs/design/`
- ADR(er) i `docs/architecture/decisions/`
- Oppdatert iterasjonslogg

## Neste steg
Etter godkjenning → `/develop`

Brukerens input: $ARGUMENTS
