# ADR-0001: TanStack Start on Cloudflare Workers replaces the static-HTML setup

**Status:** accepted (2026-06-11)

## Context

The prototype was deliberately build-free: self-contained `index.html` files, vanilla JS. That was right for iterating to a finished game, but going live needs things static files can't do: server routes for global stats and analytics, SSR'd OG/social meta, a deploy target with a real edge, and room for the roadmap (D1-backed leaderboards, auth later).

## Decision

Rebuild as a TanStack Start app (React 19 + Vite) in `app/`, deployed to Cloudflare Workers via `@cloudflare/vite-plugin` + wrangler. Hub at `/`, ANTHEM at `/anthem`, API routes co-located as server routes. The original HTML files stay in the repo, frozen, as the behavioral reference until merge; parity is enforced by tests rather than promises.

Cloudflare over alternatives because the roadmap is all Cloudflare-shaped primitives (D1 counters, Analytics Engine, R2 for audio, KV later) on one free-tier-friendly platform.

## Consequences

- A build step and framework exist now; the "no build step" README promise is retired.
- Gameplay logic had to be extracted into pure TS modules — which is what made the unit-test layer possible.
- Local dev gets full backend emulation (miniflare) for free; deploy needs real binding IDs.
- The migration cost ~a day and a 9-suite behavioral test port; that price is paid.
