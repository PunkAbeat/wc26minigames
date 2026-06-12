# Current handoff

*Updated: 2026-06-12 evening (GROUPS scrapped; game #2 back in selection, round 3)*

## State

Production is **LIVE at https://wc26minigames.com** (ANTHEM + hub; latest deploy version 4fc0d6c6, 11 Jun). `master`, clean tree, all gates green (**60 vitest, 11 headless suites**, typecheck, build).

**GROUPS is dead.** Built 12 Jun, owner played it on the tailnet preview the same evening and scrapped it ("feels really boring"). Reverted in `e10ce51`/`93631bc`/`43af8fb` — `/groups` is 404 again, hub card and `gr_*` i18n keys removed, suite 12 gone (suites are 1–11 again). The prototype, including the fact-checked 10-grid puzzle bank, is recoverable from history just before those reverts. It was never deployed; no user ever saw it.

**Game #2 selection is open again — round 3** ([game2-brainstorm.md](../research/game2-brainstorm.md)). The scrap added criterion #5: *the core ten seconds must feel good* (motion/tension/comedy), which knowledge/board puzzles fail. Slate awaiting owner pick:

- **KEEPER** ⭐ (agent rec) — be the goalkeeper; 5 daily seeded penalties, read the shooter's tell, one-tap dive; `🧤🧤❌🧤❌ 3/5` share. No daily-ritual incumbent found.
- **FREE KICK** — same seeded set piece worldwide, swipe to curve; max juice, crowded arcade genre, physics-tuning risk.
- **FLAG DRAW** — draw today's flag from memory, pixel-scored; failure-comedy wildcard, partial incumbents.
- **BRACKET** — held from round 2; cheap and tactile but still a board puzzle (same risk class GROUPS died of).

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
