# ADR-0007: Uncapped free play — value-per-visit over daily scarcity

**Status:** accepted (2026-06-12, owner decision)

## Context

ANTHEM launched with the Wordle playbook: one daily match, practice capped at
2/day ("scarcity is the engine of the format"). That mechanic assumes a daily
return habit worth protecting. Two days post-launch the owner's read is that
the game is unlikely to go viral enough for daily habit formation to be the
growth engine; the realistic funnel is *someone shares a link → a person plays
once → maybe shares*. Rationing content optimizes the wrong stage of that
funnel — a new visitor hit a wall after ~10 minutes (today's match, archive,
2 practice rounds).

## Decision

- **Kill the cap, not the daily.** Practice mode is uncapped and rebranded
  **"Free play — every anthem"** in all 11 languages; the `anthem_practice`
  localStorage counter and the cap toast are gone. The end screen offers free
  play after *every* finished game (daily/archive included), making the binge
  path explicit.
- **The daily match stays the headline** — streaks, lifetime stats, global
  stats, and the comparable "Match #N n/6" share grid all remain daily-only.
  Share comparability is the one real viral mechanic; an unstructured mode
  can't produce "I got it in 2" replies.
- Free play stays random-order (`randomPracticeIndex` never picks today's
  anthem), so bingeing never spoils upcoming dailies — the two modes don't
  damage each other.
- **The pull is more games, not more visits per game**: growth bets go into
  the hub roster (game #2 selection), not retention mechanics.

## Consequences

- A first visit can now be dozens of rounds; the 46-anthem pool becomes
  learnable quickly for engaged players. Accepted — an engaged player was
  never the problem.
- `practice_started` analytics now measure real demand for free play; the
  day-1→day-2 return rate (Analytics Engine) can later test whether a daily
  habit exists at all.
- Internal naming (`mode === 'practice'`, `practice_*` string keys, the
  `practice_started` event) keeps the old name; only user-facing copy changed.
- Reversible: reinstating a cap is one localStorage counter and one check.
