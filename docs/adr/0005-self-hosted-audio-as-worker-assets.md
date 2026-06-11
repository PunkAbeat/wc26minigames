# ADR-0005: Anthem audio self-hosted as Worker static assets (not R2)

**Status:** accepted (2026-06-11)

## Context

All anthem audio streamed from archive.org: slow, occasionally down, not ours, and 16 recordings open with silence. The assumed fix was R2 (+ CDN config, + another binding, + upload tooling). Meanwhile the total corpus is only ~57 MB after trim/normalize — well inside Workers static-asset limits.

## Decision

`tools/prepare-audio.mjs` trims the measured leading silence, loudness-normalizes (`loudnorm I=-16`), re-encodes to 128k MP3, and writes `app/public/audio/<cc>.mp3` plus a committed manifest (`src/lib/anthem/audio-local.ts`). The files themselves are **gitignored**; `npm run deploy` regenerates them (downloads cache in `/tmp/anthem-audio`). Playback resolves sources in order: self-hosted (offset 0, baked in) → archive.org original (measured offset) → synth.

## Consequences

- No extra infrastructure: audio ships with the same deploy as the app, cached on Cloudflare's edge like any asset.
- A checkout without generated files still works (404 → archive fallback), so CI and fresh clones need no ffmpeg.
- Repo stays small; the cost is a deploy-time generation step that needs ffmpeg + network.
- If the corpus ever outgrows asset limits (more games, more audio), R2 is the unchanged upgrade path — the source-list mechanism doesn't care where URLs point.
