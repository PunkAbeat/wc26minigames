# Current handoff

*Updated: 2026-06-12 (GROUPS prototype built; site live; QA-listen closed)*

## State

Production is **LIVE at https://wc26minigames.com** (ANTHEM + hub; latest deploy version 4fc0d6c6, 11 Jun). Work happens on `master`; clean tree, all gates green (**88 vitest, 12 headless suites**, typecheck, build, CI).

**New since last handoff: GROUPS (game #2) prototype** — owner picked it from the [game-2 brainstorm](../research/game2-brainstorm.md) on 12 Jun, built same day:

- `/groups` route (`app/src/routes/groups.tsx`), Connections-style daily: 16 nations → 4 hidden groups, 4 mistakes, tier banners (NYT colours), streak, spoiler-free emoji share, UTC-midnight countdown.
- Pure logic in `app/src/lib/groups/` (`puzzles` 10-grid bank · `daily` seeded schedule, launch day 12 Jun · `game` state machine · `storage` keys `groups_daily`/`groups_streak`/`groups_seen`); bank shape + nation names validated against anthem data by unit tests.
- All 11 languages have the new `gr_*`/`groups_tagline` keys (ar/fa/ja/ko machine-written, flagged); hub card added; headless **suite 12** (runner maps it to /groups).
- **Tailnet preview only (`https://mini-lubuntu.tail4e976f.ts.net:8443/groups`) — deliberately NOT deployed.** Owner wants to test on-device first.

## Unresolved risks

- **GROUPS has had zero on-device/iOS verification** — built and gated headlessly only this session. Tile tap feel, 4-col board on small phones, RTL board layout need eyes.
- **Puzzle bank facts are agent-authored.** Each grid's categories were fact-checked during authoring (traps documented in `puzzles.ts` comments), but a human sweep is prudent before any public exposure; difficulty is untested with real players.
- Bank = 10 grids → repeats after 10 days; fine for a prototype, not for launch (~40 needed for the tournament window).
- iOS verification gap on the ANTHEM polish pass (SFX, GOAL flash, flag reveal, PWA, England offset) still open from before.
- Global stats honest-but-spoofable ([ADR-0004](../adr/0004-anonymous-global-stats-on-d1.md)); seek-before-canplay iOS fallback unverified (watch England).

## Intentionally not done

- **No deploy of GROUPS** — owner gate. `npm run deploy` would ship it; don't run it.
- No GROUPS-specific share card image, global stats, archive or practice mode — prototype scope; add only if the game graduates.
- Original `index.html` files untouched. Open questions in [research/questions.md](../research/questions.md) (game-#2 launch decision is item 6) left open.

## Recommended next task

Wait for the owner's on-device verdict on GROUPS (URL above; hard-refresh if the old bundle is cached). If it graduates: expand the bank to ≥40 grids (the editorial pipeline is the real work — keep the trap/uniqueness comments per grid), then a GROUPS share-card canvas + og image, then deploy. If the verdict is mixed, the brainstorm doc holds the runner-up (BRACKET) and the parked crowd-powered candidates. Otherwise: ANTHEM polish on-device pass and the distribution push remain the open launch items.
