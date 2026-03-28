# ADR-0001: JWT Auth-strategi

**Dato**: 2026-03-28
**Status**: Foreslått

## Kontekst

Applikasjonen trenger autentisering. Vi må velge mellom session-basert auth og token-basert auth, og definere token-strategien.

## Alternativer vurdert

### Alternativ A: Session-basert (cookies)
- Fordeler: Enklere CSRF-håndtering med httpOnly cookies, automatisk utløp, server-side invalidering
- Ulemper: Krever session store (Redis), ikke ideelt for PWA/offline, vanskelig med flere backends

### Alternativ B: JWT med access + refresh tokens
- Fordeler: Stateless API (skalerbart), fungerer godt med PWA, standard i moderne SPAs, ingen session store nødvendig for access tokens
- Ulemper: Kan ikke invalidere access tokens før utløp, mer kompleks token management på klient

### Alternativ C: JWT uten refresh tokens
- Fordeler: Enklest implementasjon
- Ulemper: Lang token-levetid = sikkerhetrisiko, kort levetid = dårlig UX (hyppig re-login)

## Beslutning

Vi velger **Alternativ B: JWT med access + refresh tokens** fordi:
- PWA krever token-basert auth for offline-kapasitet
- Stateless access tokens gir horisontal skalerbarhet
- Refresh token rotation gir god sikkerhet
- Standard mønster med god bibliotek-støtte

### Detaljer
- Access token: HS256, 15 min levetid, i minne (ikke localStorage)
- Refresh token: Opaque UUID, 7 dager, hashet i PostgreSQL
- Rotation: Ny refresh token ved hver refresh, gammel invalideres
- Revokering: Alle refresh tokens for en bruker kan invalideres (logout everywhere)

## Konsekvenser

### Positive
- Skalerbar, stateless auth for API
- God PWA-kompatibilitet
- Refresh token rotation gir god sikkerhet

### Negative
- Access tokens kan ikke invalideres før utløp (15 min vindu)
- Klient må håndtere token refresh-logikk
- Refresh tokens krever DB-lookup

### Risiko
- Race condition ved concurrent refresh requests → mitigeres med grace period (30s)
