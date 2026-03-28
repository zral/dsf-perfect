# Review-prosessen fanger kritiske feil effektivt
Dato: 2026-03-28
Kategori: prosess

## Kontekst
Code review fanget 4 kritiske sikkerhetsfunn, 10 viktige funn og 8 forslag. De kritiske funnene (feil endepunkt, manglende rate limiting, usikker JWT default, manglende server-side logout) ville alle ha forarsakat reelle problemer i produksjon. 3 av 4 ble fikset, og den fjerde ble dokumentert som teknisk gjeld.

## Laering
DSF-prosessens review-fase fungerer som tiltenkt: den fanger feil som utvikleren ikke ser. Verdien ligger i at revieweren er uavhengig og systematisk — den sjekker mot designdokumentet, ser etter sikkerhetsproblemer, og har en lavere terskel for "kritisk" enn utvikleren. Avvisning forste gang er ikke et tegn pa prosessfeil, men pa at sikkerhetsnettet fungerer.

## Tiltak
- Behold review som obligatorisk gate med rett til a avvise.
- Vurder a dele opp review i sikkerhetsfokusert og funksjonell del for storre iterasjoner.
- Bruk review-funn som input til fremtidige sjekklister og learnings.

## Relevans
Code review, prosess, sikkerhetsnett, avvisning, kvalitetssikring, DSF
