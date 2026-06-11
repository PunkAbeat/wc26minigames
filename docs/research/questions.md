# Open questions

Things that need a human decision (mostly the owner's). Agents: do **not** resolve these silently — when one is decided, record it (ADR if durable) and remove it here.

1. **Domain name.** What does the public URL say — lean MATCHDAY (the brand), ANTHEM (the game), or something WC26-flavored? Affects `VITE_SITE_ORIGIN`, share links, the OG card footer, and the legal question below.
2. **FIFA wording.** Titles/copy currently say "World Cup 2026". Unofficial fan games commonly survive on nominative use, but the safe play before any traffic push is rewording titles ("WC26", "the tournament") and keeping FIFA marks/logos/crests out entirely. How much risk is acceptable?
3. **"MATCHDAY" as a name.** Working title; also a common football-app name (collision risk with EA/other products). Keep or rename before the domain purchase locks it in?
4. **Error monitoring choice.** Sentry free tier vs. a minimal Worker-side error log. Sentry adds a third-party script (tension with ADR-0003's no-third-party stance — though server-side-only Sentry avoids that).
5. **Stats abuse threshold.** ADR-0004 accepts spoofable counters. What visible weirdness (e.g. impossible 1-guess percentages) triggers the hardening work?
6. **Distribution.** Which channels first, and is there any budget at all? (r/soccer daily threads, football Twitter/TikTok during big matches, group-chat seeding.) Pure owner call; the product is ready to measure whatever is tried.
7. **Practice-mode anthems for the 3 audio-less nations** (Scotland/Curaçao/DR Congo): leave excluded, or source/record synth melodies? (Scotland's anthem is © 1967 — melody transcription is also a rights question.)
