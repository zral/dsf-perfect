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

2. **Opprett test-stubs fra testplanen** (PROSESSFORBEDRING PE3):
   **FØR du skriver noen implementasjonskode**, opprett tomme testfunksjoner
   for ALLE scenarier i designets testplan. Marker med `pytest.skip`:

   ```python
   @pytest.mark.asyncio
   async def test_scenario_fra_testplan(async_client):
       """<Beskrivelse fra testplan>"""
       pytest.skip("Not implemented yet — stub fra testplan")
   ```

   Dette gjør manglende testdekning **synlig under utvikling**, ikke først i test-fasen.
   Fyll inn test-implementasjon underveis i TDD-syklusen.

   **Commit test-stubs separat**: `test(<scope>): test-stubs fra testplan for <feature>`

3. **TDD-syklus** for hver oppgave:
   ```
   RED:   Skriv en feilende test som definerer ønsket oppførsel
   GREEN: Skriv minimalt med kode for å få testen til å passere
   REFACTOR: Forbedre koden uten å endre oppførsel
   ```

4. **Utviklingsregler**:
   - Én oppgave om gangen fra dekomponert liste
   - Atomiske, selvstendige commits per oppgave
   - Følg eksisterende kodekonvensjoner
   - Ingen snarveier på sikkerhet
   - Ikke endre kode utenfor scope

5. **For hver implementert oppgave — separat commit**:
   - Kjør eksisterende tester — ingenting skal brekke
   - Kjør nye tester — alle skal passere
   - Verifiser at koden matcher designet
   - **VIKTIG**: Commit SEPARAT per tema/oppgave. Aldri samle flere temaer i én commit.
   - Commit-format: `<type>(<scope>): <beskrivelse>\n\nRefs: <design-doc>`
   - Eksempel: Hvis du implementerer auth OG brukerprofil, det er to separate commits

6. **Smoke test: frontend↔backend integrasjon** (PROSESSFORBEDRING PE1):
   **FØR du markerer develop som ferdig**, verifiser at:
   - Alle frontend API-kall (`api.get()`, `api.post()`, etc.) matcher faktiske backend-endepunkter
   - Sjekk: for hvert kall i frontend `lib/`, `stores/`, og `hooks/`:
     1. Endepunktet eksisterer i backend `routers/`
     2. HTTP-metoden er korrekt (GET/POST/PATCH/DELETE)
     3. Request body matcher backend Pydantic schema
     4. Response brukes korrekt i frontend
   - Hvis backend har OpenAPI: kjør `curl localhost:8000/openapi.json` og kryssjekk

   Logg resultat i iterasjonsloggen:
   ```markdown
   ## Smoke Test: Frontend↔Backend
   | Frontend kall | Backend endepunkt | Match |
   |--------------|-------------------|-------|
   | api.post("/api/v1/auth/login") | POST /api/v1/auth/login | ✅ |
   ```

7. **Dokumenter utsatte krav** (PROSESSFORBEDRING PE2):
   Sjekk design-doc MoSCoW-prioriteringen. For alle "Should have" som IKKE ble implementert:
   - Legg til TODO-kommentar i relevant kode
   - Opprett/oppdater `.dsf/logs/tech-debt.md`:
     ```markdown
     | Krav | Prioritet | Kilde | Planlagt fase | Dato |
     |------|-----------|-------|---------------|------|
     | Rate limiting | Should | design-doc Fase 1 | Fase 2 | 2026-03-28 |
     ```

8. **Oppdater iterasjonslogg**:
   - Merk oppgaver som fullført
   - Loggfør eventuelle avvik fra design (og hvorfor)
   - Status: `DEVELOP ✅` når alle oppgaver er implementert

9. **Avviksprotokoll**:
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
