---
description: "Systematisk kode-review med sjekkliste for sikkerhet, kvalitet og konsistens"
---

# DSF Review — Kode-review

Du er i REVIEW-fasen av DSF Development Loop.

## Instruksjoner

1. **Samle endringer**:
   - Identifiser alle filer endret i denne iterasjonen
   - Les design-dokumentet for å forstå intensjonen
   - Les iterasjonsloggen for kontekst

2. **Review mot sjekkliste**:

### Korrekthet
- [ ] Implementerer koden det designet spesifiserer?
- [ ] Håndteres alle edge cases?
- [ ] Er feilhåndtering tilstrekkelig?
- [ ] Fungerer koden korrekt med eksisterende kode?

### Integrasjon (LEARNING 001, LEARNING 007)
- [ ] Matcher frontend API-kall faktiske backend-endepunkter?
- [ ] Er HTTP-metoder korrekte (GET/POST/PATCH/DELETE)?
- [ ] Matcher request/response-formater mellom frontend og backend?
- [ ] Er smoke test-tabellen i iterasjonsloggen komplett?
- [ ] **Datatype-match** (LEARNING 007): For hvert POST/PATCH-kall — matcher frontend-verdier backend Pydantic schema-typer? (UUID vs slug, int vs float, enum-verdier)
- [ ] **FormData-kall** (LEARNING 007): Er Content-Type ALDRI satt manuelt for multipart-kall?

### Krav-sporbarhet (LEARNING 002)
- [ ] Er alle "Must have" fra design-doc implementert?
- [ ] Er utsatte "Should have" dokumentert som teknisk gjeld?
- [ ] Finnes TODO-kommentarer for utsatte sikkerhetskrav?

### Konfigurasjon (LEARNING 003)
- [ ] Har alle hemmeligheter/secrets sikre defaults eller feilhåndtering?
- [ ] Er det noen hardkodede verdier som burde være konfigurerbare?

### Sikkerhet (OWASP Top 10)
- [ ] **Injection**: Er all input validert/sanitisert?
- [ ] **Broken Auth**: Er autentisering korrekt implementert?
- [ ] **Sensitive Data**: Ingen hemmeligheter i kode, logger eller feilmeldinger?
- [ ] **XXE/XSS**: Er output korrekt escaped?
- [ ] **Access Control**: Er autorisasjon sjekket konsistent?
- [ ] **Misconfiguration**: Er defaults sikre?
- [ ] **Dependencies**: Har nye avhengigheter kjente sårbarheter?

### Kvalitet
- [ ] Er koden lesbar og forståelig?
- [ ] Følger den eksisterende konvensjoner?
- [ ] Er det unødvendig duplisering?
- [ ] Er kompleksiteten minimert?
- [ ] Er naming konsistent og beskrivende?
- [ ] Brukes deprecated API-er? (f.eks. `datetime.utcnow()` -> `datetime.now(timezone.utc)`)

### Ytelse
- [ ] Er det N+1-problemer?
- [ ] Er det unødvendige beregninger/allokeringer?
- [ ] Er det potensielle minnelekkasjer?
- [ ] Er database-queries effektive?

### Testing (LEARNING 005)
- [ ] Har all ny kode tester?
- [ ] Tester edge cases og feilscenarier?
- [ ] Er testene isolerte og uavhengige?
- [ ] Passer testdekningen kravet (≥80%)?
- [ ] Er alle test-stubs fra testplanen implementert (ingen gjenværende `pytest.skip`)?
- [ ] Dekker testene alle sikkerhetskritiske scenarier?

### Dokumentasjon
- [ ] Er public API dokumentert?
- [ ] Er kompleks logikk forklart?
- [ ] Er ADR opprettet for arkitekturvalg?

3. **Klassifiser funn**:
   - 🔴 **KRITISK**: Må fikses (sikkerhet, korrekthet)
   - 🟡 **VIKTIG**: Bør fikses (kvalitet, vedlikeholdbarhet)
   - 🔵 **FORSLAG**: Kan vurderes (forbedringer, stil)

4. **Sjekk learnings-relevans**:
   Les `.dsf/learnings/` og sjekk om noen er relevante for denne review.
   Referér relevante learnings i rapporten som `(LEARNING NNN)`.

5. **Generer review-rapport**:

Opprett `.dsf/logs/YYYY-MM-DD-<kort-beskrivelse>-review.md`:

```markdown
# Code Review: <tittel>
Dato: <dato>
Reviewer: DSF Automated Review

## Sammendrag
<kort oppsummering>

## Funn
### 🔴 Kritisk
<funn eller "Ingen">

### 🟡 Viktig
<funn eller "Ingen">

### 🔵 Forslag
<funn eller "Ingen">

## Verdict
<GODKJENT / GODKJENT MED MERKNADER / AVVIST>
```

6. **GATE: Quality Check**:
   - Hvis 🔴 KRITISK funn: **AVVIST** → Fiks og kjør `/review` igjen
   - Hvis bare 🟡 og 🔵: **GODKJENT MED MERKNADER** → Presenter for bruker
   - Hvis ingen funn: **GODKJENT** → Videre til test

7. **Oppdater iterasjonslogg** med review-status

## Neste steg
Etter godkjent review → `/test`

Brukerens input: $ARGUMENTS
