# Dark Software Factory (DSF)

> En autonom, selvforbedrende software-utviklingsloop med innebygde kvalitetsporter, full sporbarhet, og kontinuerlig læring.

## Prinsipper

1. **Ingen kode uten design** — Alt arbeid starter med en designbeslutning, selv om den er liten
2. **Kvalitet er innebygd, ikke påboltet** — Tester skrives før eller sammen med kode (TDD/TLD)
3. **Sporbarhet overalt** — Hver beslutning, endring og læring dokumenteres
4. **Selvforbedring** — Prosessen evaluerer seg selv og blir bedre over tid
5. **Minste nødvendige kompleksitet** — Løs problemet, ikke hypotetiske fremtidige problemer
6. **Shift-left** — Sikkerhet, kvalitet og testing tidlig i prosessen

## Workflow: DSF Development Loop

Alle oppgaver følger denne loopen. Bruk `/sprint` for å kjøre hele loopen, eller individuelle kommandoer for enkeltsteg.

```
┌─────────────────────────────────────────────────────────────┐
│                    DSF DEVELOPMENT LOOP                      │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 1.INTAKE │───▶│ 2.DESIGN │───▶│  GATE:   │              │
│  │ /intake  │    │ /design  │    │  Design  │              │
│  └──────────┘    └──────────┘    │  Review  │              │
│                                   └────┬─────┘              │
│                                        │ ✅                  │
│  ┌──────────┐    ┌──────────┐    ┌────▼─────┐              │
│  │  GATE:   │◀───│ 4.REVIEW │◀───│3.DEVELOP │              │
│  │ Quality  │    │ /review  │    │ /develop │              │
│  └────┬─────┘    └──────────┘    └──────────┘              │
│       │ ✅                                                   │
│  ┌────▼─────┐    ┌──────────┐    ┌──────────┐              │
│  │ 5. TEST  │───▶│6.DOCUMENT│───▶│ 7.RETRO  │              │
│  │ /test    │    │  /doc    │    │ /retro   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│                                        │                     │
│                                   ┌────▼─────┐              │
│                                   │ LEARNINGS│              │
│                                   │ oppdatert│              │
│                                   └──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Steg 1: INTAKE (`/intake`)
- Analyser krav og kontekst
- Dekomponér til håndterbare oppgaver
- Identifiser risiko og avhengigheter
- Output: Oppgavebeskrivelse i `.dsf/logs/`

### Steg 2: DESIGN (`/design`)
- Arkitekturanalyse (C4-modell tenkning)
- API-design (kontrakter først)
- Komponentdiagram og dataflyt
- ADR (Architecture Decision Record) for vesentlige valg
- Output: Design-doc i `docs/design/`, ADR i `docs/architecture/decisions/`

### GATE: Design Review
- **Automatisk**: Sjekk at design-doc og eventuelle ADR eksisterer
- **Manuell**: Bruker godkjenner design før utvikling starter
- Kriterier: Komplett, konsistent, sikker, testbar

### Steg 3: DEVELOP (`/develop`)
- Implementér basert på godkjent design
- TDD: Skriv test → implementér → refaktorér
- Følg eksisterende kodekonvensjoner
- Sjekk `.dsf/learnings/` for relevante tidligere erfaringer
- Commits: Atomiske, beskrivende, sporbare til design

### Steg 4: REVIEW (`/review`)
- Automatisk kode-review mot sjekkliste
- Sikkerhetssjekk (OWASP Top 10)
- Ytelsesanalyse
- Kodestandard og konsistens
- Output: Review-rapport i `.dsf/logs/`

### GATE: Quality
- Alle tester passerer
- Review godkjent (ingen kritiske funn)
- Ingen kjente sikkerhetshull
- Dokumentasjon oppdatert

### Steg 5: TEST (`/test`)
- Testpyramide: Unit → Integration → E2E
- Dekningsgrad: minimum 80% for ny kode
- Edge cases og feilscenarier
- Output: Testrapport i `.dsf/logs/`

### Steg 6: DOCUMENT (`/doc`)
- Oppdater API-dokumentasjon
- Oppdater changelog
- Generer/oppdater arkitekturdokumentasjon
- Sørg for sporbarhet mellom krav → design → kode → test

### Steg 7: RETRO (`/retro`)
- Analyser hva som gikk bra og dårlig
- Identifiser prosessforbedringer
- Lagre læring i `.dsf/learnings/`
- Oppdater prosessregler ved behov
- Output: Retrospektiv i `docs/retrospectives/`

## Kvalitetsstandarder

### Kode
- Ingen `any`-typer (TypeScript) med mindre eksplisitt begrunnet
- Ingen hardkodede hemmeligheter eller credentials
- Feilhåndtering ved systemgrenser
- Logging for observerbarhet

### Sikkerhet (OWASP Shift-Left)
- Input-validering ved alle grensesnitt
- Parametriserte queries (ingen string-concatenation for SQL)
- Autentisering og autorisasjon sjekkes tidlig i design
- Avhengigheter skannes for kjente sårbarheter

### Testing
- Ny funksjonalitet: Tester skrives først eller samtidig
- Bugfiks: Reproduserende test før fix
- Testene dokumenterer forventet oppførsel

### Dokumentasjon
- ADR for alle vesentlige arkitekturvalg
- Design-docs for alle features over triviell størrelse
- Changelog oppdateres for alle brukersynlige endringer
- Retrospektiver etter hver iterasjon

## Selvforbedring

Fabrikken lærer av egne feil gjennom en automatisk feedback-loop:

```
Feil i iterasjon
    ↓
