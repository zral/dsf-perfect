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

### Ytelse
- [ ] Er det N+1-problemer?
- [ ] Er det unødvendige beregninger/allokeringer?
- [ ] Er det potensielle minnelekkasjer?
- [ ] Er database-queries effektive?

### Testing
- [ ] Har all ny kode tester?
- [ ] Tester edge cases og feilscenarier?
- [ ] Er testene isolerte og uavhengige?
- [ ] Passer testdekningen kravet (≥80%)?

### Dokumentasjon
- [ ] Er public API dokumentert?
- [ ] Er kompleks logikk forklart?
- [ ] Er ADR opprettet for arkitekturvalg?

3. **Klassifiser funn**:
   - 🔴 **KRITISK**: Må fikses (sikkerhet, korrekthet)
   - 🟡 **VIKTIG**: Bør fikses (kvalitet, vedlikeholdbarhet)
   - 🔵 **FORSLAG**: Kan vurderes (forbedringer, stil)

4. **Generer review-rapport**:

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

5. **GATE: Quality Check**:
   - Hvis 🔴 KRITISK funn: **AVVIST** → Fiks og kjør `/review` igjen
   - Hvis bare 🟡 og 🔵: **GODKJENT MED MERKNADER** → Presenter for bruker
   - Hvis ingen funn: **GODKJENT** → Videre til test

6. **Oppdater iterasjonslogg** med review-status

## Neste steg
Etter godkjent review → `/test`

Brukerens input: $ARGUMENTS
