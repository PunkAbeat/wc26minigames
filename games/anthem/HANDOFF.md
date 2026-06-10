# HANDOFF — ANTHEM (World Cup Anthem Daily)

This document is the "carry-on" brief. It explains what the project is, how we got here, what's built, what's deliberately not, and exactly where to pick up. The last section is a ready-to-paste prompt for resuming in a fresh session.

> **Note (June 2026):** ANTHEM is now one game in a series of World Cup mini games. It lives at `games/anthem/index.html`, reached from the hub landing page at the repo root (`index.html`, working title "MATCHDAY"). The hub's `GAMES` array is the manifest of games; the root `README.md` documents the structure and the add-a-game checklist. Everything below still applies to the game itself.

---

## 1. One-paragraph summary

ANTHEM is a daily, shareable browser game for the 2026 World Cup: play a growing snippet of a national anthem and guess the nation in six tries (a "Heardle" for World Cup anthems), wrapped in a juicy, polished, football-themed UI. The goal is an organically viral, daily-habit toy that rides World Cup attention. It is a single self-contained HTML prototype that plays **real public-domain anthem recordings**, with a synthesized fallback.

## 2. How we got here (the reasoning, condensed)

The brief started as "a site about the upcoming World Cup that could go viral." We explored angles and deliberately narrowed:

