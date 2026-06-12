# Current handoff

*Updated: 2026-06-12 evening (free play uncapped; GROUPS scrapped; game #2 in round-3 selection)*

## State

Production is **LIVE at https://wc26minigames.com** (ANTHEM + hub). `master`, clean tree, all gates green (**60 vitest, 11 headless suites**, typecheck, build).

**Free play is uncapped** (owner decision 12 Jun, [ADR-0007](../adr/0007-uncapped-free-play.md)): the 2/day practice cap is gone, practice is rebranded "Free play — every anthem" in all 11 languages, and the end screen offers it after every finished game. The daily match keeps streaks/stats/comparable shares; free play stays random-order so it never spoils upcoming dailies. Growth thesis: value-per-visit + more games, not daily scarcity.

**GROUPS is dead.** Built 12 Jun, owner played it on the tailnet preview the same evening and scrapped it ("feels really boring"). Reverted in `e10ce51`/`93631bc`/`43af8fb` — `/groups` is 404 again, hub card and `gr_*` i18n keys removed, suite 12 gone (suites are 1–11 again). The prototype, including the fact-checked 10-grid puzzle bank, is recoverable from history just before those reverts. It was never deployed; no user ever saw it.

**Game #2 selection — round 4** ([game2-brainstorm.md](../research/game2-brainstorm.md)). The scrap added criterion #5: *the core ten seconds must feel good* (motion/tension/comedy). The owner then widened the brief (12 Jun, after round 3): any genre — cards, physics, anything — as long as it's unique and football/WC-linked. Round-4 slate awaiting owner pick:

- **SQUAD** ⭐ — nations card duel: daily seeded 5-card hands, order your hand, pick the stat each round, card-flip reveals. Cheapest build (no physics, one stats table); no nations-duel incumbent (avoid the "Top Trumps" trademark).
- **SHOOTOUT** ⭐ — the full daily penalty shootout vs a seeded rival: alternate *taking* (beat the keeper's lean) and *saving* (read the run-up tell), best-of-5 + sudden death. Subsumes round-3 KEEPER.
- **THREAD** — draw the killer through-ball past moving defenders; lane confirmed open.
- **BICYCLE KICK** — two-tap ragdoll glory/comedy.
- Held: FREE KICK / BRACKET / FLAG DRAW. Dropped: THE CALL (offsideornot.com + referee sims are incumbents).

Agent rec: feel-mock **SQUAD + SHOOTOUT in parallel** (~a day total, one screen each) and let the owner's gut pick the direction.

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
