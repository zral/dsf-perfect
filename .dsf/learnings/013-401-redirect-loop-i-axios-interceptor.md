# 401 redirect-loop i axios interceptor
Dato: 2026-03-28
Kategori: kode

## Kontekst
Axios response interceptor redirectet til /login ved 401 (window.location.href = "/login"). Header-komponenten brukte useUnreadCount() som kalte API uten auth-token → 401 → redirect → /login laster Header → useUnreadCount → 401 → redirect = uendelig loop.

## Læring
ALDRI redirect til /login i en global API interceptor. Komponenter som kjører på ALLE sider (Header, layout) må ikke trigge auth-avhengige API-kall uten guard. La komponentene selv håndtere auth-state i stedet.

## Tiltak
1. Fjern window.location.href fra axios interceptor — bare clearTokens()
2. Alle React Query hooks som krever auth MÅ ha `enabled: !!token` guard
3. Bruk auth-state i komponenter for å vise/skjule innhold, ikke redirects i API-laget

## Relevans
Nøkkelord: axios, interceptor, 401, redirect, login, loop, useAuth, Header, layout, global komponent, React Query enabled
