# Intake: FINN.no Klone — Fase 4 (Kommunikasjon)
Dato: 2026-03-28
Status: INTAKE ✅

## Krav
Meldingssystem mellom kjøper og selger. REST API for meldingshistorikk og WebSocket for sanntids-chat. "Kontakt selger"-knapp i annonsevisning.

## Oppgaver
- [ ] 1. Message + Conversation modeller (M)
- [ ] 2. Message schemas (S)
- [ ] 3. Message service — send, list, conversations, mark read (L)
- [ ] 4. Message REST router — /api/v1/messages (M)
- [ ] 5. WebSocket for sanntids-chat (L)
- [ ] 6. Backend tester — meldinger, conversations (L)
- [ ] 7. Frontend: Message types + useMessages hook (S)
- [ ] 8. Frontend: ConversationList (M)
- [ ] 9. Frontend: ChatWindow + MessageBubble + ChatInput (L)
- [ ] 10. Frontend: /messages sider (M)
- [ ] 11. Frontend: "Kontakt selger" i AdDetail (M)
- [ ] 12. Frontend: Ulest-teller i nav (S)

## Teknisk gjeld adressert
- [ ] Suggest rate limiting (10/min)

## Avhengigheter
- Backend 1-5 sekvensielt, frontend 7-12 etter router er klar
- WebSocket avhenger av REST router

## Risiko
| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|--------|---------------|------------|--------|
| WebSocket + Docker | Medium | Blokkering | Nginx WS proxy klar |
| WS auth | Lav | Sikkerhet | Token i query param |
| Samtale-deduplisering | Medium | Doble samtaler | Sortert bruker-pair hash |

## Tidsbruk
| Fase | Start | Slutt | Varighet |
|------|-------|-------|----------|
| Intake | - | - | ~2m |

## Neste steg
→ DESIGN
