# MoSCoW-prioritering forhindrer at krav glemmes uten dokumentasjon
Dato: 2026-03-28
Kategori: prosess

## Kontekst
PE2 (MoSCoW + tech-debt) ble introdusert etter Fase 1, der rate limiting og andre sikkerhetskrav ble droppet uten dokumentasjon. I Fase 2 ble MoSCoW brukt i designfasen, og alle utsatte krav (MinIO, underkategorier, strukturert logging, lignende annonser, Redis rate limiter) ble korrekt dokumentert i tech-debt.md med planlagt fase.

Review-rapporten bekrefter: "Alle utsatte krav er korrekt dokumentert i tech-debt.md. Klar forbedring fra Fase 1 (LEARNING 002)."

## Laering
MoSCoW-prioritering i designfasen kombinert med obligatorisk tech-debt-dokumentasjon eliminerer problemet med "stille krav-glemsel". Naar et krav eksplisitt klassifiseres som "Should have" eller "Could have", tvinges utvikleren til a ta en bevisst beslutning om a utsette det, og den beslutningen blir sporbar.

## Tiltak
- Behold PE2 som obligatorisk steg i design-fasen
- Ingen endring nodvendig — fungerer som tiltenkt

## Relevans
MoSCoW, prioritering, teknisk gjeld, kravsporing, design-fase, prosessforbedring
