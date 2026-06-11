# Product

## What this is

**MATCHDAY** — a family of daily, shareable browser mini games riding the 2026 FIFA World Cup (USA/Canada/Mexico, 11 Jun – 19 Jul 2026). One hub ("the stadium"), many games, a new kickoff every day.

The first and only live game is **ANTHEM**: hear a growing snippet of a national anthem, guess the nation in six tries — a "Heardle" for World Cup anthems. The full design brief, history and rationale live in [games/anthem/HANDOFF.md](../games/anthem/HANDOFF.md); that document is the source of truth for game design and is not duplicated here.

## Users & bet

Football fans during the tournament, reached **organically** — there is no distribution budget or existing audience. The strategic bet (see HANDOFF §2): the Wordle/Heardle daily-ritual loop (one shared daily puzzle + spoiler-free share + streaks + scarcity) is the only proven pattern for cold-start + organic + sustained. Everything ships in service of that loop.

The two KPIs that matter: **share rate** (`share_clicked / game_finished`) and **day-1 return**. The analytics funnel exists to measure exactly these (see [engineering.md](engineering.md#analytics)).

## Current scope (shipped)

- Daily + practice ANTHEM with streaks, lifetime stats, spoiler-free share grid
- Canvas **share card** image attached to the share sheet + OG link unfurl
- **Global stats** ("X% of today's players solved it") on anonymous counters
- First-party cookieless analytics funnel
- PWA install identity; self-hosted fonts; per-anthem audio start offsets

## Out of scope (deliberately, for now)

- Accounts/auth, server-side game state, leaderboards with identity
- More games (hub has placeholder slots; add-a-game checklist in root README)
- Monetization of any kind
- Native apps

## Launch blockers

Tracked in [process/progress.md](process/progress.md). Headline items: production domain, Cloudflare deploy (real D1), R2 audio re-hosting, FIFA-wording legal pass, distribution plan.

## Core user workflow

Open `/anthem` → play the 1s clip → guess/skip up to 6× (each miss unlocks more clip + a hint card) → result panel with flag reveal, streak, global % → share the card to a group chat → return at midnight UTC for the next match.
