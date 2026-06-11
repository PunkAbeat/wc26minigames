# Handoff log

Append-only archive. When [current-handoff.md](current-handoff.md) is rewritten, move the parts worth keeping here with a date header. Newest first.

---

## 2026-06-11 — migration + virality + polish session (summary)

Migrated the static prototype to TanStack Start on Cloudflare Workers (`app/`, branch `tanstack-migration`, commits `5ba11bf..22f50d0`): parity-locked port with 43 unit tests + 9 headless suites; shipped the full virality loop (share card, OG, stats panel, D1 global stats), first-party analytics, CI, PWA identity, self-hosted fonts, SFX/GOAL-flash polish, and ffmpeg-measured per-anthem start offsets. Tailnet serving made reboot-proof (`wc26-preview.service`, host docs in `/home/mini/agents/system-docs/`). Owner verified the base app on-device; polish pass pending device check. Details live in milestone [001](../process/milestones/001-migration-and-virality.md) and the ADRs — this entry is the pointer, not the copy.
