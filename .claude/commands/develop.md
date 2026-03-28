---
description: "Implementer basert på godkjent design med TDD-tilnærming"
---

# DSF Develop — Implementering med TDD

Du er i DEVELOP-fasen av DSF Development Loop.

## Pre-sjekk

**KRITISK**: Før du starter utvikling:
1. Verifiser at det finnes et godkjent design-dokument i `docs/design/`
2. Verifiser at iterasjonsloggen viser `DESIGN ✅`
3. Hvis ikke → informer bruker og foreslå `/design` først

## Instruksjoner

1. **Hent kontekst**:
   - Les godkjent design-dokument
   - Les relevante ADR-er
   - Les `.dsf/learnings/` for kjente fallgruver
   - Forstå eksisterende kode som skal endres

2. **TDD-syklus** for hver oppgave:
   ```
   RED:   Skriv en feilende test som definerer ønsket oppførsel
   GREEN: Skriv minimalt med kode for å få testen til å passere
   REFACTOR: Forbedre koden uten å endre oppførsel
   ```

3. **Utviklingsregler**:
   - Én oppgave om gangen fra dekomponert liste
   - Atomiske, selvstendige commits per oppgave
   - Følg eksisterende kodekonvensjoner
   - Ingen snarveier på sikkerhet
   - Ikke endre kode utenfor scope

4. **For hver implementert oppgave — separat commit**:
   - Kjør eksisterende tester — ingenting skal brekke
   - Kjør nye tester — alle skal passere
   - Verifiser at koden matcher designet
   - **VIKTIG**: Commit SEPARAT per tema/oppgave. Aldri samle flere temaer i én commit.
   - Commit-format: `<type>(<scope>): <beskrivelse>\n\nRefs: <design-doc>`
   - Eksempel: Hvis du implementerer auth OG brukerprofil, det er to separate commits

5. **Oppdater iterasjonslogg**:
   - Merk oppgaver som fullført
   - Loggfør eventuelle avvik fra design (og hvorfor)
   - Status: `DEVELOP ✅` når alle oppgaver er implementert

6. **Avviksprotokoll**:
   Hvis du oppdager at designet ikke fungerer i praksis:
   - STOPP implementering
   - Dokumentér problemet
   - Foreslå designendring til bruker
   - Vent på godkjenning før videre arbeid
   - Oppdater design-doc med endringen

## Anti-mønstre å unngå
- Implementere utover scope ("mens jeg er her kan jeg også...")
- Hoppe over tester for "enkel" kode
- Hardkode verdier for å få tester til å passere
- Ignorere feilende eksisterende tester

## Neste steg
Etter implementering → `/review`

Brukerens input: $ARGUMENTS
