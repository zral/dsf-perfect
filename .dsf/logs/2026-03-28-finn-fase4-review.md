# Code Review: FINN.no Fase 4 — Kommunikasjon
Dato: 2026-03-28
Reviewer: DSF Automated Review

## Sammendrag

Fase 4 implementerer meldingssystem med Conversation/Message-modeller, REST API, WebSocket-stotte, og en komplett frontend med samtale-liste, chat-vindu og "Kontakt selger"-funksjon. 12 integrasjonstester dekker alle scenarier fra testplanen. Koden er velstrukturert og folger eksisterende konvensjoner.

## Integrasjonssjekk (LEARNING 001, 007)

| # | Frontend-kall | Backend-endepunkt | Metode | Datatyper | Status |
|---|--------------|-------------------|--------|-----------|--------|
| 1 | `api.get("/api/v1/messages/conversations")` | `GET /api/v1/messages/conversations` | GET | - | OK |
| 2 | `api.get("/api/v1/messages/conversations/${id}")` | `GET /api/v1/messages/conversations/{conversation_id}` | GET | UUID i path | KRITISK |
| 3 | `api.post("/api/v1/messages", req)` | `POST /api/v1/messages/` | POST | ad_id: UUID, content: string | OK |
| 4 | `api.get("/api/v1/messages/unread-count")` | `GET /api/v1/messages/unread-count` | GET | - | OK |
| 5 | `WebSocket /api/v1/messages/ws?token=` | `WS /api/v1/messages/ws` | WS | JWT i query | OK |
| 6 | Ingen manuell Content-Type | - | - | - | OK (LEARNING 007) |

**K1 - Respons-mismatch pa GET /conversations/{id}:** Frontend `ConversationDetail`-typen forventer `{ conversation, messages, total, page }`, men backend returnerer kun `{ messages, total, page }` uten `conversation`-feltet. `ChatWindow.tsx` aksesserer `data.conversation` (linje 74, 98, 106) som vil vaere `undefined`. Frontend vil vise "Samtalen ble ikke funnet" i stedet for chatten.

## Krav-sporbarhet (LEARNING 002)

### Must have — status
| Krav | Status |
|------|--------|
| Conversation-modell (unik per ad/buyer/seller) | Implementert |
| Send melding i samtale | Implementert |
| Liste samtaler med siste melding og ulest-telling | Implementert |
| Hent meldinger i samtale (paginert) | Implementert |
| Marker meldinger som lest | Implementert |
| "Kontakt selger"-knapp i annonsevisning | Implementert |
| Frontend: meldingsoversikt og chat-vindu | Implementert |
| WebSocket for sanntidslevering | Implementert |
| Ulest-teller i Header/BottomNav | Implementert |

### Should have — utsatt/implementert
| Krav | Status |
|------|--------|
| Rate limiting pa suggest (tech-debt) | Ikke implementert — allerede i tech-debt.md |
| Typing-indikator via WebSocket | Ikke implementert — bor dokumenteres som tech-debt |
| Tidsstempel-gruppering i chat | Implementert (ChatWindow.tsx `groupMessagesByDate`) |

## Funn

### Kritisk

**K1: Frontend-backend respons-mismatch pa GET /conversations/{id} (LEARNING 001)**

Frontend `ConversationDetail` definerer:
```typescript
export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
  total: number;
  page: number;
}
```

Backend `get_conversation_messages` returnerer:
```python
return {
    "messages": [...],
    "total": result["total"],
    "page": result["page"],
}
```

`conversation`-feltet mangler i backend-responsen. `ChatWindow.tsx` aksesserer `data.conversation.ad.id`, `data.conversation.other_user.name` etc. som vil feile.

**Fiks:** Backend maa inkludere `conversation`-data i responsen, eller frontend maa hente det separat.

### Viktig

**V1: WebSocket sender dobbelt til avsender via REST + WS**

I `send_message` REST-endepunktet (messages.py linje 104-118): Etter at en melding sendes via REST, pushes den ogsaa via WebSocket til mottakeren. Men hvis avsenderen ogsaa har en aktiv WebSocket-tilkobling, kan `send_to_user` i WS-handlerne sende melding tilbake til sender igjen. Sender-klienten kan da motta duplikater (en via REST response + en via WS).

**V2: WebSocket-meldinger committes etter sending**

I WebSocket-handteren (linje 159-195): `await db.commit()` skjer ETTER `await websocket.send_json(msg_data)`. Hvis commit feiler, har klienten allerede mottatt en "sendt"-bekreftelse for en melding som faktisk ble rullet tilbake.

**V3: Should have "Typing-indikator" og "Rate limiting pa meldinger (30/min)" ikke dokumentert som tech-debt (LEARNING 002)**

Design-doc spesifiserer rate limiting pa meldinger (30/min per bruker) og typing-indikator som Should have. Ingen av disse er implementert, og de er ikke dokumentert i tech-debt.md.

### Forslag

**F1: N+1-sporringsmoenster i `list_conversations`**

`list_conversations` i message_service.py henter alle samtaler, deretter gjor 2 ekstra DB-sporringer per samtale (last_message + unread_count). Med mange samtaler kan dette bli et ytelsesproblem. Kan loses med subquery i main-sporringen.

**F2: `from sqlalchemy import select` importert inne i funksjonsblokk**

I messages.py linje 107 og 179 importeres `select` og `Conversation` inne i funksjonskroppen. Bor flyttes til toppen av filen.

## Sjekkliste

- [x] Implementerer koden det designet spesifiserer? (med unntak av K1)
- [x] Handteres edge cases? (tom melding, selv-kontakt, uautorisert)
- [x] Er feilhandtering tilstrekkelig?
- [ ] Fungerer koden korrekt med eksisterende kode? (K1: respons-mismatch)
- [x] Matcher frontend API-kall faktiske backend-endepunkter?
- [x] Er HTTP-metoder korrekte?
- [ ] Matcher request/response-formater? (K1)
- [x] Datatype-match (LEARNING 007): UUID-er sendes korrekt som strings
- [x] Ingen manuell Content-Type (LEARNING 007)
- [x] Alle Must have implementert
- [ ] Utsatte Should have dokumentert (V3)
- [x] Input validert (content 1-2000 tegn via Pydantic)
- [x] Autentisering korrekt (JWT-basert, WebSocket med query param)
- [x] Autorisasjon sjekket (deltaker-sjekk)
- [x] Ingen secrets i kode
- [x] Ingen deprecated API-er (datetime.now(timezone.utc) brukt konsistent)
- [x] 12 tester dekker alle 12 testplan-scenarier
- [x] Koden er lesbar og folger konvensjoner

## Verdict

**AVVIST** — K1 (respons-mismatch) maa fikses for godkjenning. Frontend-chatten vil ikke fungere med navaerende backend-respons.