Retro identifiserer rotårsak (5 whys)
    ↓
Learning opprettet i .dsf/learnings/
    ↓
Prosessfil oppdatert automatisk (.claude/commands/*.md)
    ↓
Neste iterasjon bruker oppdatert prosess
    ↓
Retro sammenligner med forrige → færre feil?
    ↓
Ja: prosessforbedring fungerer
Nei: analyser hvorfor, juster igjen
```

### Mekanismer

1. **Learnings-basen** (`.dsf/learnings/`): Konkrete erfaringer med nøkkelord for søk
2. **Metrikksporing** (`.dsf/metrics/`): Kvantitative mål med tidsbruk per fase
3. **Automatisk prosessoppdatering**: Retro-fasen oppdaterer skills direkte — ikke bare foreslår
4. **Learnings-referanser i sjekklister**: `(LEARNING NNN)` i review- og develop-sjekklister
5. **Effektivitetsanalyse**: Retro sammenligner med forrige iterasjon
6. **Teknisk gjeld-register** (`.dsf/logs/tech-debt.md`): Sporer utsatte krav

### Prosessforbedringer implementert
Denne seksjonen oppdateres automatisk av retro-fasen.

| # | Forbedring | Implementert i | Læring | Dato |
|---|-----------|----------------|--------|------|
| PE1 | Smoke test frontend↔backend i develop | develop.md steg 6 | 001 | 2026-03-28 |
| PE2 | MoSCoW-prioritering + tech-debt register | design.md steg 6, develop.md steg 7 | 002 | 2026-03-28 |
| PE3 | Test-stubs fra testplan i develop | develop.md steg 2 | 005 | 2026-03-28 |

### Metriker som spores
- Antall iterasjoner før godkjent
- Typer feil funnet i review
- Testdekning over tid
- **Tid brukt per fase** (KRITISK — logg start/slutt for hver fase)

### Tidsmåling

**VIKTIG**: Alle faser skal logge varighet. Dette gjøres ved å:
1. Notere starttidspunkt ved begynnelsen av hver fase
2. Notere sluttidspunkt ved fullføring
3. Inkludere varighet i iterasjonsloggen og alle rapporter

Format i iterasjonslogg:
```markdown
## Tidsbruk
| Fase | Start | Slutt | Varighet |
|------|-------|-------|----------|
| Intake | HH:MM | HH:MM | Xm |
| Design | HH:MM | HH:MM | Xm |
| Develop | HH:MM | HH:MM | Xm |
| Review | HH:MM | HH:MM | Xm |
| Test | HH:MM | HH:MM | Xm |
| Document | HH:MM | HH:MM | Xm |
| Retro | HH:MM | HH:MM | Xm |
| **Totalt** | | | **Xm** |
```

Alle review-, test- og retro-rapporter skal også inkludere sin egen varighet.

## Konvensjoner

### Branch-strategi
- `main`: Alltid deploybar
- `feature/<beskrivelse>`: Kortlevde feature-branches
- `fix/<beskrivelse>`: Bugfixer

### Commit-strategi: Én commit per tema

**KRITISK**: Alle commits som resultat av en iterasjon skal være delt opp i ulike temaer/oppgaver som har vært løst. ALDRI samle alt i én stor commit.

Eksempel på riktig oppdeling:
```
feat(auth): legg til JWT-validering for API-endepunkter
test(auth): unit-tester for JWT-validering
feat(users): legg til brukerprofilside
docs(arch): ADR-003 valg av JWT over session-tokens
```

Eksempel på **feil** (én stor commit):
```
feat: implementer auth, brukerprofil og oppdater docs  ← IKKE gjør dette
```

### Commit-format
```
<type>(<scope>): <beskrivelse>

[valgfri body med kontekst]

Refs: <design-doc eller ADR>
```
Typer: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### Commit-rekkefølge i en iterasjon
1. `docs(design)`: Design-doc og ADR-er (opprettet i design-fasen)
2. `test(<scope>)`: Tester (skrevet først ved TDD)
3. `feat/fix(<scope>)`: Implementasjon per tema/oppgave
4. `docs(changelog)`: Oppdatert changelog og dokumentasjon
5. `docs(retro)`: Retrospektiv og learnings

### Filstruktur
```
├── CLAUDE.md              # Denne filen — master workflow
├── .claude/
│   ├── commands/          # DSF skills/kommandoer
│   └── settings.json      # Hooks og innstillinger
├── .dsf/
│   ├── templates/         # Maler for dokumenter
│   ├── learnings/         # Erfaringsbase (selvforbedring)
│   ├── logs/              # Audit trail per iterasjon
│   └── metrics/           # Kvantitative prosessmål
├── docs/
│   ├── architecture/
│   │   └── decisions/     # Architecture Decision Records
│   ├── design/            # Design-dokumenter
│   ├── retrospectives/    # Retrospektiver
│   └── changelog/         # Endringslogg
├── src/                   # Kildekode
└── tests/                 # Tester
```

## Kontekstisolering med subagents

For å sikre objektivitet og forhindre at kontekst fra én fase påvirker en annen, bruker DSF subagents (Agent tool) strategisk:

### Faser som kjøres som subagent (isolert kontekst):
| Fase | Hvorfor isolert |
|------|----------------|
| **REVIEW** | Reviewer må ha ferskt blikk — bias fra utviklingsfasen ville gjøre reviewen mindre effektiv |
| **TEST** | Tester skal verifisere oppførsel uavhengig av implementasjonsdetaljer |
| **RETRO** | Evaluering må være objektiv, uten emosjonell tilknytning til løsningen |

### Faser som kjøres i hovedkontekst:
| Fase | Hvorfor i hovedkontekst |
|------|------------------------|
| **INTAKE** | Krever dialog med bruker |
| **DESIGN** | Krever dialog med bruker + gate-godkjenning |
| **DEVELOP** | Trenger design-kontekst fra godkjenningen |
| **DOCUMENT** | Trenger oversikt over hele iterasjonen |

### Parallellisering
Review og test kan kjøres som parallelle subagents når de ikke har avhengigheter seg imellom. Retro kjøres alltid sist, etter at all annen output er generert.

### Subagent-mønster
Hver subagent får:
1. Eksplisitt rolle ("Du er en uavhengig reviewer/tester/analytiker")
2. Peker til relevante filer (design-doc, logger, kode)
3. Klar oppgavebeskrivelse
4. Forventet output-format og -lokasjon

## Referanser og inspirasjon
- DORA-metriker (lead time, deployment frequency, change failure rate, MTTR)
- StrongDM: Zero-trust, audit trails, principle of least privilege
- Trunk-based development med kortlevde branches
- C4-modellen for arkitekturvisualisering
- OWASP Top 10 for sikkerhet
