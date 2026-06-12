# Handoff log

Append-only archive. When [current-handoff.md](current-handoff.md) is rewritten, move the parts worth keeping here with a date header. Newest first.

---

## 2026-06-11/12 — go-live + i18n + QA-listen (summary, from the pre-GROUPS handoff)

Merged to `master`, pushed to github.com/PunkAbeat/wc26minigames, CI green (two runner-only flakes fixed: rAF while paused, createImageBitmap under virtual time). **Deployed to https://wc26minigames.com 11 Jun** (D1 migrated, AE enabled; latest version 4fc0d6c6 incl. the FIFA de-brand, ADR-0006). Audio self-hosted (ADR-0005; `npm run audio:prepare` after fresh clone or the tailnet preview falls back to archive.org streaming). QA-listen fully closed 11-12 Jun (Iran/Paraguay verified, DR Congo wired as 46th nation, Qatar/Jordan ear-floor offsets). i18n phases 1-2 shipped (11 languages; ar/fa/ja/ko machine-written). Still open then and now: owner on-device pass of the polish round (incl. England seek-before-canplay watch item), distribution push.

---

## 2026-06-11 — migration + virality + polish session (summary)

Migrated the static prototype to TanStack Start on Cloudflare Workers (`app/`, branch `tanstack-migration`, commits `5ba11bf..22f50d0`): parity-locked port with 43 unit tests + 9 headless suites; shipped the full virality loop (share card, OG, stats panel, D1 global stats), first-party analytics, CI, PWA identity, self-hosted fonts, SFX/GOAL-flash polish, and ffmpeg-measured per-anthem start offsets. Tailnet serving made reboot-proof (`wc26-preview.service`, host docs in `/home/mini/agents/system-docs/`). Owner verified the base app on-device; polish pass pending device check. Details live in milestone [001](../process/milestones/001-migration-and-virality.md) and the ADRs — this entry is the pointer, not the copy.
