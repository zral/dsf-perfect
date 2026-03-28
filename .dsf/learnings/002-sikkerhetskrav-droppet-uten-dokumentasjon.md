# Sikkerhetskrav fra design droppet uten dokumentasjon
Dato: 2026-03-28
Kategori: sikkerhet

## Kontekst
Designdokumentet spesifiserte rate limiting (5 forsok/min login, 3/min register) og strukturert logging med correlation IDs. Begge ble fullstendig ignorert under utvikling. Det fantes ingen TODO-kommentarer, ingen backlog-oppforing, og ingen eksplisitt beslutning om utsettelse. Redis var til og med inkludert i Docker Compose spesifikt for rate limiting, men ble aldri brukt.

## Laering
Nar et designkrav er for komplekst til a implementere i en fase, er det fristende a bare hoppe over det. Men uten eksplisitt dokumentasjon av utsettelsen forsvinner kravet — ingen vet at det ble droppet, og det dukker kanskje aldri opp igjen. Dette er spesielt farlig for sikkerhetskrav.

## Tiltak
- Innfor en "bevisst utsettelse"-regel: ethvert designkrav som ikke implementeres MA dokumenteres som teknisk gjeld med begrunnelse og planlagt fase.
- Develop-fasen bor inkludere en sjekkliste-gjennomgang av designdokumentets krav for a fange utelatelser.
- Legg til et "Utsatte krav"-seksjon i iterasjonsloggen.

## Relevans
Rate limiting, sikkerhet, teknisk gjeld, designkrav, kravsporing, utelatelse, brute force
