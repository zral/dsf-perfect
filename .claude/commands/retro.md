---
description: "Retrospektiv og selvforbedring — analyser iterasjonen og oppdater learnings"
---

# DSF Retro — Retrospektiv og selvforbedring

Du er i RETRO-fasen av DSF Development Loop. Dette er den viktigste fasen for fabrikkes evne til å forbedre seg selv.

## Instruksjoner

1. **Samle data** fra iterasjonen:
   - Les alle logger fra `.dsf/logs/` for denne iterasjonen
   - Les review-rapporten — hvilke funn ble gjort?
   - Les testrapporten — feilet noe?
   - Sjekk git log for commits i iterasjonen
   - Telle antall avvik fra design

2. **Analyser**:

   ### Hva gikk bra?
   - Hvilke prosesssteg fungerte som planlagt?
   - Hva ble levert uten problemer?
   - Hvilke tidligere learnings var nyttige?

   ### Hva gikk dårlig?
   - Hvor oppsto problemer?
   - Hvilke feil ble gjort?
   - Hva tok lengre tid enn forventet?
   - Hvilke review-funn burde vært fanget tidligere?

   ### Rotårsaksanalyse
   For hvert problem: Spør "hvorfor?" 5 ganger for å finne rotårsaken.

3. **Oppdater learnings-basen**:

   For **hvert** identifisert problem/innsikt, opprett eller oppdater en fil i `.dsf/learnings/`:

   ```markdown
   # <Tittel>
   Dato: <dato>
   Kategori: <arkitektur|kode|testing|prosess|sikkerhet>

   ## Kontekst
   <Hva skjedde?>

   ## Læring
   <Hva lærte vi?>

   ## Tiltak
   <Konkret handling for å unngå dette i fremtiden>

   ## Relevans
   <Når er denne læringen relevant? Nøkkelord for søk>
   ```

4. **Metrikkoppdatering**:

   Oppdater `.dsf/metrics/iterations.md`:
   ```markdown
   | Dato | Feature | Design→Dev (runder) | Review-funn | Test-feil | Læringer |
   ```

5. **Prosessforbedring**:

   Hvis du identifiserer et **mønster** (samme type feil ≥2 ganger):
   - Foreslå konkret endring i CLAUDE.md eller relevant skill
   - Presenter endringen for bruker med begrunnelse
   - Implementer etter godkjenning

6. **Generer retrospektiv-rapport**:

   Opprett `docs/retrospectives/YYYY-MM-DD-<feature>.md`:

   ```markdown
   # Retrospektiv: <feature>
   Dato: <dato>
   Iterasjon: <nr>

   ## Sammendrag
   <2-3 setninger>

   ## Hva gikk bra
   - <punkt>

   ## Hva kan forbedres
   - <punkt med konkret tiltak>

   ## Nye learnings
   - <lenke til learning-fil>

   ## Prosessendringer
   - <endring foreslått/implementert, eller "Ingen">

   ## Metriker
   - Design-runder: X
   - Review-funn: X (kritisk: X, viktig: X, forslag: X)
   - Test-feil: X
   - Avvik fra design: X
   ```

7. **Lukk iterasjonen**:
   - Oppdater iterasjonslogg med `RETRO ✅` og `ITERASJON KOMPLETT`
   - Informer bruker om nøkkelfunn og foreslåtte forbedringer

## Selvforbedringsloop
```
Feil → Analyse → Læring → Prosessendring → Færre feil
```

Brukerens input: $ARGUMENTS
