# Current handoff

*Updated: 2026-06-11 (post-merge: GitHub remote live, CI green, audio self-hosted)*

## State

Merged to `master` and pushed to github.com/PunkAbeat/wc26minigames (public; **CI green on master** — two runner-only flakes fixed: rAF stalls while paused, createImageBitmap stalls under virtual time). Clean tree, all gates green (43 vitest, 9 headless suites, typecheck, build, CI workflow in place). The production build is live on the tailnet at `https://mini-lubuntu.tail4e976f.ts.net:8443/` via `wc26-preview.service`; the original static site sits at `:8444/wc26minigames/` for comparison. Milestones: [001 done](../process/milestones/001-migration-and-virality.md), [002 in progress](../process/milestones/002-go-live.md). Work now happens on `master` (or short-lived branches + PRs).

## Unresolved risks

- **iOS verification gap:** the polish pass (SFX, GOAL flash, flag reveal, PWA install, England first-clip offset) has NOT yet had the owner's on-device check. Logic gates don't catch iOS quirks.
- **archive.org dependency: resolved** for the common path — audio is self-hosted ([ADR-0005](../adr/0005-self-hosted-audio-as-worker-assets.md)); archive.org is now only the fallback. `public/audio/` is gitignored: run `npm run audio:prepare` after a fresh clone or the tailnet preview falls back to archive streaming.
- **Global stats are honest but not tamper-proof** ([ADR-0004](../adr/0004-anonymous-global-stats-on-d1.md)) — fine until someone notices.
- **Seek-before-canplay:** start offsets set `audioEl.currentTime` inside try/catch; if iOS ignores the early seek the clip silently falls back to 0s (pre-offset behavior). Watch for it on-device with England.

## Intentionally not done

- No deploy, no domain, no real D1 `database_id` — owner decisions ([progress](../process/progress.md)).
- Original `index.html` files untouched — merge gate.
- No abuse hardening, no auth, no second game (see ADRs / product.md).
- `docs/research/questions.md` items left genuinely open — don't decide them silently.

## Recommended next task

Owner: device-check the polish pass, then unblock the deploy chain (domain → CF account → `wrangler d1 create`). Agent, if working before that lands: error monitoring (research/questions.md #4 needs the owner's pick first) or the FIFA-wording copy pass are the next unblocked items; the QA-listen list (Iran/Paraguay/DR Congo) needs human ears — the self-hosted copies in app/public/audio/ are the easiest way to listen.
