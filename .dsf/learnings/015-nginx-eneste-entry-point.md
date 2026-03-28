# Nginx må være eneste entry point for frontend+API
Dato: 2026-03-28
Kategori: arkitektur

## Kontekst
Next.js rewrites til FastAPI forårsaket redirect-loop: Next.js fjerner trailing slash (308), FastAPI legger den til igjen (307), og Location-headeren lekker interne Docker-hostnames (http://api:8000/...). Forsøk på å fikse med skipTrailingSlashRedirect og redirect_slashes=False skapte nye problemer.

## Læring
Ikke prøv å proxy API-kall gjennom Next.js rewrites til FastAPI i Docker. Bruk nginx som eneste entry point — den håndterer /api/* → backend og /* → frontend korrekt uten redirect-problemer.

## Tiltak
1. Frontend bruker tom baseURL i axios (relativ path)
2. Nginx proxyer /api/* til backend, /* til frontend
3. Ingen Next.js rewrites for API — fjern dem helt
4. Alle brukere går via port 80 (nginx)

## Relevans
Nøkkelord: nginx, proxy, Next.js, FastAPI, rewrite, redirect, trailing slash, Docker, baseURL, axios
