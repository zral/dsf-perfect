# Next.js dev mode fungerer ikke fra andre enheter (mobil/LAN)
Dato: 2026-03-28
Kategori: kode

## Kontekst
Next.js dev mode (npm run dev) bruker HMR WebSocket som krever direkte tilkobling til dev-serveren. Fra andre enheter på LAN (mobil via IP) feiler WebSocket, som blokkerer React hydration. Resultatet: framer-motion animasjoner med initial={{ opacity: 0 }} forblir usynlige, og interaktivitet mangler.

## Læring
Docker-frontend MÅ kjøre production build (npm run build + npm start) for å fungere fra andre enheter. Dev mode er kun for localhost-utvikling.

## Tiltak
1. Frontend Dockerfile bruker multi-stage build: build → prod
2. Aldri bruk `npm run dev` i Docker for testing fra andre enheter
3. Alle kall må gå via nginx (port 80), ikke direkte til Next.js (port 3000)

## Relevans
Nøkkelord: Next.js, dev mode, HMR, WebSocket, mobil, LAN, Docker, production build, framer-motion, opacity, hydration
