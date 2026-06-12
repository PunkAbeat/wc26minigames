# Game #2 brainstorm

Working document for choosing the second MATCHDAY game. Owner decision in the end —
see [questions.md](questions.md). Criteria set by the owner (12 Jun 2026):

1. **Truly unique** — not a reskin of an existing daily/quiz game.
2. **World Cup related.**
3. **Simple to play, simple to grasp** — one glance, one gesture if possible.
4. **Wide appeal** — playable by people who are not hardcore football fans.

Constraints inherited from the project (see ANTHEM's HANDOFF + ADRs):

- Licensing-clean assets only: flags, country names, geography, public facts ✔;
  player faces, match footage, kits, FIFA marks ✘.
- Prefer no backend: deterministic seeded daily, client-side. (ADR-0004 accepts
  spoofable counters, so light aggregate stats are available if a design needs them.)
- Daily + spoiler-free share + streak is the proven loop — depart from it only deliberately.
- iOS Safari is the primary target; assume muted phones (ANTHEM fights the audio
  problem already — game #2 should probably work silent).
- Evergreen past the final (19 Jul 2026) is preferred; tournament-window-only ideas
  are a separate tier.

## Round 1 (12 Jun 2026) — first principles

Premise: ANTHEM is a *knowledge* game with an *audio* input and a real knowledge
floor. Game #2 should sit on a different axis: low/zero knowledge floor, visual or
tactile, same daily-share DNA.

### Shortlist

| Idea | Pitch | Verdict |
|---|---|---|
| **GROUPS** ⭐ | Connections-style 4×4 wall: sort 16 qualified nations into 4 hidden groups (flag traits, geography, WC history, wordplay). Pun on the tournament's group stage. | Top pick: widest appeal, near-zero knowledge floor, reuses nation data/flags/share infra. Cost = editorial pipeline (~4 categories/day, bank of ~60 puzzles). |
| **ONE SHOT** ⭐ | One penalty kick per day. No retries. Score-or-miss streak. | Runner-up: boldest hook (rationing *attempts*, not puzzles), universal, 10-second play. Risks: device/latency feel on iOS, mechanically shallow, crowded genre — the scarcity framing must carry it. |
| **LINE-UP** | Five nations, one hidden stat (population, WC goals, distance to MetLife, anthem length), drag into order. | Solid but less distinctive; ordering games exist and none went huge. |
| **THE PREDICTOR** | Pick real daily results by tapping flags; scored against reality next day. | Tournament-window only, needs results ingestion, awkward next-day share. File as possible *third* layer during the tournament. |

### Rejected

- **Guess the player / footage** — image & broadcast rights (same reasoning that picked anthems).
- **Flagle-style flag reveal** — strong incumbents, derivative.
- **Host-city GeoGuessr** — 16 venues = pool exhausted in 16 days; photo licensing.
- **Border-path (Travle-like)** — direct incumbent.
- **Voting / fanbase rankings** — ruled out in ANTHEM's original research (cold-start).

## Round 2 (12 Jun 2026) — remixing viral-game mechanics

Owner asked to go further outside the box: study very simple games that went
viral, extract what made each one work, and remix into something new.

### Mechanics library — what each viral hit actually contributed

| Game | The extractable mechanic | Why it spread |
|---|---|---|
| Wordle (2021) | One shared daily puzzle + spoiler-free emoji share grid | Share grid invented by players, then built in; scarcity drives ritual |
| Heardle | Progressive reveal of media | Already ours (ANTHEM) |
| 2048 (2014) | Doubling-merge, "one more move" | Instant comprehension, near-miss compulsion |
| Flappy Bird (2013) | One button + brutal difficulty + instant retry | Score bragging; failure is funny |
| Suika / Watermelon (2023) | Physics merge toward a jackpot object | Visually satisfying chaos; near-misses |
| Crossy Road / Chrome dino | Endless + zero-friction restart | Soft failure, "just one more" |
| Piano Tiles | Tap to audio rhythm | Hypnotic; clashes with muted phones for us |
| Stack / Timberman | Pure timing precision | Tension + watchability |
| QWOP / Getting Over It | Deliberately awkward controls | Streamable failure comedy |
| Semantle / Globle | Continuous warmer/colder feedback (semantic / km distance) | Turns guessing into navigation |
| Tradle | Guess the country from a single data visualization | One chart = whole puzzle |
| Immaculate Grid (2023, ~200k/day) | Intersection trivia + **rarity score** (your answer scored by % of players who picked it) | Rarity makes *obscure* knowledge the flex |
| Poeltl | Attribute feedback on entity guesses | Wordle for things, not words |
| Google Feud / Family Feud / Pointless | **The crowd is the answer key** — guess what others said | Social comparison built into scoring |
| Infinite Craft (2024) | Combinatorial discovery + "First Discovery!" global treasure hunt | Needs an LLM backend — out of scope |
| The Password Game (neal.fun) | Escalating absurd rules | Comedy virality; one-shot novelty, weak daily ritual |
| Agar.io / slither.io | Real-time mass multiplayer | Needs real backend — out |
| r/place | Collective canvas + national pride | Pride engagement proven; needs backend + moderation |
| GeoGuessr / spot-the-ball | Place a point, scored by distance | Judgment, not knowledge — zero trivia floor |
| The Higher Lower Game | Binary comparison streak | Zero rules to learn |

Key recurring ingredients: **one gesture**, **instant retry or daily scarcity**
(two different compulsion loops — arcade vs ritual), **score that's inherently
shareable**, **failure that's fun to share**, and (the 2023+ wave) **the crowd
itself as content** (rarity scores, first discoveries).

### Remix candidates

**R1. TOP BINS — the daily penalty vs. the crowd** ⭐ (ONE SHOT × minority game × Feud)

One penalty per day, but **placement, not timing**: tap where in the goal you
shoot (continuous or 3×3 zones). The keeper's dive is computed from **where the
crowd has been shooting today/yesterday** (our existing aggregate-counter infra,
ADR-0004): he covers the hottest zones. You score by outguessing everyone else.
Corners beat the keeper more easily but carry a miss risk; centre is safe but
where keepers look first.

- A daily mass **game-theory game** (a minority game / Schelling-point game) —
  no known incumbent in any sport. Solves ONE SHOT's two weaknesses: no
  timing-latency unfairness on iOS (it's a choice, not a reflex), and the
  shallow mechanic gets depth from the evolving daily meta ("everyone went
  top-left yesterday…"). Discourse potential is the viral engine.
- Share card: the goal as a crowd heatmap + your shot + scored/saved + streak.
- Zero football knowledge needed; explainable in one sentence; one tap per day.
- Cold start: seed the keeper with a plausible prior distribution until real
  counters dominate. Counters are spoofable — acceptable per ADR-0004.

**R2. BRACKET — 2048 where the bracket is the board** (2048 × knockout format)

The knockout bracket *is* powers of two: 32 → 16 → QF → SF → Final → 🏆. Merge
tiles labelled with rounds; reaching the trophy tile = winning the World Cup.
**Daily seeded spawn sequence** — everyone worldwide plays the *same* game, so
"I reached the semi-final in 41 moves" is comparable, Wordle-style (classic 2048
never had that). Zero knowledge floor, proven-universal mechanic, fully
client-side. Risk: 2048 reskins are legion — the daily-seeded competitive twist
and the thematic fit are what make it defensible.

**R3. RARE PICK — rarity-scored daily category** (Pointless / Immaculate Grid's rarity score)

One prompt per day ("Name a nation that has ever hosted a World Cup", "Name a
2026 qualifier whose flag has no red"). Any correct answer wins — but your score
is **how few other players said it**. Uses existing counters. The flex inverts
trivia: deep cuts beat obvious answers, but casuals still always "win".
Risk: leans knowledge-ward on football-heavy days; prompt curation must keep
geography/flag days frequent.

**R4. SPOT THE BALL — the newspaper classic, daily** (spot-the-ball × GeoGuessr scoring)

Daily illustrated match scene (our own stylized art — licensing-clean), ball
removed; tap where it must be, judged by distance with GeoGuessr-style points.
Pure judgment, zero trivia, nostalgia hook, great share image (everyone's pins
on the same scene — needs counters only for the fun overlay). Cost: one
illustration per day — the heaviest content pipeline of the four.

**R5. KEEPY-UPPY — Flappy Bird is juggling** (Flappy × daily seed)

One-button keepy-uppy, daily seeded wind/bounce so scores are comparable; count
your juggles, instant retry *within* the day. Universal and kid-friendly, but
timing-feel across devices is a real risk, and arcade high-score dailies have a
weaker share story than puzzle grids.

### Parked / rejected in round 2

- **Anthem rhythm-tapper** (Piano Tiles × our PD recordings) — fun, but audio-on
  requirement + ANTHEM brand overlap → better as a future ANTHEM practice extra.
- **Infinite-Craft-style nation crafting** — needs an LLM backend.
- **QWOP-style goal-celebration rage game** — streamable comedy but heavy
  physics/content, no daily ritual.
- **Collective tifo canvas (r/place-like)** — backend + moderation burden.
- **Higher/Lower flag streak** — fine but thin; direct incumbent.

### Where this leaves the field

Three distinct flagship directions now on the table:

1. **TOP BINS** (round 2) — most novel; crowd-vs-crowd game theory; one tap/day; uses existing counter infra.
2. **GROUPS** (round 1) — safest bet with the widest proven appeal; editorial pipeline is the cost.
3. **BRACKET** (round 2) — proven-universal mechanic + daily-seed twist; fully offline-deterministic.

They're not mutually exclusive long-term (the hub wants a portfolio), but game #2
should be one of these. Owner call — see [questions.md](questions.md) item 6.

