# Dark Software Factory (DSF)

En komplett, selvforbedrende software-utviklingsloop for Claude Code. DSF gir deg en strukturert, sporbar og kvalitetssikret utviklingsprosess med innebygde kvalitetsporter, automatisk dokumentasjon, og kontinuerlig læring.

## Hva er DSF?

DSF er et rammeverk som gjør Claude Code til en autonom software-fabrikk med:

- **7-stegs utviklingsloop** med kvalitetsporter mellom fasene
- **Kontekstisolering** via subagents for objektiv review, testing og evaluering
- **Selvforbedring** gjennom retrospektiver og en voksende erfaringsbase
- **Full sporbarhet** fra krav → design → kode → test → dokumentasjon
- **Hooks** som automatisk håndhever prosessregler

## Kom i gang

### 1. Klone og bruk som mal

```bash
git clone <repo-url> mitt-prosjekt
cd mitt-prosjekt
```

### 2. Start Claude Code

```bash
claude
```

Claude leser automatisk `CLAUDE.md` og forstår hele DSF-prosessen.

### 3. Kjør en komplett sprint

```
/sprint Beskriv hva du vil bygge her
```

Eller kjør individuelle faser:

```
/intake Beskriv kravet
/design
/develop
/review
/test
/doc
/retro
```

## Slash-kommandoer

| Kommando | Fase | Beskrivelse |
|----------|------|-------------|
| `/sprint` | Alle | Kjør hele utviklingsloopen fra start til slutt |
| `/intake` | 1. Intake | Analyser krav, dekomponér oppgaver, vurder risiko |
| `/design` | 2. Design | Arkitekturdesign, ADR-er, design-dokumenter |
| `/develop` | 3. Develop | Implementering med TDD-tilnærming |
| `/review` | 4. Review | Systematisk kode-review mot sjekkliste |
| `/test` | 5. Test | Testing med testpyramide og dekningsanalyse |
| `/doc` | 6. Document | Oppdater all dokumentasjon og sporbarhet |
| `/retro` | 7. Retro | Retrospektiv, learnings, prosessforbedring |

## Kvalitetsporter (Gates)

DSF har tre automatiske gates som stopper prosessen og krever godkjenning:

1. **Design Review** — Etter design, før utvikling. En hook sjekker at design-doc eksisterer.
2. **Quality Check** — Etter review. Kritiske funn blokkerer videre arbeid.
3. **Test Quality** — Etter test. Feilende tester må fikses.

### Hook: Design Gate
Hvis du prøver å kjøre `/develop` uten at det finnes et design-dokument i `docs/design/`, vil en hook automatisk advare deg.

## Kontekstisolering

DSF bruker subagents strategisk for å sikre objektivitet:

| Fase | Kontekst | Begrunnelse |
|------|----------|-------------|
| Intake, Design, Develop, Doc | Hovedkontekst | Krever dialog og kontinuitet |
| **Review** | **Subagent** | Ferskt blikk uten utvikler-bias |
| **Test** | **Subagent** | Uavhengig verifisering |
| **Retro** | **Subagent** | Objektiv evaluering |

## Selvforbedring

Etter hver iterasjon kjører DSF en retrospektiv som:

1. Analyserer hva som gikk bra og dårlig
2. Finner rotårsaker (5-whys)
3. Lagrer læring i `.dsf/learnings/`
4. Oppdaterer metriker i `.dsf/metrics/`
5. Foreslår prosessforbedringer til CLAUDE.md eller skills

Erfaringsbasen leses automatisk ved start av nye iterasjoner, slik at de samme feilene ikke gjentas.

## Testdata og seed

Seed-scriptet oppretter kategorier, testbrukere og eksempelannonser:

```bash
# I Docker (anbefalt)
docker compose exec api python -m app.seed

# Lokalt
cd backend && python3 -m app.seed
```

### Testbrukere (passord: `password123`)

