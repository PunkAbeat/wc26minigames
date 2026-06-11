# ADR-0004: Global stats are anonymous (day, tries) counters on D1

**Status:** accepted (2026-06-11)

## Context

"38% of today's players solved it" is the social proof that converts a player into a daily player (HANDOFF roadmap item 2/3). The full version — accounts, per-user history, leaderboards — drags in auth, privacy policy, and abuse handling that aren't justified pre-launch.

## Decision

The minimum honest version: one D1 table `anthem_results(day, tries, n)` — pure counters, no user rows. Clients POST once per **live** daily finish (restores never re-post); the server validates the bucket (`tries ∈ 1..6|X`, day within ±1 of server UTC day) and increments. GET returns the day's distribution; the client renders the percentage line.

## Consequences

- Zero personal data; nothing to leak, nothing to consent.
- The numbers are honest-ish, not tamper-proof: one keypress in devtools can inflate a bucket. Accepted pre-traction; rate limiting / turnstile is the upgrade path if it's ever gamed visibly (open question in research/questions.md).
- A device replaying the same finished day after clearing localStorage double-counts — accepted noise.
- Schema is deliberately leaderboard-shaped: per-user stats later mean new tables, not migrations of this one.