- Ruled out content/SEO plays; chose a **single interactive toy** optimized for **pure virality**.
- Explored argument-bait (pairwise voting / fanbase power rankings) — strong, but the user wanted **sustained** audience with **no existing distribution**, which is the hardest combo. Pressure-testing showed the only proven pattern for "cold-start + organic + sustained" is the **Wordle/Heardle daily-ritual** loop (one shared daily puzzle + spoiler-free share grid + daily return + scarcity).
- Researched precedents: **Wordle**, **Heardle** (peaked ~69M monthly visits; died only because Spotify couldn't tie it to streaming — the format itself works), **r/place** national-flag wars (national pride = huge engagement), "Who Are Ya?" football Wordle.
- Picked **anthems** specifically because: they're the emotional core of fan culture, instantly tie to nations, and — crucially — **national anthem recordings by the U.S. Navy Band are public domain**, solving the audio-licensing problem that kills most music games.

## 3. Current state (what's built)

Single file: `games/anthem/index.html`. Vanilla JS, Web Audio, Canvas. Features:

- **All 48 qualified WC2026 nations** (each: name, aliases, flag/cc, flag colours, 5 hints incl. real group A–L, verdict line, archive.org audio path; 5 nations also keep a hand-transcribed synth-fallback melody). 45 have verified audio and are in the rotation; Scotland, Curaçao and DR Congo are guessable but excluded from the rotation until audio is sourced (see §5). Italy did not qualify and was removed.
- **Daily + practice play model** (production, since 10 Jun 2026): one official anthem per UTC day — `LAUNCH_DAY` (10 Jun 2026) + a fixed seeded shuffle (`mulberry32(0x26061126)`, Mexico pinned to Match #1) gives every client the same Match #N without a backend. Today's game persists in `localStorage` (`anthem_daily`): reload restores mid-game or finished state, so no replays; end screen shows a live countdown to the next UTC midnight. Practice mode (replaces the old "preview" button) serves random anthems — never today's — with no streak/Match # impact and a "play another" loop.
- Clip reveal 1/2/4/7/11/16s over 6 guesses; hint card unlocks per miss.
- **Real audio:** streams U.S. Navy Band PD recordings from `https://archive.org/download/us-navy-band-national-anthems-public-domain/Current/<Country>.mp3`. Auto-fallback to a synth engine (detuned brass + bass + pad + convolver reverb) if a track errors.
- **UI:** juicy mobile-game football theme — bunting, pitch card, candy buttons (press depth), ball-rolls-to-goal progress (six markers = six guesses), referee-style yellow hint cards, scoreboard guess rows, GOAL + confetti, flag-coloured end screen.
- **Polish:** SVG icons; flagcdn flag images w/ emoji fallback; buffering spinner; input shake + miss "thunk" + invalid-guess guard; first-run "How to play" modal (reopen via "?"); `prefers-reduced-motion` support; native share sheet w/ clipboard fallback.
- Streak + daily index in `localStorage`. "Try another" preview button cycles anthems.

## 4. Key decisions & rationale

- **Daily format over ranking/voting** — only pattern that fits cold-start + organic + sustained.
- **Anthems over teams/kits/fanbases** — licensing-clean audio + fan-culture emotion + novelty (no strong incumbent).
- **archive.org over Wikimedia** for audio — same PD Navy Band files, but clean predictable filenames (`Current/France.mp3`) and easy cross-origin `<audio>` streaming.
- **Synth fallback retained** — guarantees the game never breaks if a file 404s/stalls, and works as a design stand-in.
- **Progress = guesses, not seconds** — mapping the ball to absolute clip-seconds was confusing (1s ≈ 6% of bar); now each guess advances the ball ~1/6 toward goal.

## 5. Known limitations / honest caveats

- **No backend.** The daily puzzle is now deterministic and UTC-synced across clients (seeded shuffle), which fixes the shared-puzzle problem — but there are still no global stats/leaderboards/"X% solved in 3", and the schedule is trivially data-mineable from source.
- **3 nations lack audio** and are excluded from the rotation: Scotland (no PD recording; "Flower of Scotland" is © 1967 so no synth melody either), Curaçao (no Navy Band recording), DR Congo (`Current/Congo.mp3` exists but can't be confirmed as "Debout Congolais" vs Republic of the Congo's anthem without listening — verify by ear, then set its `audio` field).
- **2 recordings come from the archive's `Removed/` folder** (Iran 2000, Paraguay 2000 — both anthems unchanged since recording, both verified streaming). QA-listen to confirm quality/correctness.
- **Melody fallbacks are approximate** — only 5 nations (England, USA, France, Germany, Japan) have hand-transcribed melodies. (Real audio is the primary path, so this only matters offline.)
- **Anthem recognizability is hard** — most people know few anthems; the progressive hints mitigate this but difficulty tuning needs real playtesting.
- **Recordings are older/ceremonial** (~128kbps); fine for clips, not audiophile. Some anthems have intros before the recognizable melody, so a 1s clip can be near-silent for certain countries (needs per-anthem start offsets).
- **Distribution is unsolved** — the hardest real-world problem; the product can't manufacture its own first audience.
- **IP:** uses national flags/names (fine) but avoid FIFA marks/team crests for any public launch.

## 6. Prioritized roadmap (where to carry on)

1. **Autocomplete country picker** (highest UX impact): custom dropdown, filter-as-you-type, flag per row, keyboard nav, disable already-guessed nations, prevent invalid entries. Replaces the clunky `<datalist>`.
2. **Share image + stats** (drives virality/retention): canvas-rendered share card (grid + streak, spoiler-free); stats panel (played / win% / streak / guess distribution). ~~Countdown timer~~ ✅ done.
3. **Backend for global stats/leaderboard**: a tiny serverless store (e.g., Supabase / Cloudflare Workers + KV) for aggregate "X% got it in 3" / global solve %. (Daily sync itself is now solved client-side.)
4. ~~Expand anthems to all 48 qualified nations~~ ✅ done (45 with audio). Remaining: per-anthem **start offsets** to skip silent intros, difficulty tags, audio for Scotland/Curaçao/DR Congo, QA-listen to every clip.
5. **Audio polish** — host trimmed/normalized copies of the PD files; optional per-anthem tempo/character.
6. **Feel/extras** — tap/goal SFX, flag reveal animation; "premium" theme variant if a more grown-up look is ever wanted (current look is intentionally playful/juicy).

## 7. Technical notes for whoever continues

- Everything lives in `games/anthem/index.html`. Sections are commented: AUDIO ENGINE, PLAYBACK, PUZZLES, GAME, CONFETTI, WIRE UP.
- Add an anthem: push an object to `PUZZLES` with `{name, flag, cc, colors, aliases, audio:"Current/<File>.mp3", verdict, hints[5], melody[]}` and add the name to `ALL_NATIONS`. Verify the archive.org filename exists (some have `(Complete)`/`(Short)`/`(Long)` variants).
- Progress geometry: `geomX()/fracFor()/placeMarks()/setStatic()/animateBall()`. Progress is guess-based (`(stage+1)/6`). Don't reintroduce a `render()` call that re-sets the ball position during play — that previously cancelled the roll animation.
- Confetti only fires on a **win** (`endGame()` → `launchConfetti()` when `state.won && !RM`).
- Reduced motion: `RM` flag gates animations/confetti.

---

## 8. Ready-to-paste resume prompt

> I'm continuing a prototype called **ANTHEM**, a daily World Cup anthem-guessing game (a "Heardle" for national anthems) built as a single self-contained `index.html` (vanilla JS + Web Audio + Canvas). It plays real public-domain U.S. Navy Band anthem recordings streamed from archive.org, with a synth fallback, in a juicy mobile-game football UI (bunting, pitch, ball-rolls-to-goal over 6 guesses, hint cards, GOAL + confetti, flag-coloured end screen, streaks, spoiler-free share grid). Read `HANDOFF.md` and `README.md` for full context. It currently has 6 anthems and **no backend**.
>
> Please continue by implementing **[pick: the autocomplete country picker / the share-image + stats + countdown / the daily-sync backend / expanding to all 48 nations]**. Keep it a single self-contained file unless I say otherwise, preserve the existing audio + fallback engine, and verify your changes (logic + DOM wiring) before finishing.
