# Testdekning langt under krav ved forste runde
Dato: 2026-03-28
Kategori: testing

## Kontekst
Designdokumentets testplan spesifiserte 13 scenarier. Ved forste testkjoring var kun 7 dekket (54%). De manglende 6 inkluderte sikkerhetskritiske scenarier som refresh token reuse-deteksjon og utlopt token-handtering. Etter fiks ble 12/13 dekket (92%).

## Laering
Utvikleren skrev tester for "happy path" og de mest opplagte feilscenarier, men ignorerte testplanen fra designdokumentet. Testplanen eksisterte men ble ikke brukt som sjekkliste under utvikling. Resultatet var at 46% av planlagte scenarier manglet, inkludert sikkerhetskritiske tester.

## Tiltak
- Develop-fasen bor starte med a opprette test-stubs (tomme testfunksjoner med navn) for alle scenarier i testplanen. Da er det synlig hva som mangler.
- Test-agenten bor motta testplanen fra designdokumentet som eksplisitt input, ikke bare koden.
- Vurder a gjore testplan-dekning til et gate-krav for develop-fasen (ikke bare test-fasen).

## Relevans
Testdekning, testplan, TDD, test-stubs, sikkerhetstesting, negative tester, edge cases
