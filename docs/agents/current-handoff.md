# Current handoff

*Updated: 2026-06-13 (SQUAD parked after two mock passes; criteria relaxed; FLAG SORT proposed by owner — round 5)*

## State

Production is **LIVE at https://wc26minigames.com** (ANTHEM + hub). `master`, clean tree, all gates green (**60 vitest, 11 headless suites**, typecheck, build).

**Free play is uncapped** (owner decision 12 Jun, [ADR-0007](../adr/0007-uncapped-free-play.md)): the 2/day practice cap is gone, practice is rebranded "Free play — every anthem" in all 11 languages, and the end screen offers it after every finished game. The daily match keeps streaks/stats/comparable shares; free play stays random-order so it never spoils upcoming dailies. Growth thesis: value-per-visit + more games, not daily scarcity.

**GROUPS is dead.** Built 12 Jun, owner played it on the tailnet preview the same evening and scrapped it ("feels really boring"). Reverted in `e10ce51`/`93631bc`/`43af8fb` — `/groups` is 404 again, hub card and `gr_*` i18n keys removed, suite 12 gone (suites are 1–11 again). The prototype, including the fact-checked 10-grid puzzle bank, is recoverable from history just before those reverts. It was never deployed; no user ever saw it.

**Game #2 selection — round 5** ([game2-brainstorm.md](../research/game2-brainstorm.md)). History: GROUPS scrapped 12 Jun (added criterion #5: *the core ten seconds must feel good*); round-4 genre-wide slate; owner tried **SQUAD** first. Two mock passes were built at `app/public/mock/squad.html` (**`/mock/squad`** on the tailnet preview) — v1, then a v2 excitement pass (visible rival pre-flip, GOAL!/scoreline framing, dim-zoom-countup reveal, rank chips, golden-goal sudden death; commit `31206c6`). Owner verdict: "may be a good direction but something feels off" → **SQUAD is parked, 13 Jun** (not scrapped; stats in the mock are agent-approximate). ⚠️ The mock lives in `app/public/` and would ship with `npm run deploy` — remove or gate it before any production deploy.

**Criteria relaxed (owner, 13 Jun):** uniqueness is no longer a hard criterion, and game #2 does not have to be daily. Still binding: football/WC link, licensing-clean, iOS Safari first, criterion #5.

**Now exploring (owner-proposed): FLAG SORT** — water-sort puzzle mechanics where you build country flags. Round-5 write-up in the brainstorm doc covers the incumbent scan (store clones exist; web lane open) and the key design fork: uniform-tube reskin vs **target-pattern sort** (frame layers must match the flag's stripe order — recommended; no incumbent found). Feel mock built 13 Jun (`d188dd8`): `app/public/mock/flagsort.html` at **`/mock/flagsort`** — target-pattern variant, 3 levels (Germany → Spain's repeated-red ordering trap → Argentina with sun-stamp payoff), solver-checked deals (every shuffle winnable), undo/restart, `prefers-reduced-motion` respected. Owner verdict on v1: "really onto something" but the pour "does not feel liquid at all" → **v2 same day (`0529567`)**: procedural liquid on canvas (no physics engine — that's deliberate; rigid-body engines don't do fluids): half-plane volume solve keeps liquid level while the tube tilts, continuous drain, damped-spring surface slosh, tapering stream with droplets/ripples/glug bubbles, slots remeasured per frame. `?demo`/`?debug` URL hooks drive headless screenshot tests (CDP real-time, not virtual-time — virtual time freezes the rAF loop). Owner gut check of v2 pending. SHOOTOUT remains the standing alternative; WebGL metaball particles are the escalation path if procedural liquid still isn't enough.

## Process change for the next pick

**One-screen feel mock before any full prototype.** GROUPS burned a day on a complete build (route, i18n ×11, test suite) before the owner ever felt the core loop. Next time: build only the central interaction (run-up + dive, or swipe + ball flight), put it on the tailnet for an on-device gut check, and add the daily shell/i18n/suites only after the ten seconds survive.

## Unresolved risks

- iOS verification gap on the ANTHEM polish pass (SFX, GOAL flash, flag reveal, PWA, England seek-before-canplay offset) still open from before.
- Global stats honest-but-spoofable ([ADR-0004](../adr/0004-anonymous-global-stats-on-d1.md)).
- AR/FA/JA/KO locales are machine-written — native review before promoting them.

## Intentionally not done

- Nothing deployed this session; the deploy gate (owner says so) stands.
- GROUPS revert kept as reverts, not a history rewrite — salvageable on purpose.
- Original `index.html` files untouched.

## Recommended next task

Wait for the owner's round-3 pick ([questions.md](../research/questions.md) item 6). Then build the feel mock only (see process change above). If no pick: ANTHEM polish on-device pass and the distribution push remain the open launch items.
