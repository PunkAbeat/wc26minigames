# Milestone 002 — Go live

**Status: in progress** (started 11 Jun 2026)

## Goal

ANTHEM publicly reachable on a real domain during the tournament window (ends 19 Jul 2026 — every day of delay costs audience), measured from day one, robust enough to survive a traffic spike.

## In scope

- Owner device pass → merge `tanstack-migration` → master
- Domain + Cloudflare deploy (real D1, AE dataset, `VITE_SITE_ORIGIN`, beacon token) via `npm run deploy` (uses `build:prod`)
- R2 audio re-hosting with archive.org fallback; QA pass on the three flagged recordings
- FIFA-wording legal pass; one-paragraph privacy note
- Error monitoring
- First distribution push

## Out of scope

Auth, leaderboards, second game, monetization, abuse hardening beyond what ships.

## Completion criteria

Public URL serving the game on its own domain; a stranger can play, share, and the share link unfurls with the card; global stats and the event funnel visibly accumulating in production; CI green on master; rollback documented (worker versions).
