# MATCHDAY ⚽ — World Cup 2026 daily mini games

A series of daily, shareable browser mini games built around the **2026 FIFA World Cup** (USA / Canada / Mexico, 11 Jun – 19 Jul 2026), all reachable from a single landing page ("the stadium").

> "MATCHDAY" is a working title — see [docs/research/questions.md](docs/research/questions.md).

## The games

| Game | Status | What it is |
|---|---|---|
| **ANTHEM** 🎺 | Live (daily + practice) | Hear a growing snippet of a national anthem, guess the nation in six tries — a "Heardle" for World Cup anthems. One official anthem per UTC day across all 48 qualified nations, with streaks, lifetime + global stats, and a shareable result card. Design brief: [games/anthem/HANDOFF.md](games/anthem/HANDOFF.md). |
| **FLAG SORT** 🎌 | In app, not deployed | Water-sort puzzle — pour the colours into place to build each nation's flag. Campaign ("Road to the Final", all 48 qualified nations) + play any nation; progress saved locally. Route `/flagsort`. Graduated from a feel mock 13 Jun 2026; in-game copy English-first; awaiting owner deploy. Design history: [docs/research/game2-brainstorm.md](docs/research/game2-brainstorm.md). |

## Repository layout

```
app/                      ← THE APPLICATION — TanStack Start (React) on Cloudflare Workers
                            hub at /, ANTHEM at /anthem, API routes, tests, tools
index.html                ← original static hub  ─┐ frozen prototypes: the behavioral
games/anthem/index.html   ← original static game ─┘ reference until the migration merges
games/anthem/HANDOFF.md   ← ANTHEM's design brief, decisions & roadmap
docs/                     ← documentation system (see map below)
.github/workflows/ci.yml  ← CI: typecheck, unit tests, build, headless suites
```

## Run it

```sh
cd app && npm install && npm run dev     # → http://localhost:3000
```

More (build, tests, tailnet serving, deploy): [docs/engineering.md](docs/engineering.md).

## Documentation map

| Doc | What's in it |
|---|---|
| [AGENTS.md](AGENTS.md) | rules for coding agents: scope, gates, handoff duties |
| [docs/onboarding.md](docs/onboarding.md) | five-minute human ramp |
| [docs/product.md](docs/product.md) | what we're building, for whom, what's out of scope |
| [docs/engineering.md](docs/engineering.md) | architecture, commands, runtime rules, test system |
| [docs/adr/](docs/adr/README.md) | durable decisions (don't re-litigate silently) |
| [docs/process/progress.md](docs/process/progress.md) | active milestone, statuses, backlog |
| [docs/agents/current-handoff.md](docs/agents/current-handoff.md) | where work stands right now |
| [docs/research/questions.md](docs/research/questions.md) | open questions awaiting a human decision |
| [games/anthem/HANDOFF.md](games/anthem/HANDOFF.md) | the game itself: design, rationale, roadmap |

## Adding a game

1. Create a route under `app/src/routes/` (self-contained page; reuse the shared look — copy the CSS-variable block and page-prefix pattern from `styles/anthem.css`).
2. Add an entry to the `GAMES` array at the top of `app/src/routes/index.tsx`.
3. Give it a back-to-hub link in its header (see ANTHEM's `⚽ Games` pattern) and a `.page-<id>` CSS prefix.
4. Add behavioral coverage: a headless suite in `app/public/tests/` plus unit tests for pure logic.

## Attribution / licensing

- Anthem recordings: U.S. Navy Band — works of the U.S. federal government, **public domain**. Source: <https://archive.org/details/us-navy-band-national-anthems-public-domain>
- Flags: <https://flagcdn.com> · Fonts: Baloo 2 + Nunito (OFL, self-hosted)
- "FIFA" / "World Cup" are trademarks of FIFA. Unofficial fan project; see the legal item in [docs/process/progress.md](docs/process/progress.md) before any public launch.
