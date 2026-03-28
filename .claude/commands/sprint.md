---
description: "Kjør en komplett DSF Development Loop fra intake til retro"
---

# DSF Sprint — Komplett utviklingsloop

Kjør hele DSF Development Loop for en oppgave.

## Kontekstisolering med subagents

**KRITISK**: Bruk subagents (Agent tool) for faser der kontekstseparasjon er viktig. Dette forhindrer at kontekst fra én fase smitter over og påvirker en annen.

### Faser som SKAL kjøres som subagent:
- **REVIEW** — Må ha ferskt blikk på koden, uten bias fra utviklingsfasen
- **TEST** — Skal teste uavhengig av implementasjonsdetaljer
- **RETRO** — Skal evaluere objektivt, uten å være "invested" i løsningen

### Faser som kjøres i hovedkontekst:
- **INTAKE** — Trenger dialog med bruker
- **DESIGN** — Trenger dialog med bruker + gate-godkjenning
- **DEVELOP** — Trenger tilgang til design-kontekst fra godkjenning
- **DOCUMENT** — Trenger oversikt over hele iterasjonen

## Prosess

Du skal nå kjøre en komplett DSF-iterasjon. Følg disse stegene i rekkefølge, og **stopp ved hver gate for godkjenning**.

### Steg 1: INTAKE (hovedkontekst)
Kjør intake-prosessen som beskrevet i `/intake`:
- Analyser kravet
- Dekomponér oppgaver
- Vurder risiko
- Generer iterasjonslogg

Presenter analyse for bruker og be om godkjenning.

### Steg 2: DESIGN (hovedkontekst)
Etter godkjent intake, kjør design-prosessen som beskrevet i `/design`:
- Arkitekturanalyse
- Opprett design-doc og eventuelle ADR-er
- Sikkerhets- og testbarhetsgjennomgang

**GATE: Design Review** — Presenter design og vent på godkjenning.

### Steg 3: DEVELOP (hovedkontekst)
Etter godkjent design, implementér som beskrevet i `/develop`:
- TDD-syklus for hver oppgave
- Atomiske commits
- Følg design-doc

### Steg 4: REVIEW (SUBAGENT — kontekstisolert)
Etter implementering, bruk Agent tool for å kjøre review:

```
Agent(subagent_type="general-purpose", prompt="
  Du er en uavhengig kode-reviewer i DSF. Du har IKKE vært involvert i utviklingen.

  1. Les design-dokumentet i docs/design/ for denne iterasjonen
  2. Les iterasjonsloggen i .dsf/logs/
  3. Kjør git diff for å se alle endringer
  4. Utfør en systematisk review basert på sjekklisten i .claude/commands/review.md
  5. Opprett review-rapport i .dsf/logs/
  6. Returner verdict: GODKJENT / GODKJENT MED MERKNADER / AVVIST med begrunnelse

  Vær kritisk og objektiv. Ikke la noe passere som du ikke er sikker på.
")
```

**GATE: Quality Check** — Hvis kritiske funn fra subagent → fiks og kjør review igjen.

### Steg 5: TEST (SUBAGENT — kontekstisolert)
Etter godkjent review, bruk Agent tool for testing:

```
Agent(subagent_type="general-purpose", prompt="
  Du er en uavhengig tester i DSF. Du har IKKE skrevet koden.

  1. Les design-dokumentet for forventede test-scenarier
  2. Kjør alle eksisterende tester
  3. Verifiser testdekning for ny kode
  4. Identifiser manglende edge case-tester
  5. Opprett testrapport i .dsf/logs/
  6. Returner: BESTÅTT / FEILET med detaljer

  Test grundig. Anta at koden har bugs til du har bevist det motsatte.
")
```

**GATE: Test Quality** — Hvis feilende tester → fiks og test igjen.

### Steg 6: DOCUMENT (hovedkontekst)
Etter beståtte tester, dokumentér som beskrevet i `/doc`:
- Oppdater changelog
- Verifiser sporbarhetskjede
- Komplett dokumentasjon

### Steg 7: RETRO (SUBAGENT — kontekstisolert)
Til slutt, bruk Agent tool for retrospektiv:

```
Agent(subagent_type="general-purpose", prompt="
  Du er en prosessanalytiker i DSF. Evaluer denne iterasjonen objektivt.

  1. Les alle logger fra .dsf/logs/ for denne iterasjonen
  2. Les review- og testrapporter
  3. Sjekk git log for commits
  4. Les eksisterende learnings i .dsf/learnings/
  5. Analyser: Hva gikk bra? Hva gikk dårlig? Rotårsaker?
  6. Opprett nye learning-filer i .dsf/learnings/
  7. Oppdater .dsf/metrics/iterations.md
  8. Opprett retrospektiv i docs/retrospectives/
  9. Foreslå konkrete prosessforbedringer

  Vær ærlig og konkret. Generelle observasjoner er ikke nyttige.
")
```

## Parallelle subagents der mulig

Når review og test ikke har avhengigheter (f.eks. ved re-review etter fiks), kan de kjøres parallelt:

```
// Kjør review og test parallelt
Agent(review) + Agent(test) → vent på begge → evaluer gates
```

## Tidsmåling

**VIKTIG**: Logg starttidspunkt ved begynnelsen av hver fase. Bruk `date +%H:%M` eller noter tidspunkt fra commit-tidsstempler. Inkluder i iterasjonsloggen og retrospektiv.

## Selvforbedring — innebygd i loopen

Disse forbedringene er implementert automatisk basert på learnings fra Fase 1:

| Forbedring | Fase | Hva sjekkes |
|-----------|------|-------------|
| **Test-stubs (PE3)** | Develop | Tomme tester opprettes FØR implementasjon |
| **MoSCoW (PE2)** | Design | Krav prioriteres, utsatte dokumenteres |
| **Smoke test (PE1)** | Develop | Frontend API-kall verifiseres mot backend |
| **Learnings-ref** | Review | Sjekklisten refererer relevante learnings |
| **Effektivitetsanalyse** | Retro | Sammenligner med forrige iterasjon |
| **Auto-oppdatering** | Retro | Skills oppdateres direkte, ikke bare foreslått |

## Viktig
- **Stopp ved gates** — ikke gå videre uten godkjenning
- **Subagents for uavhengighet** — review, test og retro skal ha ferskt blikk
- **Logg alt** — sporbarhet er ikke valgfritt
- **Sjekk learnings** — lær av historien
- **Følg designet** — avvik krever ny godkjenning
- **Mål tiden** — varighet per fase logges i iterasjonslogg

Brukerens input (krav/oppgave): $ARGUMENTS
