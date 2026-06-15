# Game #3 brainstorm — the runner

> **15 Jun 2026: owner proposed a football take on the Chrome Dino runner**
> (https://poki.com/en/g/dinosaur-game), "adapted to our setup and designs here."
> Brainstormed same day. Owner picked **solo-breakaway / hurdle framing + seeded
> daily** and asked to document + prototype. Feel mock at `/mock/breakaway`.

Working document for the third MATCHDAY game. Decision lives here; the binding
project criteria are inherited from [game2-brainstorm.md](game2-brainstorm.md)
(football/WC link, licensing-clean assets, iOS Safari first, **criterion #5: the
core ten seconds must feel good**; uniqueness no longer hard, daily no longer
required).

## Why a runner fits the slate

Three games, three different muscles:

| Game | Axis | Input | Knowledge floor |
|---|---|---|---|
| ANTHEM | audio / knowledge | listen + guess | real (anthems) |
| HOIST | tactile / puzzle | pour + plan | ~zero |
| **BREAKAWAY** (#3) | **reflex / timing** | **one tap** | **zero** |

A runner is natively **silent** (the Dino has no sound) — so it sidesteps the
muted-phone problem ANTHEM has to fight. Zero knowledge floor, one-glance grasp,
one-gesture play. Ticks every binding criterion.

## The chosen design

**Fantasy:** the solo counter-attack. You've won the ball, it's a breakaway to
goal, defenders throw themselves at you, you hurdle through them. The Dino
skeleton is genre-agnostic — auto-run, single input, escalating speed, one life,
instant retry — what sells it is the *verb* (hurdle a tackle) and the *skin*
(stadium, flags, the bracket).

**Input vocabulary (kept Dino-simple):**

- **Tap (anywhere) = hurdle** — leap a sliding tackle / outstretched leg. This is
  the cactus. The primary ~95% input. A short *hold* extends the jump (variable
  height) for feel.
- **Hold / swipe-down = slide-through / duck** — under a flying clearance, a
  keeper's punch, a high boot. This is the pterodactyl. *Deferred past the feel
  mock* — prove the jump first (see process rule below).

**Two hooks borrowed from our own spine:**

1. **Run as your nation.** Pick a flag (all 48 already vendored from HOIST). The
   runner carries it as a pennant; crowd/bunting tint to the nation's colours.
   Ties #3 to the other two games and reuses the asset library.
2. **Distance = the bracket.** Distance bands map to the knockout rounds, mirroring
   HOIST's "ROAD TO THE FINAL": Group Stage → Round of 32 → Round of 16 →
   Quarter-Finals → Semi-Finals → **FINAL**, each crossing firing a milestone
   banner + crowd-roar beat (the Dino's day/night cycle, but *meaningful* — the
   stadium shifts toward night floodlights as you climb the bracket).

**The decision that separates it from the infinite Dino: SEEDED DAILY.** A random
endless run isn't comparable, so it can't carry the proven daily/share/streak
loop. Fix: everyone faces the **identical** obstacle sequence today (seeded off the
UTC day via the existing `mulberry32`/`dayNumber` helpers in
`src/lib/anthem/daily.ts`). Now "I reached the Quarter-Finals" is a real,
comparable, spoiler-free flex (Wordle-style). Plus **uncapped free-play** with a
random seed for the "one more try" itch ([ADR-0007](../adr/0007-uncapped-free-play.md)).

Share line example: *"🇲🇦 I reached the Quarter-Finals · 1,240m. Today's run at
host/breakaway"* + emoji-bracket fallback.

## Where it lives or dies: the ten seconds

A runner is **all feel** — gravity curve, hang time, whether the hurdle pose reads,
and above all **fair hitboxes on a 390px screen**. GROUPS died for being boring;
HOIST's liquid had to be redone until it felt right. So per the standing process
rule, the **feel mock is the jump and nothing else**: runner + tap-to-hurdle + one
ground obstacle + the speed ramp + the seeded sequence + bracket milestones (the
milestones are cheap and frame the run). No duck, no flag-picker, no i18n, no daily
shell until the jump survives an on-device gut check.

## Open forks (decide after the mock feels good)

- **Variable jump height** (hold-to-float) vs fixed impulse — mock ships variable;
  judge on device.
- **Retry = same seed or reseed** — mock retries the *same* daily seed so the feel
  is judged against a constant course.
- **Duck/slide second input** — adds a skill ceiling; only worth it if jump-only
  feels thin.
- **Art:** runner must be an original stylized silhouette — **no real players,
  kits, or FIFA marks** (licensing-clean). The differentiator is the flag, not a
  likeness. Mock uses a generic gold-jersey runner + ball.

## Name candidates

**BREAKAWAY** (lead — it *is* the fantasy) · COUNTER · ON THE BREAK · SOLO RUN ·
MAZY. Working title for the mock route: `breakaway`.

## Status

- 15 Jun: design chosen, this doc + feel mock (`/mock/breakaway`) built. Verified
  end-to-end (CDP real-time drive: demo bot survives 600m+, ramp + bracket
  milestones fire, 0 exceptions; screenshot reads clearly).
- **15 Jun — PARKED.** Owner played the feel mock: *"not satisfied at the moment
  with it."* No specific cause captured (the jump feel, the runner-genre fit, or
  something else — worth a one-liner if it comes to mind). Parked, **not scrapped**
  — same status as SQUAD. The mock at `/mock/breakaway` is kept and recoverable
  (already stripped from prod by `build:prod`); nothing was ever deployed. Pick the
  next direction; revisit if the runner itch returns.

---

# Direction B — KEEPIES (Doodle Jump climber) — 15 Jun 2026

> After BREAKAWAY was parked, owner proposed a **Doodle Jump-style vertical climber
> with a nice-looking bouncing football**. Decisions taken at brainstorm:
> **touch-steer + desktop arrow keys**, **flag-skinned ball**, comparable-scores
> (seeded daily vs free-play) **left open**. Documented + feel-mocked same day.

**Why it fits even better than the runner:** a ball *wants* to bounce, so Doodle
Jump's auto-hop avatar and a football are the same object — and it's a natural
showcase for the "nice ball." Football-native (keepy-uppy = keep it in the air).

**Fantasy:** the ball auto-bounces upward forever; you steer left/right to land the
next bounce on a platform; miss everything and it drops out the bottom. Score =
height climbed.

- **Platforms = headers** — each is a generic footballer (licensing-clean
  silhouette) nodding the ball higher; you climb a tower of players keeping it up.
- **Boosts = football moments** — keeper's punt = jetpack/long-boost; overhead/
  bicycle-kick = mega-bounce; fan's banner = trampoline.
- **Height = a stadium ascent** — Pitch → Lower Tier → Upper Tier → Roof →
  Floodlights → open sky → a golden World Cup trophy at the top. (Same milestone
  idea that framed BREAKAWAY, but here it's *spatial* — you're literally climbing —
  so it earns its place instead of repeating.)

**Input (decided): touch-steer + arrows.** Touch-steer (ball x eases toward the
finger, drag-anywhere "follow finger"; bounce automatic) is primary — no iOS
permission prompt (unlike `DeviceOrientation` tilt, gated since iOS 13 + flaky),
works one-handed, more precise than tilt on a phone. **Arrow keys** make it playable
on desktop. Tilt is an opt-in we can add later, not now.

**The hook into our spine (decided): the ball IS your nation.** Default to a flag-
skinned ball — wrap one of HOIST's 48 vendored flag SVGs (`/flags/<iso>.svg`) onto
the ball with spherical shading + spin so it reads as a glossy 3D ball, not a
sticker. The "nice ball" becomes the personalization and the WC26 tie — your flag
bouncing up the stadium to the trophy.

**Comparable scores — OPEN.** Seeded-daily climb (everyone gets the same platform
layout today → comparable height, Wordle-style, streak/share) vs pure free-play
endless. Owner undecided; the mock is seedable (`?seed=N`) so either can be chosen
after the feel lands.

**Licensing:** generic unbranded ball + our own flag assets + silhouette players —
no FIFA marks, no real ball brand, no player likenesses. Clean.

**Where it lives or dies (criterion #5):** bounce-height consistency, gravity, how
tight the steering is, the dopamine spikes from springs — and the owner-specified
*the ball must look great*. Per the process rule the feel mock is the central
interaction only: a gorgeous bouncing flag-ball + touch/arrow steer + a couple
platform types + one boost. No flag-picker UI, no daily shell, no enemies until the
bounce survives an on-device gut check.

**Name candidates:** **KEEPIES** (keepy-uppies — lead) · HEADER · UP TOP · SKY BALL
· ALTITUDE. Working route title: `keepies`.

### Status (Direction B)

- 15 Jun: design chosen, this section + feel mock (`/mock/keepies`) built.
- 15 Jun — **iteration 1** after owner played it: bounce + steer "ok for now";
  unsure about the flag-in-ball ("feels a bit weird") but likes the idea. Changes:
  - **Ball look.** Root cause of "weird" was the flag doing a full 360° spin
    (reads as a spinning plate). Two styles now, toggle via the **⚽ STYLE** button
    (or `?ball=`): **crest** (default) = a real white football whose black panels
    spin to show the roll, with an upright, always-readable flag badge in a gold
    ring; **wrap** = the all-flag ball, but tilt clamped to ±~14° + faint seams +
    gloss so it reads as a sphere, not a disc.
  - **Flag-picker UI.** 🇫🇷 button opens a 48-flag grid (real `/flags/*.svg`
    thumbnails); pick reskins the ball live. Game pauses while open.
  - **Platform types.** Added **breakable** (brown, crumbles + falls after one
    bounce) and **keeper-punt jetpack** (cyan gloves pad, ~2.9× mega-boost) to the
    existing norm / spring / moving. Height-gated spawn rates.
  - Verified via CDP: climbs through LOWER + UPPER TIER to ~350m, all five platform
    types appear, both ball styles render, picker hook works, build green, 0
    exceptions. Bugs fixed earlier in the session: NaN platform-gen (state read
    before init) and too-weak initial launch.
  - Headless hooks added: `window.__kpSet({flag,ball,pick})` alongside `__kp()`.
- Awaiting owner on-device gut check on the new ball styles + the added mechanics.
- 15 Jun — **owner kept the flag-wrap ball** (crest dropped as default; `?ball=crest`
  still available). Spin clamped to a readable tilt; open Q whether owner wants the
  fuller original spin back.
- 15 Jun — **direction locked: 48 endless courses, best-height per flag.** Rationale:
  per-nation *ranking* was rejected (owner: a cosmetic skin can't decide "which nation
  wins" — PR landmine). Distinct *boards* dissolve it: heights across different layouts
  aren't comparable, so it's "48 courses" not "48 ranked nations" (same framing as
  HOIST's 48 puzzles). Feasibility verdict: **easier than HOIST** — reachability is
  local/analytic (generate-by-construction: next platform always within the bounce
  envelope; no solver), and the geometry classification is reused from HOIST. Scope is
  realistically **~8 layout archetypes × 48 flag themes**, not 48 bespoke levels.
  Caution noted: this makes KEEPIES structurally rhyme with HOIST (verb differs:
  bounce vs pour) — chose endless+best-height (not a 2nd campaign) to keep it the
  distinct reflex pillar.
- 15 Jun — **STEP 1 BUILT & VERIFIED: 3-archetype proof (Germany/France/Japan).**
  `courseFor(iso)` maps flag→archetype; `spawnAbove` biases platform *x* by archetype
  (lanes weave between 3 columns; disc curves around the sun; bands/open = free
  spread) while the vertical-gap rule keeps every board climbable by construction.
  Faint flag-geometry backdrop dominates the low climb and fades by ~360m into the
  shared sky (per-flag identity at the start, universal climb above). Picker switch
  resets into the new course. Verified via CDP: de→bands, fr→lanes, jp→disc, all
  generate + climb, flags load, build green, 0 exceptions; three screenshots confirm
  the journeys read as genuinely different. Tuning noted for later: bands/disc
  backdrop colours muddy slightly over the teal sky (alpha blend). `?flag=de|fr|jp`.
  **Next if owner likes it:** map all 48 to archetypes (reuse HOIST classification) +
  the remaining ~5 archetypes; per-flag best-height persistence + a course-select grid.
- 15 Jun — **owner approved the direction → STEP 2 BUILT & VERIFIED (all 48).**
  - **48→8 archetype map** (`COURSE` in the mock): bands·17, lanes·9, disc·6, cross·5,
    triangle·3, diagonal·2, canton·5, open·1. `courseFor(iso)` resolves; `open` is the
    fallback.
  - **Remaining archetype placements** in `spawnAbove`: cross = central column +
    occasional horizontal arm; diagonal = slow L↔R drift; triangle = sharp zigzag/
    chevron. (lanes/disc/spread already done.) Reachability invariant unchanged.
  - **Backdrop reworked to the REAL flag** (`drawImage(flagImg)`): the flag fills the
    low climb and slides down as you ascend (rise out of your nation into the shared
    sky). Accurate for all 48, zero per-flag colour coding, and it kills the
    muddy-blend tuning issue. Layout = journey, flag image = identity.
  - **Per-flag best-height** persisted in `localStorage["kp_best"]` (`{iso:metres}`);
    death screen shows NEW BEST! + the course's PB.
  - **Course-select grid**: the picker is now "CHOOSE YOUR COURSE" — all 48 real flags
    with a best-height badge under each (gold when set), HOIST "ROAD TO THE FINAL"
    styling; tap = play that course.
  - Verified via CDP: grid = 48 cells; cross/diagonal/triangle/canton/open each
    generate climbable boards + load flags; best-height persists (`{"ch":130}` after a
    run) and badges the grid; build green, 0 exceptions; screenshots confirm distinct
    journeys (SA diagonal, CZ chevron, course-select grid). Fixed a stray
    "undefined course" label.
  - Awaiting owner on-device pass over the full 48-course set + the select grid.
- 15 Jun — **comparable-scores fork RESOLVED: pure free-play** (owner). No seeded
  daily; each run reseeds a fresh random course (`?seed=N` still pins one for testing).
  The "Today's MATCHDAY" daily-triptych idea is dropped for KEEPIES; best-height per
  flag stays the meta. Footer reads "free play".
- 15 Jun — **STEP 3 juice (owner pick): punt trail + trophy-at-the-top.**
  - **Punt trail**: a cyan comet trail streams below the ball whenever it rises fast
    (intensity from `-vy`; strong on keeper-punt, faint on springs, none on normal
    bounces). Trail points shift with world-scroll so they stay glued.
  - **Trophy-at-the-top**: reaching OPEN SKY (1300m) fires a celebration — vector gold
    trophy + glow, "TROPHY LIFTED! / CHAMPION OF THE WORLD — keep climbing", confetti
    burst — then the endless climb continues (no finish; it's the payoff, not a stop).
  - Verified via CDP (added `__kpSet({m,vy,celebrate})` test hooks + `celebrateT` in
    `__kp`): trophy fires at OPEN SKY (celebrateT≈2.5), trail renders on forced punt
    velocity, free-play seed is random per run, build green, 0 exceptions; screenshots
    confirm both. Committed at `3e8d434` was the pre-juice 48-course state; this juice
    pass is the next commit.
