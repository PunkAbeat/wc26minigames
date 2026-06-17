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
| FIFA-wording legal pass ("World Cup" in titles) | done | full de-brand (owner decision 11 Jun): titles/OG/manifest/share text/kickers reworded, disclaimer now on /anthem too, factual hints kept — [ADR-0006](../adr/0006-debranded-copy-nominative-use.md); live 11 Jun (version 4fc0d6c6, verified on prod) |
| Error monitoring | done | first-party: Workers Logs (observability enabled) + client beacon /api/error → console.error, self-capped; verified live via wrangler tail. Sentry = upgrade path if triage outgrows it |
| QA-listen: Iran + Paraguay (`Removed/` recordings), DR Congo verification | done | owner verified all three 11 Jun; DR Congo wired as 46th nation; Qatar/Jordan soft opens nudged 12 Jun (ear-floor offsets in measure-offsets.mjs) — **all QA-listen closed** ([research/qa-listen.md](../research/qa-listen.md)) |
| Distribution plan (r/soccer, football TikTok/Twitter, group chats) | todo | product work, not code |
| Owner feedback round 11 Jun (copy, trumpet, OFF TARGET, practice cap 2/day, anthem wiki link, Match #1 = 11 Jun) | done | first deliberate behavior changes post-parity |
| Feedback round 2: archive mode (previous matches), Esc on modals, hub newsletter capture | done | deployed 11 Jun; D1 subscribers table; suites 10-11; bot defence = honeypot + min-time (**Turnstile deferred until evidence of abuse** — owner decision 11 Jun); junk meter: `SELECT count(*) FROM subscribers` |
| i18n phase 1 (EN+ES+FR) | done | **live 12 Jun** — full UI chrome + share text + ES/FR nation names as guess aliases; lang switcher; SSR stays EN (placeholder-then-fill, no hydration risk) |
| i18n phase 2: 11 languages (+PT/DE/NL/TR, +AR/FA RTL, +JA/KO) + localized share cards + MATCHDAY hub og:image | done | **live 12 Jun** — owner picked top world languages ∩ WC26 participants; per-lang string files (typed completeness); native-name dropdown; <html dir> RTL with the audio player pinned LTR; 48 nations named in all 11 langs as guess aliases. **AR/FA/JA/KO are machine-written — need native-speaker review before promoting those locales** |
| Stats share card ("Share my record" in stats modal) | done | live 12 Jun; tracked as share_clicked{mode:stats} |
| Mid-game UTC-midnight rollover edge | done | fixed 12 Jun — daily game pins its day at start (save/streak/global-stats all use it) |
| Uncap free play (drop practice 2/day cap) | done | owner decision 12 Jun — practice rebranded "Free play — every anthem" in all 11 langs, offered after every finished game; daily match stays the headline (streaks/shares unchanged) — [ADR-0007](../adr/0007-uncapped-free-play.md) |
| Clip opening too short (user feedback) | done | 13 Jun, two passes — [1,2,4,7,11,16] → [2,3,5,8,12,16], then reshaped on day-1 data (n=17: zero solves below 4s, 47% lost) → **[4,7,11,16,22,30]**; shortest trimmed anthem ~35s so 30 fits all; how-to copy updated in all 11 langs |
| GROUPS prototype (game #2) | scrapped | owner picked GROUPS 12 Jun, prototype built same day, owner played it on the tailnet preview and **scrapped it the same evening** ("feels really boring") — never deployed; code reverted (recoverable from history). Lesson + round-3 slate in the [game-2 brainstorm](../research/game2-brainstorm.md) |
| **Game #2 = FLAG SORT** | in_progress | SQUAD parked 13 Jun; owner picked **FLAG SORT** (water-sort → build country flags). Iterated to a polished procedural-liquid mock, then all 48 nations + difficulty ladder; owner chose **campaign + play-your-nation** (not daily). **Graduated into the app 13 Jun** (`3726036`): real route `/flagsort`, live hub card 🎌, engine ported verbatim, campaign progress in localStorage, English-first copy. **Real official flags + fill-to-reveal 13 Jun** (`db7ebdc`/`ed1b3fc`): all 48 flag SVGs vendored from flagcdn (PD) under `app/public/flags/`; grid uses real artwork; in-play, pouring each region unmasks the real flag underneath (settling to official on win) — hard emblem flags (Mexico eagle, Ecuador condor, coats of arms/script) now perfect, flag-accuracy concern largely resolved. **Share card 13 Jun** (`36890d6`): "Share my N/48" → 1200×630 collection-wall PNG of the real flags built + native share / clipboard fallback, tracked `share_clicked{mode:flagsort}`. All gates green — **not deployed**. Remaining: in-game i18n, headless suite #12. Design history in [game2-brainstorm.md](../research/game2-brainstorm.md); `build:prod` strips `dist/client/mock` |
| **Game #3 = KEEPIES** | done | BREAKAWAY (Dino-style runner) parked 15 Jun; owner picked a **Doodle-Jump football climber**. Iterated mock→approved: flag-wrapped bouncing ball, touch+arrow steer, 5 platform types, **48 distinct courses** (each flag's platform layout traces its geometry, *not* difficulty — so heights aren't comparable across nations, dissolving the "which nation wins" problem; nation = identity, not ranking), best-height per flag + course-select grid, **pure free-play**, punt trail + trophy-at-the-top. **Graduated into the app 15 Jun**: real route `/keepies` (fullscreen immersive), live hub card ⚽ (custom `BallMark` SVG), engine ported verbatim to `src/lib/keepies/game.ts`, per-flag best in localStorage, `keepies_tagline`+`badge_freeplay` in 11 langs, English-first in-game copy. All gates green (build, typecheck, 60 vitest, 11 headless), CDP-verified the route plays + best persists + 0 exceptions — **not deployed** (owner on-device check pending). **Polish since graduation (17 Jun):** gold-ball icon (hub + wordmark), desktop portrait column + tidy chrome, clean turf platforms, live per-nation best in HUD; **OG image** (public/og/keepies.png), **share card** (stadium-climb, share_clicked{mode:keepies}), **full in-game i18n** (all 11 langs; ar/fa/ja/ko machine-written, flagged), **synthesized sound** + mute toggle, **headless suite #13** (22 assertions via `window.__kp`/`__kpSet`; runner drives `/keepies`). **Deployed 17 Jun** (version `f5cf313f`) — smoke-tested on prod (route + OG + ball assets 200, mock stripped). No remaining KEEPIES work. Design: Direction B in [game3-brainstorm.md](../research/game3-brainstorm.md); `build:prod` strips the mock |

## Backlog (not scheduled)

| Item | Notes |
|---|---|
| i18n phase 3 | per-nation hints/verdicts (48 × 10 of editorial content), og/meta per locale, native review of ar/fa/ja/ko |
| Per-user leaderboards / "friends" comparison | needs auth — deliberately out of scope ([product.md](../product.md)) |
| Third game for the hub | crowd-powered candidates (TOP BINS, RARE PICK) parked until real traffic — [research/game2-brainstorm.md](../research/game2-brainstorm.md); add-a-game checklist in root README |
| Abuse hardening on global stats | only if visibly gamed — [ADR-0004](../adr/0004-anonymous-global-stats-on-d1.md) |
| PostHog upgrade if 2 KPIs stop being enough | [ADR-0003](../adr/0003-first-party-cookieless-analytics.md) |

## Done milestones

- [001 — Migration + virality foundation](milestones/001-migration-and-virality.md) — completed 11 Jun 2026

## How to keep this updated

After meaningful work: flip statuses here; rewrite [agents/current-handoff.md](../agents/current-handoff.md) to match reality; add an ADR **only** for durable decisions (not task notes); when current-handoff detail goes stale, append it to [agents/handoff-log.md](../agents/handoff-log.md) and trim. One source of truth per fact — if it belongs in product/engineering/ADR/HANDOFF, put it there and link it.