| Navn | E-post | Sted |
|------|--------|------|
| Ola Nordmann | ola@example.com | Oslo |
| Kari Hansen | kari@example.com | Bergen |
| Per Olsen | per@example.com | Trondheim |
| Lisa Johansen | lisa@example.com | Stavanger |
| Erik Larsen | erik@example.com | Tromsø |
| + 5 til | ... | ... |

### Seed-innhold
- **12 hovedkategorier** + 19 underkategorier
- **10 testbrukere** med norske navn og byer
- **37 realistiske annonser** (elektronikk, bil, møbler, sport, klær, m.m.)

### Oppstart med Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec api python -m app.seed
# Åpne http://localhost:3000
```

| Tjeneste | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| MinIO console | http://localhost:9001 |
| Nginx proxy | http://localhost:80 |

## Prosjektstruktur

```
├── CLAUDE.md                  # Master workflow og prosessregler
├── README.md                  # Denne filen
├── .claude/
│   ├── commands/              # Slash-kommandoer (skills)
│   │   ├── sprint.md          # /sprint — full loop
│   │   ├── intake.md          # /intake — kravanalyse
│   │   ├── design.md          # /design — arkitekturdesign
│   │   ├── develop.md         # /develop — implementering
│   │   ├── review.md          # /review — kode-review
│   │   ├── test.md            # /test — testing
│   │   ├── doc.md             # /doc — dokumentasjon
│   │   └── retro.md           # /retro — retrospektiv
│   └── settings.json          # Hooks og innstillinger
├── .dsf/
│   ├── templates/             # Maler for design-docs, ADR, retro
│   ├── learnings/             # Erfaringsbase (vokser over tid)
│   ├── logs/                  # Iterasjonslogger og rapporter
│   └── metrics/               # Kvantitative prosessmål
├── docs/
│   ├── architecture/
│   │   └── decisions/         # Architecture Decision Records
│   ├── design/                # Design-dokumenter per feature
│   ├── retrospectives/        # Retrospektiv-rapporter
│   └── changelog/             # Endringslogg
├── src/                       # Kildekode
└── tests/                     # Tester
```

## Dokumentasjon som genereres

DSF genererer automatisk følgende dokumentasjon per iterasjon:

| Dokument | Lokasjon | Innhold |
|----------|----------|---------|
| Iterasjonslogg | `.dsf/logs/` | Status, oppgaver, avvik |
| Design-doc | `docs/design/` | Arkitektur, API, sikkerhet, testplan |
| ADR | `docs/architecture/decisions/` | Arkitekturvalg med begrunnelse |
| Review-rapport | `.dsf/logs/` | Funn klassifisert som kritisk/viktig/forslag |
| Testrapport | `.dsf/logs/` | Resultater, dekning, mangler |
| Changelog | `docs/changelog/` | Brukersynlige endringer |
| Retrospektiv | `docs/retrospectives/` | Analyse, learnings, prosessendringer |
| Learning | `.dsf/learnings/` | Konkrete erfaringer for fremtiden |

## Tilpasning

### Legge til nye hooks
Rediger `.claude/settings.json` — se [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code) for hook-referanse.

### Endre prosessregler
Rediger `CLAUDE.md` — dette er master-konfigurasjonen som styrer hele loopen.

### Endre kommandoer
Rediger filer i `.claude/commands/` — hver `.md`-fil er en slash-kommando.

### Justere maler
Rediger filer i `.dsf/templates/` — disse brukes som utgangspunkt for generert dokumentasjon.

## Inspirasjon

- **DORA-metriker**: Lead time, deployment frequency, change failure rate, MTTR
- **StrongDM**: Zero-trust, audit trails, principle of least privilege
- **Trunk-based development**: Kortlevde branches, hyppige merges
- **C4-modellen**: Kontekst → Container → Komponent → Kode
- **OWASP Top 10**: Sikkerhetssjekkliste integrert i review

## Lisens

MIT
