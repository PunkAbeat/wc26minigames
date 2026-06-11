# Milestone 001 — Migration + virality foundation

**Status: done** (10–11 Jun 2026, branch `tanstack-migration`, commits `5ba11bf..22f50d0`)

## Goal

Take the finished static ANTHEM prototype and turn it into a deployable, measurable, share-optimized app without changing gameplay.

## Was in scope — all delivered

- TanStack Start app in `app/` (hub `/`, ANTHEM `/anthem`), Cloudflare Workers config, originals frozen as reference
- Parity-locked port: pure-TS game logic + imperative engines + full UI, localStorage keys unchanged
- Test system: 43 vitest tests (incl. data parity vs the original file) + 9 headless-Chrome behavioral suites + CI
- Virality loop: canvas share card, OG unfurl, lifetime stats panel, global "X% solved it" (D1)
- Analytics: first-party cookieless funnel + CF Web Analytics hook
- Polish: SFX/GOAL flash/flag reveal, PWA identity, self-hosted fonts, per-anthem start offsets
- Tailnet serving made reboot-proof (`wc26-preview.service`)

## Was out of scope

Deploying anywhere; domain; R2 audio; auth/leaderboards; new gameplay.

## Completion criteria — met

All gates green; original files byte-identical; owner verified the base app on-device 11 Jun. (The polish-pass device check rolled into milestone 002.)
