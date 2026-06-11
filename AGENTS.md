# Instructions for coding agents

This file is the entry point for any agent (or human) working on this repo.

## Required reading, in order

See [docs/agents/required-reading.md](docs/agents/required-reading.md). Minimum before touching code:

1. [docs/agents/current-handoff.md](docs/agents/current-handoff.md) — where work stands right now
2. [docs/engineering.md](docs/engineering.md) — architecture, commands, runtime rules
3. [games/anthem/HANDOFF.md](games/anthem/HANDOFF.md) — the game's design brief and rationale

## Scope rules

- **The app lives in `app/`** (TanStack Start, branch `tanstack-migration`). That is where changes go.
- **Do not modify** the original prototypes `index.html` and `games/anthem/index.html` — they are the behavioral reference until the migration branch is merged. A vitest parity test reads the original file; changing it breaks the gate.
- ANTHEM's gameplay behavior is parity-locked to the original. Behavior *changes* (not ports) need a note in [docs/process/progress.md](docs/process/progress.md) and, if durable, an ADR.
- Decisions in [docs/adr/](docs/adr/) are settled; don't re-litigate them silently. Open questions live in [docs/research/questions.md](docs/research/questions.md) — don't decide those silently either.
- Do not deploy anywhere. Local/tailnet only until the owner says otherwise.

## Testing expectations

Every change passes all gates before commit (run in `app/`):

```sh
npm run typecheck
npm test                 # vitest unit suites (incl. data parity vs the original HTML)
npm run build
sudo systemctl restart wc26-preview   # the preview serves dist/ from a long-lived workerd
npm run test:headless    # 9 headless-Chrome behavioral suites against :4173
```

New behavior gets a test in the layer that fits: pure logic → vitest in `app/src/lib/**/__tests__/`; user-visible behavior → a headless suite in `app/public/tests/` (see existing suites for the `window.__anthem` pattern).

## Commit & handoff requirements

- Small commits, one per verified piece of work, message explains the *why*.
- iOS Safari is the primary target; logic gates don't catch iOS quirks. UI changes get flagged for the owner's on-device check at https://mini-lubuntu.tail4e976f.ts.net:8443/ (old static reference at :8444).
- Before ending a work session: update [docs/agents/current-handoff.md](docs/agents/current-handoff.md) and the status table in [docs/process/progress.md](docs/process/progress.md). Move stale handoff detail to [docs/agents/handoff-log.md](docs/agents/handoff-log.md).
