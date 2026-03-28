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
   - Definér test-scenarier på forhånd (disse blir test-stubs i develop)

6. **MoSCoW-prioritering** (PROSESSFORBEDRING PE2):
   Klassifiser ALLE krav fra designet:
   - **Must have**: Skal implementeres i denne iterasjonen. Blokkerer review.
   - **Should have**: Bør implementeres. Hvis utsatt → MÅ dokumenteres som teknisk gjeld.
   - **Could have**: Kan implementeres hvis tid. Dokumenteres som fremtidig arbeid.
   - **Won't have**: Eksplisitt utenfor scope.

   Alle "Should have" som IKKE implementeres MÅ ha:
   - TODO-kommentar i relevant kode: `# TODO(tech-debt): <krav> — utsatt fra <design-doc>, planlagt fase X`
   - Oppføring i `.dsf/logs/tech-debt.md`

7. **ADR** (for vesentlige arkitekturvalg):

Opprett `docs/architecture/decisions/NNNN-<tittel>.md` med malen fra `.dsf/templates/adr.md`:
- Kontekst: Hvorfor tar vi denne beslutningen?
- Alternativer vurdert
- Beslutning og begrunnelse
- Konsekvenser

8. **Design-dokument**:

Opprett `docs/design/YYYY-MM-DD-<feature>.md` med malen fra `.dsf/templates/design-doc.md`.

9. **Oppdater iterasjonslogg**:
   - Oppdater status i `.dsf/logs/` til `DESIGN ✅`
   - Legg til lenker til design-doc og ADR-er

10. **GATE: Design Review**:
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
