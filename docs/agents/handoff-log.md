# Handoff log

Append-only archive. When [current-handoff.md](current-handoff.md) is rewritten, move the parts worth keeping here with a date header. Newest first.

---

## 2026-06-12 (evening) — GROUPS built and scrapped same day (summary)

Owner picked GROUPS from the two-round brainstorm; full prototype built same day (route, 10-grid bank, pure logic, all 11 languages, headless suite 12, 4 commits, all gates green; tailnet only — never deployed). Owner played it that evening: *"I don't like it at all, it feels really boring"* → scrapped. Code reverted in `e10ce51`/`93631bc`/`43af8fb`; the prototype (incl. the fact-checked puzzle bank and board CSS) survives in history just before those. Process verdict: cheap-prototype-then-judge worked — one day, honest answer, nothing shipped. Lesson recorded as brainstorm criterion #5 ("the core ten seconds must feel good"); round-3 slate (KEEPER ⭐ / FREE KICK / FLAG DRAW / BRACKET) in game2-brainstorm.md.

---

## 2026-06-11/12 — go-live + i18n + QA-listen (summary, from the pre-GROUPS handoff)

Merged to `master`, pushed to github.com/PunkAbeat/wc26minigames, CI green (two runner-only flakes fixed: rAF while paused, createImageBitmap under virtual time). **Deployed to https://wc26minigames.com 11 Jun** (D1 migrated, AE enabled; latest version 4fc0d6c6 incl. the FIFA de-brand, ADR-0006). Audio self-hosted (ADR-0005; `npm run audio:prepare` after fresh clone or the tailnet preview falls back to archive.org streaming). QA-listen fully closed 11-12 Jun (Iran/Paraguay verified, DR Congo wired as 46th nation, Qatar/Jordan ear-floor offsets). i18n phases 1-2 shipped (11 languages; ar/fa/ja/ko machine-written). Still open then and now: owner on-device pass of the polish round (incl. England seek-before-canplay watch item), distribution push.

---

## 2026-06-11 — migration + virality + polish session (summary)

Migrated the static prototype to TanStack Start on Cloudflare Workers (`app/`, branch `tanstack-migration`, commits `5ba11bf..22f50d0`): parity-locked port with 43 unit tests + 9 headless suites; shipped the full virality loop (share card, OG, stats panel, D1 global stats), first-party analytics, CI, PWA identity, self-hosted fonts, SFX/GOAL-flash polish, and ffmpeg-measured per-anthem start offsets. Tailnet serving made reboot-proof (`wc26-preview.service`, host docs in `/home/mini/agents/system-docs/`). Owner verified the base app on-device; polish pass pending device check. Details live in milestone [001](../process/milestones/001-migration-and-virality.md) and the ADRs — this entry is the pointer, not the copy.
