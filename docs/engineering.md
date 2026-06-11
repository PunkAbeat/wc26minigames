# Engineering

## Repo shape

```
index.html                  ← ORIGINAL static hub — frozen behavioral reference, do not edit
games/anthem/index.html     ← ORIGINAL static game — frozen behavioral reference, do not edit
games/anthem/HANDOFF.md     ← game design brief (source of truth for gameplay)
app/                        ← the real application (TanStack Start → Cloudflare Workers)
docs/                       ← this documentation system
.github/workflows/ci.yml    ← CI: all gates incl. headless suites
```

## Architecture (`app/`)

TanStack Start (React 19, Vite) targeting Cloudflare Workers via `@cloudflare/vite-plugin` + `wrangler.jsonc`. See [ADR-0001](adr/0001-tanstack-start-on-cloudflare.md).

- `src/routes/index.tsx` — hub (`/`), GAMES manifest at the top
- `src/routes/anthem.tsx` — the whole ANTHEM UI; React owns game/picker/modal state
- `src/routes/api.anthem-stats.tsx` — anonymous global-result counters (D1)
- `src/routes/api.event.tsx` — analytics sink (Workers Analytics Engine)
- `src/routes/og.tsx` — internal brand-asset page (screenshot → OG image)
- `src/lib/anthem/` — pure, unit-tested game logic: `puzzles` (48 nations, extracted verbatim from the original), `daily` (seeded UTC schedule), `game` (state transitions/streak/stats), `text` (picker matching), `storage` (localStorage), `offsets` (generated), `sharecard` (canvas)
- `src/lib/anthem/engine/` — **imperative** engines held in React refs, never React state: `playback` (the pb controller), `synth` (Web Audio + SFX), `track` (ball geometry), `confetti`. See [ADR-0002](adr/0002-imperative-engines-in-refs.md) — this is a hard rule.

### Runtime rules (hard-won, keep them)

- Daily-puzzle computation and all localStorage run **client-side only** (mount effects) — SSR must never disagree with the browser.
- localStorage keys are stable contracts: `anthem_daily`, `anthem_streak`, `anthem_seen`, `anthem_stats`.
- DOM nodes the engines write to (clip label, playhead, play-button classes, fill/ballpos) are rendered by React with **constant props** so reconciliation never overwrites engine writes.
- iOS fixes that must survive any refactor: 16px+ `type=search` input with neutral placeholder; picker rows select on **click, not pointerdown**; `overflow-x:clip` + `touch-action:pan-y` + `overscroll-behavior:none` on html/body; the viewport meta lockdown; reduced-motion gates every animation/SFX.
- The app must degrade gracefully with **no backend** (stats/analytics endpoints absent → game still fully playable).

## Commands (run in `app/`)

| Command | What |
|---|---|
| `npm run dev` | dev server on :3000 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | vitest unit suites |
| `npm run build` | production build (keeps test hooks) |
| `npm run build:prod` | deploy-grade build — strips test hooks/suites |
| `npm run test:headless` | 9 headless-Chrome suites vs :4173 (see below) |
| `node tools/gen-og.mjs` | regenerate the OG image (server must be up) |
| `node tools/gen-icons.mjs` | regenerate PWA icons from `tools/icon.html` |
| `node tools/measure-offsets.mjs` | re-measure anthem leading-silence offsets (ffmpeg) |
| `npm run audio:prepare` | trim/normalize all anthems into `public/audio/` + manifest ([ADR-0005](adr/0005-self-hosted-audio-as-worker-assets.md)) |

## Test system

Three layers, all CI-gated:

1. **Vitest** (`src/**/__tests__/`) — pure logic, plus a parity test that evals the `PUZZLES` literal out of the original `games/anthem/index.html`.
2. **Headless Chrome suites** (`public/tests/anthemtest1-9.js`) — full behavioral tests. A `?anthemtest=N` bootstrap in `__root.tsx` stubs `HTMLMediaElement` (forces the synth path) and loads the suite; suites drive the game through the `window.__anthem` hook in `anthem.tsx` and report into `<pre id="testout">`; `tests/run-headless.mjs` runs Chrome with `--virtual-time-budget --dump-dom` and greps it. Coverage: 1 daily/persistence/streak · 2 picker keyboard · 3 picker mouse/clear · 4 playback · 5 confetti pixels · 6 end-screen layout · 7 share card PNG · 8 lifetime stats · 9 global stats + event sink.
3. **On-device iOS check** by the owner — the only gate for iOS quirks; required before merge.

**Gotcha:** the tailnet preview (`wc26-preview.service`) loads the server bundle into workerd at startup — after `npm run build`, `sudo systemctl restart wc26-preview` or the headless suites hit a stale bundle and time out.

## Local serving / on-device testing

- `wc26-preview.service` (systemd) serves the production build on `127.0.0.1:4173`; tailnet URL `https://mini-lubuntu.tail4e976f.ts.net:8443/`. The old static site is at `:8444/wc26minigames/` for side-by-side parity.
- Host-level setup is documented outside the repo in `/home/mini/agents/system-docs/{services.md,CHANGELOG.md}`.

## Backend bindings (wrangler.jsonc)

- `DB` (D1) — global-stats counters; **placeholder `database_id`**, real one needed at deploy (`wrangler d1 create wc26minigames`, migration in `app/migrations/`). Local dev/preview emulate it.
- `EVENTS` (Analytics Engine, dataset `wc26_events`) — event funnel; no-op locally.

## Build-time env

| Var | Effect |
|---|---|
| `VITE_SITE_ORIGIN` | absolute origin for `og:image`/`og:url` (unset → tags omitted) |
| `VITE_CF_BEACON_TOKEN` | enables the Cloudflare Web Analytics tag |
| `VITE_STRIP_TEST_HOOKS` | set by `build:prod`; removes the test bootstrap |

## Code standards

Match the existing style: TypeScript strict, ported logic stays verbatim-faithful to the original (comments explain *why*, especially iOS workarounds), CSS is hand-rolled (no Tailwind — see styles.css header) with page-prefixed selectors (`.page-hub` / `.page-anthem`).
