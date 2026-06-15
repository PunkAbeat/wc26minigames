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
