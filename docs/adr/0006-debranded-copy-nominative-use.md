# ADR-0006: De-branded copy — no FIFA marks in product-name positions

**Status:** accepted (2026-06-11, owner decision)

## Context

Titles, OG tags, the PWA manifest, on-page kickers, and the viral share text all
said "World Cup 2026" / "World Cup". Unofficial fan projects commonly survive on
nominative use, but using the mark *as part of the product's name* (titles, share
text that travels detached from the site and its disclaimer) is the pattern that
loses that protection. This was open question #1 in research/questions.md; the
owner chose the full de-brand before any distribution push.

## Decision

- **Product-name positions never carry the mark.** Titles/OG/manifest say
  "WC26" or nothing ("MATCHDAY ⚽ WC26 mini games", "ANTHEM ⚽ Guess the nation
  from its anthem"); kickers say "Summer 2026"; descriptions say "the 2026
  tournament"; the share text ends "Name the nation from its anthem".
- **Factual, descriptive uses stay.** Puzzle hints ("Hosted the previous World
  Cup", group letters) are nominative statements about teams, the same way news
  coverage uses the term — they are not reworded.
- **Both pages carry the disclaimer** "Unofficial fan project · not affiliated
  with FIFA" (previously hub-only; the shared-into page /anthem had none).
- **No FIFA visual marks ever**: no logos, crests, trophy, mascots. (Audited
  2026-06-11: OG image and icons are an original ball-on-green design.)
- "MATCHDAY" as the hub name stays for now — its collision risk is
  questions.md #2 and remains open.

## Consequences

- Future copy (new games, emails, social posts) follows the same line: the mark
  may describe, never name. Share strings get the strictest treatment because
  they travel without the disclaimer.
- SEO trades "world cup" keyword strength in titles for legal safety; the
  descriptive uses and the domain (wc26minigames.com) keep the topical signal.
- Tests pin the share text (`game.test.ts`); copy changes there are intentional.
