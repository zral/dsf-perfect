---
description: "Analyserer krav, dekomponerer oppgaver, og starter en ny DSF-iterasjon"
---

# DSF Intake — Kravanalyse og oppgavedekomponering

Du er i INTAKE-fasen av DSF Development Loop.

## Instruksjoner

1. **Les kontekst**:
   - Les CLAUDE.md for gjeldende prosessregler
   - Les `.dsf/learnings/` for relevante tidligere erfaringer
   - Forstå eksisterende kodebase og arkitektur

2. **Analyser kravet**:
   - Hva skal oppnås? (funksjonelt)
   - Hvilke kvalitetskrav gjelder? (ikke-funksjonelt)
   - Hva er scope og avgrensning?
   - Hvilke avhengigheter finnes?

3. **Dekomponér**:
   - Bryt ned til konkrete, uavhengige oppgaver
   - Estimer kompleksitet (S/M/L)
   - Identifiser rekkefølgeavhengigheter
   - Marker risikopunkter

4. **Risikovurdering**:
   - Sikkerhetsimplikasjoner?
   - Ytelsespåvirkning?
   - Breaking changes?
   - Ukjent terreng / ny teknologi?

5. **Generer iterasjonslogg**:

Opprett fil `.dsf/logs/YYYY-MM-DD-<kort-beskrivelse>-intake.md` med:

```markdown
# Intake: <tittel>
Dato: <dato>
Status: INTAKE ✅

## Krav
<oppsummering av kravet>

## Oppgaver
- [ ] Oppgave 1 (S/M/L) — beskrivelse
- [ ] Oppgave 2 (S/M/L) — beskrivelse

## Avhengigheter
<liste>

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|

## Neste steg
→ Gå til DESIGN-fase med `/design`
```

6. **Informer bruker**:
   - Presenter analyse og oppgavedekomponering
   - Be om godkjenning før videre arbeid
   - Foreslå `/design` som neste steg

Brukerens input: $ARGUMENTS
