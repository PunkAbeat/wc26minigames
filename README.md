# MATCHDAY ⚽ — World Cup 2026 daily mini games

A series of daily, shareable browser mini games built around the **2026 FIFA World Cup** (USA / Canada / Mexico, 11 Jun – 19 Jul 2026), all reachable from a single landing page ("the stadium").

Everything is **static, no build step, no dependencies**: the hub and each game are self-contained HTML files using vanilla JS.

> "MATCHDAY" is a working title for the hub — easy to rename later (it lives in `index.html` only).

## Structure

```
index.html              ← landing page / hub (games manifest lives here)
games/
  anthem/
    index.html          ← ANTHEM — guess the nation from its anthem
    HANDOFF.md          ← ANTHEM's full design brief, decisions & roadmap
```

## Run it

Open `index.html` in any modern browser (the hub links to each game with relative paths, so plain `file://` works). Or serve the folder for a cleaner setup:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

Internet connection recommended: games stream audio (archive.org), web fonts (Google Fonts), and flag images (flagcdn), with graceful fallbacks.

## The games

| Game | Status | What it is |
|---|---|---|
| **ANTHEM** 🎺 | Playable prototype | Hear a growing snippet of a national anthem, guess the nation in six tries — a "Heardle" for World Cup anthems. See [games/anthem/HANDOFF.md](games/anthem/HANDOFF.md) for the full story and roadmap. |
| ??? | Planned | More daily fixtures to come. |

## Adding a game

1. Create `games/<id>/index.html` — self-contained, vanilla JS, no build step.
2. Add an entry to the `GAMES` array at the top of the root `index.html` (`{id, name, icon, tagline, status, badge, href}`).
3. Give the game a back-to-hub link in its header (`<a class="back" href="../../index.html">⚽ Games</a>` — see ANTHEM for the pattern).
4. Reuse the shared look: each file carries the same CSS variables / fonts (Baloo 2 + Nunito, pitch greens, gold/coral candy buttons) so the family feels cohesive. Copy the `:root` block from an existing file as a starting point.

## Attribution / licensing notes

- Anthem recordings: U.S. Navy Band — works of the U.S. federal government, **public domain**. Source: <https://archive.org/details/us-navy-band-national-anthems-public-domain>
- Flags: <https://flagcdn.com> (free flag CDN).
- Fonts: Google Fonts — Baloo 2 + Nunito (Open Font License).
- "FIFA" / "World Cup" are trademarks of FIFA. This is an unofficial fan project; before any public launch, review FIFA trademark/branding use (avoid official marks, logos, and team crests).
