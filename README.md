# ANTHEM ⚽ — World Cup Anthem Daily

A daily browser game: hear a short clip of a national anthem and guess the country in six tries. Built around the **2026 FIFA World Cup** (USA / Canada / Mexico, 11 Jun – 19 Jul 2026), in the proven "Wordle/Heardle" daily-puzzle format, with a juicy mobile-game football look.

This is an early **prototype** — a single self-contained HTML file. No build step, no dependencies to install.

## Run it

Open `index.html` in any modern browser, with **sound on**.

> Needs an internet connection: it streams real anthem recordings, loads web fonts (Google Fonts), and flag images (flagcdn). Everything degrades gracefully if offline-ish (synth fallback for audio, emoji fallback for flags), but it's designed to be online.

## How it plays

- Press play — the clip starts at **1 second** and lengthens with each miss (1 → 2 → 4 → 7 → 11 → 16s).
- Each wrong guess or skip also unlocks a **hint card** (confederation, flag colours, group, trivia, first letter).
- **6 guesses.** The pitch shows your six guesses marching toward the goal; the ball rolls a little further each try.
- Solve it for a **GOAL + confetti**, a flag-coloured result screen, a daily **streak**, and a spoiler-free emoji grid to share.

## What's under the hood

- **Single file**, vanilla JS + Web Audio + Canvas. No framework.
- **Audio:** plays real **public-domain** instrumental anthems performed by the **U.S. Navy Band**, streamed from archive.org. If a track fails to load it falls back to an in-browser **synthesized** rendering of the anthem melody (richer brass + bass + pad + reverb engine).
- **Flags:** flagcdn.com images with an emoji fallback.
- **Daily puzzle + streak** stored in `localStorage`. Currently the "daily" puzzle is chosen locally by date (no server), so everyone is *not yet* guaranteed the same anthem on the same day — see HANDOFF.

## Attribution / licensing notes

- Anthem recordings: U.S. Navy Band — works of the U.S. federal government, **public domain**. Source: <https://archive.org/details/us-navy-band-national-anthems-public-domain>
- Flags: <https://flagcdn.com> (free flag CDN).
- Fonts: Google Fonts — Baloo 2 + Nunito (Open Font License).
- "FIFA" / "World Cup" are trademarks of FIFA. This is an unofficial fan prototype; before any public launch, review FIFA trademark/branding use (avoid official marks, logos, and team crests).

## Status

Working prototype with 6 anthems (England, USA, France, Germany, Italy, Japan). See **HANDOFF.md** for the full story, decisions, known limitations, and the prioritized roadmap to carry on.
