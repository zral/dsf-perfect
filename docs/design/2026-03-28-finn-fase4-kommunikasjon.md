# Design: FINN.no Klone — Fase 4 (Kommunikasjon)

**Dato**: 2026-03-28
**Forfatter**: DSF
**Status**: Under review
**Iterasjon**: [Intake-logg](../../.dsf/logs/2026-03-28-finn-fase4-intake.md)

## Sammendrag

Meldingssystem mellom kjøper og selger knyttet til annonser. REST API for meldingshistorikk og WebSocket for sanntidslevering. "Kontakt selger"-knapp starter ny samtale fra annonsevisning. Ulest-teller i navigasjon.

## Bakgrunn og motivasjon

En markedsplass uten kommunikasjon er halvferdig. Kjøpere må kunne kontakte selgere, og selgere må se henvendelser. Sanntid (WebSocket) gir en god chat-opplevelse.

## Krav

### Must have
- Conversation-modell: en samtale per unik (kjøper, selger, annonse)-kombinasjon
- Send melding i en samtale
- Liste samtaler for innlogget bruker (med siste melding og ulest-telling)
- Hent meldinger i en samtale (paginert)
- Marker meldinger som lest
- "Kontakt selger"-knapp i annonsevisning (starter samtale)
- Frontend: meldingsoversikt og chat-vindu
- WebSocket for sanntidslevering av nye meldinger
- Ulest-teller i Header/BottomNav

### Should have
- Rate limiting på suggest (tech-debt)
- Typing-indikator via WebSocket
- Tidsstempel-gruppering i chat

### Could have
- Push-varsler (Fase 5 PWA)
- Blokkering av brukere
- Rapportering av meldinger

### Won't have (Fase 4)
- Filvedlegg i meldinger
- Gruppesamtaler
- Videochat

## Arkitektur

### Datamodell

```sql
-- conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ad_id, buyer_id, seller_id)
);

-- messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_conversations_ad ON conversations(ad_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
```

### Samtale-deduplisering

En samtale er unik per (ad_id, buyer_id, seller_id). Når kjøper kontakter selger om en annonse:
1. Sjekk om samtale allerede finnes → returner eksisterende
2. Hvis ikke → opprett ny

Selger kan ikke starte samtale med seg selv. buyer_id er alltid den som IKKE eier annonsen.

### Komponentdesign — Backend
```
app/
├── models/
│   ├── conversation.py    → Conversation modell
│   └── message.py         → Message modell
├── schemas/
│   └── message.py         → ConversationResponse, MessageCreate, MessageResponse
├── services/
│   └── message_service.py → CRUD, conversations, unread count
├── routers/
│   └── messages.py        → REST + WebSocket endpoints
```

### Komponentdesign — Frontend
```
src/
├── types/
│   └── message.ts         → Conversation, Message types
├── hooks/
│   └── useMessages.ts     → REST hooks + WebSocket hook
├── components/
│   └── messages/
│       ├── ConversationList.tsx  → Samtaler med siste melding
│       ├── ChatWindow.tsx        → Meldingsvindu
│       ├── MessageBubble.tsx     → Enkelt meldingsboble
│       └── ChatInput.tsx         → Input med send-knapp
├── app/
│   └── messages/
│       ├── page.tsx              → Meldingsoversikt
│       └── [id]/page.tsx         → Samtale
```

### API-kontrakter

```
GET /api/v1/messages/conversations (auth required)
Response: [
  {
    "id": "uuid",
    "ad": { "id", "title", "images": [first_image] },
    "other_user": { "id", "name", "avatar_url" },
    "last_message": { "content", "created_at", "sender_id" },
    "unread_count": 3,
    "updated_at": "datetime"
  }
]
Sortert: nyeste aktivitet først

GET /api/v1/messages/conversations/{id} (auth required, deltaker)
Response: {
  "conversation": ConversationResponse,
  "messages": [MessageResponse],  // nyeste først, paginert
  "total": int,
  "page": int
}
Side-effect: marker meldinger fra andre som lest

POST /api/v1/messages (auth required)
Request: { "conversation_id": "uuid" | null, "ad_id": "uuid", "content": "str (1-2000)" }
Response: MessageResponse (201)
Logikk:
  - Hvis conversation_id: send i eksisterende samtale
  - Hvis bare ad_id: finn-eller-opprett samtale, send melding

GET /api/v1/messages/unread-count (auth required)
Response: { "count": int }

WS /api/v1/messages/ws?token=<jwt> (auth via query param)
Meldingsformat inn: { "type": "message", "conversation_id": "uuid", "content": "str" }
Meldingsformat ut: { "type": "new_message", "message": MessageResponse }
                   { "type": "messages_read", "conversation_id": "uuid" }
```

