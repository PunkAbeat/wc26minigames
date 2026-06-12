# Game #2 brainstorm

> **12 Jun 2026: owner picked GROUPS → prototyped same day → SCRAPPED same day**
> after the owner's first play: *"I don't like it at all, it feels really boring."*
> Code reverted (revert commits `e10ce51`/`93631bc`/`43af8fb`; the full prototype
> survives in history just before them if anything — puzzle bank, board CSS — is
> ever worth salvaging). Never deployed, so no user ever saw it. The lesson and
> the new candidate slate are in **round 3** below; selection is open again
> ([questions.md](questions.md) item 6). TOP BINS and RARE PICK still unlock
> only once there is real traffic.

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

### Owner constraint added (12 Jun 2026): no crowd-powered mechanics for now

The site has barely any traffic yet. Anything whose *core loop* needs other
players' inputs — **TOP BINS** (keeper = crowd heatmap) and **RARE PICK**
(score = answer rarity) — doesn't work cold: a seeded/bot "crowd" is just RNG
wearing a mask and loses the entire social magic. Both are **parked, not
killed**: they are flywheel games for *after* an audience exists (game #3+
candidates), the same way ANTHEM's global stats were layered on later.

### Where this leaves the field (re-ranked, crowd-free only)

1. **GROUPS** (round 1) — widest proven appeal (Connections is the current
   category leader), near-zero knowledge floor, reuses nation/flag/share infra.
   Cost: editorial pipeline (~4 categories/day; agents draft in bulk, owner QAs).
2. **BRACKET** (round 2) — proven-universal 2048 mechanic + the daily-seed
   "everyone plays the identical game" twist + perfect knockout theming.
   **Zero daily content cost** — fully deterministic and client-side, the
   cheapest to run of all candidates. Risk: 2048-reskin smell if the daily-race
   framing isn't front and centre.
3. **SPOT THE BALL** (round 2) — works crowd-free (scored against ground truth);
   judgment not trivia; but the heaviest content pipeline (one illustration/day).
4. **ONE SHOT**, original timing flavour (round 1) — crowd-free but carries the
   iOS timing-fairness and shallow-mechanic risks noted in round 1.

Game #2 should be **GROUPS or BRACKET**. Owner call — see
[questions.md](questions.md) item 6.

## Round 3 (12 Jun 2026) — after the GROUPS scrap: fun is a criterion

### What the scrap taught us

GROUPS scored top marks on all four round-1 criteria (unique-ish, WC-themed,
simple, wide appeal) and the owner found it boring on first contact anyway.
The criteria missed a dimension. GROUPS plays as: read 16 names → think → tap
four → submit. A static deduction board — no motion, no tension, no payoff
beyond "correct". ANTHEM works because every guess has *drama* (the audio
reveal, the aha). Connections works for NYT because that audience comes to
think; ours comes from football.

**Criterion #5, now explicit: the core ten seconds must feel good** — motion,
tension, or comedy; something you'd happily do once more even after the puzzle
value is spent. This rules out the remaining knowledge/board candidates
(LINE-UP, RARE PICK even post-traffic as designed) and re-centres the
action/judgment quadrant of round 2, which had been rated down for build cost
rather than appeal. Cheap-prototype-then-judge worked exactly as intended:
one day spent, honest verdict, nothing shipped.

### Round-3 slate (all crowd-free, backend-free, daily-seeded, silent-friendly)

**C1. KEEPER ⭐ — you are the goalkeeper** *(new)*

Five penalties per day, same seeded sequence worldwide. The shooter's run-up
carries readable tells (approach angle, open hips, eyes, plant foot — a daily
"shooter personality"); you commit your dive with one tap or swipe
(left/centre/right, optionally ×high/low). Saves out of five = the score;
share grid `🧤🧤❌🧤❌ 3/5` + streak.

- Nobody plays *as* the keeper in daily-ritual form — searched 12 Jun: arcade
  keeper games exist (CrazyGames etc.), zero Wordle-form incumbents. Inverting
  the obvious penalty-taker fantasy is the hook.
- Choice-under-tension, not millisecond reflex → iOS-fair (generous commit
  window; reading the tell is the skill). Failure is funny; 5/5 is rare and
  braggable. Drama is *in* the loop, not painted on.
- Content cost is parameter sets, not prose: each day = 5 shot definitions
  (tell strength, direction, fake-or-honest). Cheap to bank 40+ days.
- Risk: tell design **is** the game — too readable = trivial, too subtle =
  coin flip. Needs real animation craft on the run-up. Prototype question #1:
  can a 2D run-up communicate a tell at all?

**C2. FREE KICK — the same daily set piece for everyone** *(round-2 R5 cousin)*

Swipe to curve the ball over the wall; wall/keeper/wind seeded daily,
identical worldwide; score = attempts until it goes in, golf-style share
("⚽ in 2").

