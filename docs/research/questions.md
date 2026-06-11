# Open questions

Things that need a human decision (mostly the owner's). Agents: do **not** resolve these silently — when one is decided, record it (ADR if durable) and remove it here.

1. **Domain name.** Owner floated `wc26minigames.<tld>` — works but long and rhythm-less for word-of-mouth. Agent's shortlist to check availability: **`wc26.games`** (first pick: short, the TLD does the work), `wc26mini.games`, `matchday26.com`. Tournament-bound names (wc26) retire in 2030 — accepted tradeoff vs. an evergreen brand. Affects `VITE_SITE_ORIGIN`, share links, the OG card footer, and the legal question below.
2. **FIFA wording.** Titles/copy currently say "World Cup 2026". Unofficial fan games commonly survive on nominative use, but the safe play before any traffic push is rewording titles ("WC26", "the tournament") and keeping FIFA marks/logos/crests out entirely. How much risk is acceptable?
3. **"MATCHDAY" as a name.** Working title; also a common football-app name (collision risk with EA/other products). Keep or rename before the domain purchase locks it in?
4. **"ANTHEM" as a name.** Owner asked for catchier/viral options (11 Jun). Agent's take: keep ANTHEM — short, evocative, already on the share card. Candidates if renaming: BANGER, KICKOFF, TUNED. Decide before launch; renaming after costs share-text/brand continuity.
5. **Error monitoring choice.** Sentry free tier vs. a minimal Worker-side error log. Sentry adds a third-party script (tension with ADR-0003's no-third-party stance — though server-side-only Sentry avoids that).
6. **Stats abuse threshold.** ADR-0004 accepts spoofable counters. What visible weirdness (e.g. impossible 1-guess percentages) triggers the hardening work?
7. **Distribution.** Which channels first, and is there any budget at all? (r/soccer daily threads, football Twitter/TikTok during big matches, group-chat seeding.) Pure owner call; the product is ready to measure whatever is tried.
8. **Practice-mode anthems for the 3 audio-less nations** (Scotland/Curaçao/DR Congo): leave excluded, or source/record synth melodies? (Scotland's anthem is © 1967 — melody transcription is also a rights question.)
9. **Localization scope.** Owner wants all participating nations' languages (~30). Agent's recommendation: phased — extract strings, launch EN+ES+FR (host languages), expand on traction. The hard part is per-language picker aliases, not the UI strings. Needs an owner call on scope before the i18n work starts.
