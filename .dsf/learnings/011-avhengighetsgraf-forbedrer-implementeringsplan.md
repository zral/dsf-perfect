# Avhengighetsgraf i design-doc gir klarere implementeringsrekkefoelge
Dato: 2026-03-28
Kategori: prosess

## Kontekst
CLAUDE.md ble oppdatert med obligatorisk avhengighetsgraf i design-fasen. Fase 3 var foerste iterasjon der dette kravet var aktivt. Design-doc inneholdt en komplett graf med 4 lag, eksplisitte avhengigheter (← [N] notasjon) og parallelliseringsmuligheter.

Resultatet: Fase 3 hadde 8 commits for funksjoner (mot 10 i Fase 2), tydelig lagvis struktur i commit-rekkefølgen (schemas → service → router → tester → frontend hooks → frontend sider), og 0 revert-commits.

## Laering
En eksplisitt avhengighetsgraf tvinger designeren til aa tenke gjennom implementeringsrekkefoelgen foer koding starter. Dette reduserer ad-hoc-beslutninger under utvikling og gjor det tydeligere hvilke oppgaver som kan parallelliseres. Kombinert med test-stubs (PE3) gir dette en komplett "oppskrift" for develop-fasen.

## Tiltak
- Behold som obligatorisk krav i design.md-skillen (allerede implementert)
- Vurder aa legge til estimert tid per lag i fremtidige iterasjoner

## Relevans
Avhengighetsgraf, design, implementeringsplan, parallellisering, prosessforbedring
