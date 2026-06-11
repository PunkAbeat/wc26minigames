# ADR-0003: First-party, cookieless analytics; no third-party trackers

**Status:** accepted (2026-06-11)

## Context

Going live needs two measurements: traffic (visits/referrers) and the viral funnel (share rate, share-link return rate). Options considered: PostHog/Plausible (third-party, consent surface area, another vendor), GA (cookies + consent banner), or first-party on the platform we already deploy to.

## Decision

Two layers, both cookieless and identifier-free:

1. **Cloudflare Web Analytics** for traffic — free, no cookies, enabled by `VITE_CF_BEACON_TOKEN` at build.
2. **First-party event funnel**: `track()` beacons allowlisted events (`page_view` with `?ref=share` attribution, `game_finished`, `share_clicked`, `practice_started`) to `/api/event`, which writes to Workers Analytics Engine (dataset `wc26_events`). No user IDs, no IPs stored, props truncated server-side.

Viral coefficient = `page_view{ref=share} / share_clicked`; share rate = `share_clicked / game_finished`.

## Consequences

- No consent banner needed; privacy story is one paragraph.
- Querying requires the AE SQL API (no dashboard out of the box) — acceptable for two KPIs.
- Analytics must never break the game: the sink answers 204 even when the binding is absent, and the client fire-and-forgets.
- If product questions outgrow two KPIs, revisit (PostHog cookieless is the likely upgrade) — new ADR.