**MessageResponse**:
```json
{
  "id": "uuid",
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "content": "str",
  "is_read": false,
  "created_at": "datetime"
}
```

### WebSocket-arkitektur

```
[Bruker A]  ←→  [WS /messages/ws]  ←→  [In-memory connection manager]
[Bruker B]  ←→  [WS /messages/ws]  ←→  [                            ]

1. Klient kobler til med JWT i query param
2. Server verifiserer token, registrerer connection med user_id
3. Når melding sendes via WS:
   - Lagres i DB via message_service
   - Pushes til mottaker via connection manager (hvis online)
   - Pushes bekreftelse tilbake til sender
4. Ved disconnect: fjern fra connection manager
```

```python
class ConnectionManager:
    def __init__(self):
        self.connections: dict[uuid.UUID, list[WebSocket]] = {}

    async def connect(self, user_id, websocket):
        await websocket.accept()
        self.connections.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id, websocket):
        self.connections.get(user_id, []).remove(websocket)

    async def send_to_user(self, user_id, message: dict):
        for ws in self.connections.get(user_id, []):
            await ws.send_json(message)
```

## Sikkerhetsvurdering

- **Autorisasjon**: Kun deltakere i samtale kan se/sende meldinger
- **WS auth**: JWT i query param (akseptabelt for WebSocket, token kortlivet)
- **Input-validering**: content 1-2000 tegn, trimmet
- **Rate limiting**: Suggest 10/min (tech-debt). Melding-sending: 30/min per bruker
- **Kan ikke kontakte seg selv**: seller_id != buyer_id sjekk

## Testplan

| # | Scenario | Type | Forventet resultat |
|---|----------|------|--------------------|
| 1 | Kontakt selger — opprett samtale og send melding | Integration | 201, samtale opprettet |
| 2 | Send melding i eksisterende samtale | Integration | 201, melding lagt til |
| 3 | Kontakt selger igjen — gjenbruk samtale | Integration | 200, samme conversation_id |
| 4 | Kontakt seg selv (eier annonsen) | Integration | 400 Bad Request |
| 5 | Liste samtaler — inkluderer siste melding og ulest-count | Integration | 200, komplett data |
| 6 | Hent samtale — meldinger i rekkefølge | Integration | 200, sortert |
| 7 | Hent samtale — marker meldinger som lest | Integration | is_read = true |
| 8 | Hent andres samtale | Integration | 403 Forbidden |
| 9 | Send melding uten auth | Integration | 401 |
| 10 | Send tom melding | Integration | 422 |
| 11 | Hent ulest-telling | Integration | 200, korrekt count |
| 12 | Send melding til ikke-eksisterende samtale | Integration | 404 |

## Implementeringsplan

1. Backend: Conversation + Message modeller
2. Backend: Message schemas
3. Backend: Message service
4. Backend: Message REST router + suggest rate limiting
5. Backend: WebSocket endepunkt + ConnectionManager
6. Backend: Test-stubs (PE3)
7. Backend: Test-implementasjon
8. Frontend: Message types + useMessages hook
9. Frontend: ConversationList, ChatWindow, MessageBubble, ChatInput
10. Frontend: /messages sider
11. Frontend: "Kontakt selger" i AdDetail
12. Frontend: Ulest-teller i Header/BottomNav

### Avhengighetsgraf og parallellisering

```
Lag 1 (ingen avhengigheter):
  ├── [1] Conversation + Message modeller
  └── [8] Frontend: Message types

Lag 2:
  ├── [2] Message schemas         ← [1]
  └── [9] Frontend: Chat-komponenter ← [8]

Lag 3:
  ├── [3] Message service          ← [1, 2]
  ├── [6] Test-stubs               ← [2]
  └── [10] Frontend: /messages     ← [8, 9]

Lag 4:
  ├── [4] REST router              ← [3]
  ├── [5] WebSocket                ← [3]
  └── [11] "Kontakt selger"       ← [8]

Lag 5:
  ├── [7] Test-implementasjon     ← [4, 5, 6]
  └── [12] Ulest-teller           ← [8]
```

**Parallellisering:**
- Lag 1: Backend modeller [1] og frontend types [8] samtidig
- Lag 3: Service [3], test-stubs [6], og frontend sider [10] kan overlappende
- Lag 4: REST [4], WebSocket [5], og "Kontakt selger" [11] parallelt

## Referanser
- Spesifikasjon: [finn.md](../../finn.md)
- Tech-debt: [tech-debt.md](../../.dsf/logs/tech-debt.md)
