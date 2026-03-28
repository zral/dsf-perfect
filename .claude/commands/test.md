---
description: "Kjør og verifiser tester med dekning og rapportering"
---

# DSF Test — Testing og verifisering

Du er i TEST-fasen av DSF Development Loop.

## Instruksjoner

1. **Hent kontekst**:
   - Les design-dokumentet for forventede test-scenarier
   - Les iterasjonsloggen for oppgaveoversikt
   - Identifiser alle nye/endrede tester

2. **Testpyramide** — kjør i rekkefølge:

### Unit-tester
- Kjør alle unit-tester
- Verifiser at alle passerer
- Sjekk dekningsgrad for ny kode

### Integrasjonstester
- Kjør integrasjonstester for berørte moduler
- Verifiser at komponent-interaksjoner fungerer

### End-to-End (hvis relevant)
- Kjør E2E-tester for berørte brukerflyter
- Verifiser at hele verdikjeden fungerer

3. **Dekninsanalyse**:
   - Ny kode: ≥80% dekning
   - Identifiser ukjent/utestet kode
   - Vurder om manglende dekning er akseptabel (begrunn)

4. **Edge case-sjekk**:
   - Tom input / null / undefined
   - Grenseverdier (min, max, 0, -1)
   - Samtidige operasjoner (race conditions)
   - Nettverksfeil / timeout
   - Store datamengder

5. **Generer testrapport**:

Opprett `.dsf/logs/YYYY-MM-DD-<kort-beskrivelse>-test.md`:

```markdown
# Test Report: <tittel>
Dato: <dato>

## Resultat
| Type | Totalt | Bestått | Feilet | Hoppet over |
|------|--------|---------|--------|-------------|
| Unit | X | X | X | X |
| Integration | X | X | X | X |
| E2E | X | X | X | X |

## Dekning
- Ny kode: X%
- Total: X%

## Feilende tester
<detaljer eller "Ingen">

## Udekkede scenarier
<identifiserte gap>

## Verdict
<BESTÅTT / FEILET>
```

6. **GATE: Test Quality**:
   - Hvis feilende tester: **FEILET** → Tilbake til `/develop` for fiks
   - Hvis dekning < 80%: **ADVARSEL** → Presenter for bruker, foreslå tilleggstester
   - Hvis alt grønt: **BESTÅTT** → Videre til dokumentasjon

7. **Oppdater iterasjonslogg** med teststatus

## Neste steg
Etter beståtte tester → `/doc`

Brukerens input: $ARGUMENTS
