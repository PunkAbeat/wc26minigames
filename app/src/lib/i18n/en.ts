/* English — the source of truth. Every other language file must provide a
   full Record<StringKey, string> (the compiler enforces completeness).
   ' ' = non-breaking space (keeps "MATCH #5" on one line);
   '**spans**' render as <b> via tb(). */

export const en = {
  /* ---- hub ---- */
  hub_kicker: 'Summer 2026 · Mini Games',
  hub_sub1: 'Mini games for the 2026 tournament.',
  hub_sub2: 'One stadium, many games.',
  kickoff_soon: 'KICKOFF SOON',
  kickoff_in: 'KICKOFF IN {t}',
  tournament_live: 'TOURNAMENT LIVE · DAY {n}',
  full_time_2030: 'FULL TIME · SEE YOU IN 2030',
  anthem_tagline: 'Hear a snippet of a national anthem, guess the nation in six tries.',
  badge_live: 'Daily · Play now',
  badge_soon: 'Coming soon',
  tba_tagline: 'Next fixture being scheduled…',
  play_cta: 'PLAY',
  nl_title: '🔔 More games are coming',
  nl_sub: 'Want a heads-up when the next one drops? No spam — only new games.',
  nl_placeholder: 'you@example.com',
  nl_button: 'Keep me posted',
  nl_done: '✅ You’re on the team sheet — we’ll email you when a new game drops.',
  nl_error: 'That didn’t go in — check the address and shoot again.',
  hub_foot1: 'Unofficial fan project · not affiliated with FIFA.',
  hub_foot2: 'Anthem audio: public-domain recordings by the U.S. Navy Band via archive.org.',

  /* ---- anthem: header / player ---- */
  an_kicker: 'Summer 2026 · Daily',
  an_sub: 'Guess the nation from its anthem',
  an_games_link: '⚽ Games',
  practice_label: '🎯 FREE PLAY',
  clip_unlocked_1: '1 second unlocked',
  clip_unlocked_n: '{n} seconds unlocked',
  clip_solved: 'Solved! 🎉',
  clip_out: 'Out of guesses',

  /* ---- anthem: guessing ---- */
  guess_placeholder: 'Your guess…',
  no_match: 'No qualified nation matches',
  tried_tag: 'tried',
  shoot: 'SHOOT',
  skip: 'Skip',
  guess_n_of_6: 'Guess {n} / 6',
  hint_lock: '🟨 A hint card unlocks with each miss',
  tag_goal: '✓ GOAL',
  tag_miss: '✗ MISS',
  tag_skip: 'SKIP',
  toast_type_first: 'Type a country first',
  toast_pick_list: 'Pick a country from the list',
  toast_copied: 'Copied — paste it anywhere ✓',

  /* ---- anthem: end screen ---- */
  goal_excl: 'GOAL! ⚽',
  off_target: 'OFF TARGET',
  about_anthem: 'About this anthem ↗',
  streak_n: '🔥 Streak {n}',
  archive_chip: '📅 Archive',
  practice_chip: '🎯 Free play',
  share_result: '📋 Share result',
  stats_btn: '📊 Stats',
  another_anthem: '▶ Another anthem',
  next_anthem_in: '⏱ Next anthem in {t}',
  global_solved: '📊 {p}% of today’s players solved it',
  global_in_n: ' · {p}% in {n} or fewer',
  practice_mode: '🎯 Free play — every anthem',
  back_to_today: '⚽ Back to today’s match',
  prev_matches: '📅 Previous matches',
  an_foot:
    'A new anthem every day at midnight UTC · part of the MATCHDAY mini games. Anthem recordings by the U.S. Navy Band (public domain, via archive.org).',

  /* scoreboard label */
  match_label: 'MATCH #{n}',

  /* ---- anthem: modals ---- */
  howto_title: 'How to play ⚽',
  howto_1: 'Tap play to hear the anthem — it starts at just **1 second**.',
  howto_2:
    'Guess the nation. Each **miss or skip** reveals more of the clip and unlocks a hint card.',
  howto_3:
    'You get **6 tries**. A new anthem drops at **midnight UTC** — solve it, keep your streak, and share your spoiler-free score. Want more? **Free play** has every anthem — no daily limit.',
  howto_close: 'Let’s play',
  archive_title: 'Previous matches 📅',
  archive_play: '▶ Play',
  archive_close: 'Close',
  stats_title: 'Your stats 📊',
  stats_played: 'Played',
  stats_winpct: 'Win %',
  stats_streak: 'Streak',
  stats_best: 'Best streak',
  stats_dist: 'Guess distribution',
  stats_share: 'Share my record 📣',
  back_to_match: 'Back to the match',

  /* ---- canvas share cards (drawn labels — no emoji glyphs) ---- */
  card_practice: 'FREE PLAY',
  card_goal: 'GOAL!',
  card_fulltime: 'FULL TIME',
  card_streak_n: 'STREAK {n}',
  card_play_at: 'play at {h}',
  card_record_sub: 'My anthem record',
  card_played: 'PLAYED',
  card_winrate: 'WIN RATE',
  card_streak: 'STREAK',
  card_best: 'BEST',

  /* ---- share text (travels with the card) ---- */
  share_tail: 'Name the nation from its anthem',
  share_practice: 'ANTHEM ⚽ Free play',
  share_match: 'ANTHEM ⚽ Match #{n}',
  share_record_head: 'ANTHEM ⚽ My record',
  share_record_line: 'Played {p} · Win {w}% · Streak {s}',
  share_record_best: ' (best {b})',
}

export type StringKey = keyof typeof en
