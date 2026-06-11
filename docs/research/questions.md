# Open questions

Things that need a human decision (mostly the owner's). Agents: do **not** resolve these silently — when one is decided, record it (ADR if durable) and remove it here.

1. **"MATCHDAY" as a name.** Working title; also a common football-app name (collision risk with EA/other products). Keep or rename before the domain purchase locks it in?
2. **"ANTHEM" as a name.** Owner asked for catchier/viral options (11 Jun). Agent's take: keep ANTHEM — short, evocative, already on the share card. Candidates if renaming: BANGER, KICKOFF, TUNED. Decide before launch; renaming after costs share-text/brand continuity.
3. **Stats abuse threshold.** ADR-0004 accepts spoofable counters. What visible weirdness (e.g. impossible 1-guess percentages) triggers the hardening work?
4. **Distribution.** Which channels first, and is there any budget at all? (r/soccer daily threads, football Twitter/TikTok during big matches, group-chat seeding.) Pure owner call; the product is ready to measure whatever is tried.
5. **Practice-mode anthems for the 3 audio-less nations** (Scotland/Curaçao/DR Congo): leave excluded, or source/record synth melodies? (Scotland's anthem is © 1967 — melody transcription is also a rights question.)
6. **Localization scope.** Owner wants all participating nations' languages (~30). Agent's recommendation: phased — extract strings, launch EN+ES+FR (host languages), expand on traction. The hard part is per-language picker aliases, not the UI strings. Needs an owner call on scope before the i18n work starts.
