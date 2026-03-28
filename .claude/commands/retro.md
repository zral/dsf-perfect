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
   - Sjekk git log for commits i iterasjonen (med tidsstempler for fasemåling)
   - Telle antall avvik fra design
   - Sjekk `.dsf/logs/tech-debt.md` for utsatte krav

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

4. **Tidsmåling**:

   Beregn varighet per fase basert på commit-tidsstempler og logg-tidspunkter:
   ```markdown
   ## Tidsbruk
   | Fase | Start | Slutt | Varighet | Runder |
   |------|-------|-------|----------|--------|
   | Intake | HH:MM | HH:MM | Xm | 1 |
   | Design | HH:MM | HH:MM | Xm | 1 |
   | Develop | HH:MM | HH:MM | Xm | 1 |
   | Review | HH:MM | HH:MM | Xm | X |
   | Test | HH:MM | HH:MM | Xm | X |
   | Document | HH:MM | HH:MM | Xm | 1 |
   | Retro | HH:MM | HH:MM | Xm | 1 |
   | **Totalt** | | | **Xm** | |
   ```

5. **Metrikkoppdatering**:

   Oppdater `.dsf/metrics/iterations.md` med komplett rad inkludert tidsbruk per fase.

6. **Prosessforbedring** (AUTOMATISK):

   ### Mønstergjenkjenning
   Sjekk om noen av disse mønstrene oppstår:
   - Samme type feil ≥2 ganger → **Ny sjekkliste-punkt i review.md**
   - Review-funn som burde vært fanget i develop → **Ny verifisering i develop.md**
   - Testdekning under 80% → **Sjekk at test-stubs ble opprettet**
   - Designkrav glemt/utsatt uten dokumentasjon → **Sjekk MoSCoW-sjekkliste**

   ### Automatisk oppdatering
   For hvert identifisert mønster:
   1. Opprett/oppdater learning i `.dsf/learnings/`
   2. **IMPLEMENTER endringen direkte** i relevant skill-fil (.claude/commands/*.md)
   3. Referer learning-nummeret i den oppdaterte sjekklisten: `(LEARNING NNN)`
   4. Logg endringen i retrospektiv-rapporten under "Prosessendringer implementert"

   **VIKTIG**: Ikke bare foreslå — IMPLEMENTER. Selvforbedring betyr at prosessen
   endrer seg selv. Presenter endringene for bruker som informasjon, ikke som spørsmål.

7. **Effektivitetsanalyse**:
   Sammenlign med forrige iterasjon(er) fra `.dsf/metrics/iterations.md`:
   - Ble det færre review-funn? (mål: ≤forrige)
   - Ble testdekningen bedre ved første runde? (mål: ≥80%)
   - Ble noen learnings brukt aktivt? (sjekk logg)
   - Gikk det raskere? (sammenlign total tid)

   Hvis ja → prosessforbedringene fungerer. Hvis nei → analyser hvorfor.

8. **Generer retrospektiv-rapport**:

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

9. **Lukk iterasjonen**:
   - Oppdater iterasjonslogg med `RETRO ✅` og `ITERASJON KOMPLETT`
   - Informer bruker om nøkkelfunn og foreslåtte forbedringer

## Selvforbedringsloop
```
Feil → Analyse → Læring → Prosessendring → Færre feil
```

Brukerens input: $ARGUMENTS