- The most pure *juice* on the slate; one gesture; zero knowledge floor.
- Risks: the flick-football arcade genre is crowded (a "Free Kicks World Cup
  2026" browser game already exists) — only the daily-seed ritual
  differentiates; swipe-physics tuning and cross-device determinism are the
  heaviest build risk of the four.

**C3. FLAG DRAW — draw today's flag from memory** *(wildcard, comedy axis)*

One qualified nation per day; draw its flag from memory with a finger;
client-side pixel/colour-region match scores you a %. Share = score (and the
share card could show your atrocity next to the real flag).

- The QWOP / Password-game lesson: failure-comedy spreads. Flags are universal
  (zero football floor); casuals do better than they expect, experts get
  humbled by Ecuador's coat of arms.
- Incumbents exist (a neal.fun-style "Draw Flags from Memory", a
  pick-the-components draw-the-flag.web.app) but none daily/WC-scoped —
  weakest "truly unique" claim on the slate. Generous, fair-feeling scoring is
  make-or-break; drawing UX on iOS is real work.

**C4. BRACKET — held from round 2** *(the safe option)*

Still the cheapest to run (zero daily content) and merging is tactile in a way
GROUPS never was. But it inherits the GROUPS risk: it is still a board puzzle,
*themed* football rather than *feeling* football. If the scrap verdict means
"give me football, not puzzles", BRACKET is the wrong lesson to draw.

### Agent recommendation

**KEEPER.** Most open lane, most football, drama native to the loop, content
cost manageable, iOS-fair by construction. FREE KICK if the owner wants
maximum juice and accepts the physics-tuning risk. Either way: before any
full prototype this time, a one-screen feel mock (the run-up + dive moment, or
the swipe + ball flight) for an on-device gut check — judge the ten seconds
first, build the daily shell only after it survives.

## Round 4 (12 Jun 2026) — genre-wide, owner asked to drop the self-imposed restrictions

Owner: open to *any* kind of game (physics, cards, …) as long as it is unique
and football/World-Cup linked. So this round deliberately ranges across genres
instead of iterating on the daily-puzzle formula. Still binding: licensing
(no players/footage/kits/marks), iOS Safari, no crowd mechanics yet, prefer
no backend. No longer assumed: that it must be a *puzzle*, or even strictly
once-per-day.

Incumbent checks done 12 Jun: player-based daily trumps exists
(playfootball.games "Pack 11"); Crossbar Challenge exists as an arcade game on
every portal; referee/VAR judgment is taken (offsideornot.com, multiple
Referee Simulator apps) — **THE CALL idea is dropped**. Nation-based stat
duels and pass-drawing games: nothing found.

### Round-4 slate

**D1. SQUAD ⭐ — the nations card duel** *(card game, new)*

All 48 qualified nations as cards with licensing-clean stats (WC titles, WC
appearances, all-time WC goals, FIFA-ranking points, population, land area —
public facts). Daily seeded deal: you and the rival each get 5 cards; you see
your hand, **order it**, and each round **pick which stat to fight with**
before the rival's card flips. Best of 5, share grid `🃏 W-W-L-W-L 3-2` +
streak.

- The skill is *distribution intuition*, not trivia: holding Iceland, you
  don't pick population — and that reasoning is available to a non-fan within
  two rounds. Card-flip reveal = drama every ~8 seconds; "I won the day with
  Curaçao" is a story.
- Cheapest build on the slate by far: no physics, one stats table (one-time,
  fact-checkable), reuses flags/share/streak infra; perfectly i18n-able;
  evergreen. A "draft your squad" roguelite variant is an obvious v2.
- Uniqueness: official Top Trumps and the playfootball.games daily are
  *player*-based guessing; a nations duel with open-hand stat selection has no
  incumbent found. (Never use the trademark "Top Trumps" anywhere.)
- Risk: vs. a seeded AI hand, luck share is real — hand-ordering + stat choice
  must carry enough agency that losing feels like your fault. Mock answers this.

**D2. SHOOTOUT — the full penalty shootout, daily** *(action/drama; subsumes round-3 KEEPER)*

Best-of-5 vs a seeded daily rival nation: you alternate **taking** penalties
(pick placement; the AI keeper has a readable lean) and **saving** them (read
the run-up tell, commit a dive). Sudden death on a tie. Share
`⚽🧤❌⚽🧤 4-3` + streak.

- The penalty shootout is *the* World Cup drama artifact — finals are decided
  by exactly this. Both fantasies (score the winner, make the save) in one
  loop; tension is structural, not decorative.
- Same iOS-fair choice-under-tension base as KEEPER; daily content = two
  parameter sets (shooter tells, keeper lean). Arcade penalty games are
  legion, but none daily-seeded with learnable tells — the ritual + the
  read-the-tell meta is the unique claim.
- Risk: tell/lean design is the game (KEEPER's risk, doubled — both halves
  must feel readable, not random).

**D3. THREAD — draw the killer pass** *(skill/judgment, new; lane confirmed open)*

A frozen attack: your playmaker, moving defenders sweeping seeded patrol
paths, a striker making a run. **Draw the through-ball line with your finger
and choose the moment to release.** The ball follows your line at real speed;
intercepted or completed. 3 phases per day, touches-style share.

- The playmaker fantasy is unserved (every football game is shooting);
  "threading the needle" is inherently satisfying — your finger drew the
  assist. Searched: nothing comparable exists.
- Risk: needs careful tuning so interceptions read as fair; mid build cost
  (path animation, line capture, collision).

**D4. BICYCLE KICK — ragdoll glory** *(physics/comedy, new)*

A cross floats in (seeded daily). Two taps: jump, kick. Ragdoll physics does
the rest — sometimes a screamer, usually a faceplant. Score = goal or comedy;
best-of-3; share is the outcome emoji plus a canvas still of your ragdoll's
finest moment.

- The QWOP/failure-comedy lane from round 2, but *football-native* (everyone
  understands attempting an overhead kick and why it goes wrong). Instant
  retry compulsion + daily comparable attempt.
- Risk: physics comedy is hard to make funny *reliably*; ragdoll on matter.js
  needs tuning; weakest "score" story of the four.

### Held from earlier rounds
FREE KICK (max juice, crowded genre — a crossbar-target variant would borrow
Soccer AM's beloved challenge), BRACKET (cheap, but board-puzzle risk class),
FLAG DRAW (comedy but weakest football link). Parked for traffic: TOP BINS,
RARE PICK. Dropped: THE CALL (incumbents).

### Agent recommendation (round 4)

Mock **SQUAD and SHOOTOUT in parallel** — both feel mocks are one screen and
together they cost about a day: SQUAD's mock is two cards, a stat pick and a
flip; SHOOTOUT's is the run-up + dive moment. They sit on opposite ends of the
genre range (cool-headed cards vs. heart-rate action), so the owner's gut
reaction to the pair will say more about direction than any ranking on paper.
THREAD is the dark horse if neither lands.

## Round 5 (13 Jun 2026) — SQUAD parked; criteria relaxed; owner proposes FLAG SORT

**SQUAD is parked** (not scrapped). The v1 feel mock got "may be a good
direction but something feels off"; the v2 excitement pass (visible rival
before the flip, GOAL!/scoreline framing, dim-zoom-countup reveal, "#k of 48"
rank chips, golden-goal sudden death — commit `31206c6`) was built, and the
owner chose to park the direction rather than iterate further. The mock stays
at `app/public/mock/squad.html` (`/mock/squad` on the preview). ⚠️ `app/public/`
ships with `npm run deploy` — remove or gate the mock before any production
deploy.

**Criteria relaxed (owner, 13 Jun):** uniqueness is **no longer a hard
criterion**, and game #2 **does not have to be a daily game**. Still binding:
football/WC link, licensing-clean assets, iOS Safari first, fun-in-ten-seconds
(criterion #5), no crowd mechanics yet. Non-daily aligns with the ADR-0007
growth thesis: value-per-visit over scarcity.

### E1. FLAG SORT *(owner-proposed: water-sort mechanics, but you build country flags)*

Tubes of layered colors, pour same-onto-same, limited spare capacity — the
proven water-sort loop — except the win state is a **country flag**, not
uniform tubes.

Incumbent scan (13 Jun): the genre is saturated on app stores, including flag
skins — "Flags Color Sort Puzzle" (Google Play), "Flag Sort Game: Sorting
Puzzle" (App Store), "World Flags: Color Puzzle" (paint-by-color). All are
ad-stuffed hyper-casual; **no polished web version found**, and the daily/web
flag space is guessers (Flagle, Flag Pixel), not sorters. Under the relaxed
criteria this is acceptable — the claim is execution + WC26 framing, not
mechanical novelty.

Design fork, and it matters:

- **(a) Reskin:** uniform-tube sort where the liquids happen to be flag
  colors, completed set = "Japan unlocked". Cheapest, but the flag is
  decoration — exactly what the store clones do.
- **(b) Target-pattern sort:** the goal is a **frame whose layers must match
  the flag's stripe order** (Germany: black/red/gold bottom-up). The flag *is*
  the puzzle; reading the target changes every move. This variant has no
  incumbent found and is the recommended shape. Solvability by construction:
  generate levels by reverse-pouring from the solved flag.

Fit: pour-and-glug satisfaction is pre-validated by the genre (criterion #5
nearly free); zero knowledge floor; silent-friendly; one-finger. Completion
payoff writes itself: last pour lands → emblem/crest stamps on (Japan's disc,
Portugal's shield — stylized, licensing-clean state symbols need a per-flag
check) → flag waves. Non-daily structure: the 48 qualified nations as a level
ladder (tricolors early, emblem flags late), natural "group stage" packs.

Risks: **the pour animation is the entire game** — a feel mock that doesn't
nail tilt/stream/settle on iOS Safari under-sells the genre rather than
testing the idea; emblem-heavy flags (Brazil, Croatia…) need stylization
rules; football link is flag-level (same strength as ANTHEM — consistent, but
thin).

### Agent recommendation (round 5)

Feel-mock FLAG SORT as variant (b): one screen, one flag (Germany — three
clean stripes), 5–6 tubes, real pour animation, completion flourish. The mock
must answer two things: does the pour feel as good in mobile-Safari CSS/JS as
it does in the native clones, and does aiming at a flag pattern feel different
from sorting to uniform tubes. SHOOTOUT remains the standing alternative if
sorting doesn't land.

