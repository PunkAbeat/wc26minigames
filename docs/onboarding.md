# Onboarding (humans)

Five minutes to productive.

## What this is

Daily World Cup 2026 mini games; one live game (ANTHEM, an anthem-guessing daily). [product.md](product.md) has the pitch, [games/anthem/HANDOFF.md](../games/anthem/HANDOFF.md) the full design story.

## Repo shape

The app is `app/` (TanStack Start → Cloudflare Workers). The root `index.html` + `games/anthem/index.html` are the **frozen original prototypes** — behavioral reference, never edited. `docs/` is this documentation system; start at [process/progress.md](process/progress.md) for what's happening now.

## Setup

```sh
cd app
npm install
npm run dev          # http://localhost:3000
```

Full command table + test system: [engineering.md](engineering.md). The everyday loop is: change → `npm run typecheck && npm test && npm run build` → `sudo systemctl restart wc26-preview` → `npm run test:headless`.

## On-device testing

iOS Safari is the primary target. Production build is always live on the tailnet: new app at `https://mini-lubuntu.tail4e976f.ts.net:8443/`, original at `:8444/wc26minigames/`.

## Where decisions live

Durable decisions: [adr/](adr/README.md). Open questions (don't decide silently): [research/questions.md](research/questions.md). Current state + risks: [agents/current-handoff.md](agents/current-handoff.md). Game design: HANDOFF.md.
