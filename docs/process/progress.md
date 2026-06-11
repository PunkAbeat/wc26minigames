# Progress

Statuses: `todo` · `in_progress` · `blocked` · `done`. One line per item; durable detail belongs in the linked source doc, not here.

**Active milestone:** [002 — Go live](milestones/002-go-live.md)

## Milestone 002 — Go live

| Item | Status | Notes |
|---|---|---|
| Owner on-device pass of polish (SFX/flash/PWA/offsets) | in_progress | base app verified 11 Jun; owner approved merge |
| Merge `tanstack-migration` → master + push to GitHub | done | merged 75f1ef3; remote github.com/PunkAbeat/wc26minigames (public), CI running |
| Production domain | done | wc26minigames.com bought + routed (apex & www custom domains on the worker) |
| Cloudflare deploy (worker + real D1 id + AE dataset) | done | **LIVE 11 Jun** — D1 3622f763 migrated, AE dataset enabled, version 58b2d706; smoke-tested (routes, audio, OG, APIs, test hooks 404) |
| Set `VITE_SITE_ORIGIN` (activates og:image) | done | app/.env.production → https://wc26minigames.com |
| CF Web Analytics | done | enabled via zone **auto-injection** (verified in live DOM) — no token needed; `VITE_CF_BEACON_TOKEN` stays as the fallback for non-proxied hosting |
| Self-hosted audio (trimmed/normalized, archive.org fallback) | done | as Worker static assets instead of R2 — [ADR-0005](../adr/0005-self-hosted-audio-as-worker-assets.md); `npm run deploy` regenerates |
| FIFA-wording legal pass ("World Cup" in titles) | todo | see research/questions.md |
| Error monitoring (Sentry or Worker-side log) | todo | provider undecided |
| QA-listen: Iran + Paraguay (`Removed/` recordings), DR Congo verification | todo | HANDOFF §5 |
| Distribution plan (r/soccer, football TikTok/Twitter, group chats) | todo | product work, not code |
| Owner feedback round 11 Jun (copy, trumpet, OFF TARGET, practice cap 2/day, anthem wiki link, Match #1 = 11 Jun) | done | first deliberate behavior changes post-parity |

## Backlog (not scheduled)

| Item | Notes |
|---|---|
| i18n (EN+ES+FR first) | owner wants full participant coverage — phased plan + open question in [research/questions.md](../research/questions.md) |
| Per-user leaderboards / "friends" comparison | needs auth — deliberately out of scope ([product.md](../product.md)) |
| Second game for the hub | add-a-game checklist in root README |
| Abuse hardening on global stats | only if visibly gamed — [ADR-0004](../adr/0004-anonymous-global-stats-on-d1.md) |
| PostHog upgrade if 2 KPIs stop being enough | [ADR-0003](../adr/0003-first-party-cookieless-analytics.md) |
| Mid-game UTC-midnight rollover edge (state saved under new day) | parity with original; low impact |
| Stats panel: share-your-stats card | nice-to-have |

## Done milestones

- [001 — Migration + virality foundation](milestones/001-migration-and-virality.md) — completed 11 Jun 2026

## How to keep this updated

After meaningful work: flip statuses here; rewrite [agents/current-handoff.md](../agents/current-handoff.md) to match reality; add an ADR **only** for durable decisions (not task notes); when current-handoff detail goes stale, append it to [agents/handoff-log.md](../agents/handoff-log.md) and trim. One source of truth per fact — if it belongs in product/engineering/ADR/HANDOFF, put it there and link it.
