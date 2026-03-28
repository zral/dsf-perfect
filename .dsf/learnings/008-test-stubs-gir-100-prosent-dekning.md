# Test-stubs fra testplan gir dramatisk forbedring i testdekning
Dato: 2026-03-28
Kategori: testing

## Kontekst
PE3 (test-stubs) ble introdusert etter Fase 1 retrospektiv, der testdekning var 54% ved forste runde. I Fase 2 ble test-stubs opprettet fra testplanen FoR implementasjon (commit 6eee14c). Resultat: 19/19 scenarier dekket ved forste test-runde — 100% dekning. Ingen `pytest.skip` gjenstod.

## Laering
Aa opprette tomme test-stubs fra designets testplan for utvikling starter er den mest effektive prosessforbedringen vi har implementert. Det endrer utviklerens tankegang fra "skriv tester for det jeg har bygget" til "bygg det testplanen krever". Forbedringen fra 54% til 100% ved forste runde er dramatisk.

## Tiltak
- Behold PE3 som obligatorisk steg i develop-fasen
- Vurder a utvide til frontend-tester naar E2E-testing innfores
- Test-stubs bor ALLTID committes separat for a kunne spore dekning

## Relevans
TDD, testdekning, test-stubs, testplan, pytest, develop-fase, prosessforbedring
