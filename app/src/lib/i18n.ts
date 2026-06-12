/* i18n phase 1 (ADR pending): EN + ES + FR for all UI chrome.
   Deliberately NOT a library — a typed string table and a {var} substituter
   cover everything this site says. Per-nation editorial content (hints,
   verdicts) and the canvas share cards stay EN in phase 1.

   SSR note: the server always renders EN ('en' is the useState initial value);
   the detected/saved language is applied in the first client effect — same
   placeholder-then-fill pattern as the hub countdown, so hydration can never
   mismatch. */

import { createElement, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'en' | 'es' | 'fr'
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'fr', label: 'FR' },
]

const LS_KEY = 'wc26_lang'

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved === 'en' || saved === 'es' || saved === 'fr') return saved
  } catch {
    /* storage blocked */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || ''
  if (/^es\b/i.test(nav)) return 'es'
  if (/^fr\b/i.test(nav)) return 'fr'
  return 'en'
}

export function saveLang(l: Lang): void {
  try {
    localStorage.setItem(LS_KEY, l)
  } catch {
    /* storage blocked */
  }
}

/* one tuple per key: [en, es, fr] */
const T = {
  /* ---- hub ---- */
  hub_kicker: ['Summer 2026 · Mini Games', 'Verano 2026 · Minijuegos', 'Été 2026 · Mini-jeux'],
  hub_sub1: [
    'Mini games for the 2026 tournament.',
    'Minijuegos para el torneo de 2026.',
    'Des mini-jeux pour le tournoi 2026.',
  ],
  hub_sub2: ['One stadium, many games.', 'Un estadio, muchos juegos.', 'Un stade, plein de jeux.'],
  kickoff_soon: ['KICKOFF SOON', 'ARRANCA PRONTO', 'COUP D’ENVOI BIENTÔT'],
  kickoff_in: ['KICKOFF IN {t}', 'ARRANCA EN {t}', 'COUP D’ENVOI DANS {t}'],
  tournament_live: ['TOURNAMENT LIVE · DAY {n}', 'TORNEO EN VIVO · DÍA {n}', 'TOURNOI EN DIRECT · JOUR {n}'],
  full_time_2030: [
    'FULL TIME · SEE YOU IN 2030',
    'FINAL DEL PARTIDO · NOS VEMOS EN 2030',
    'FIN DU MATCH · RENDEZ-VOUS EN 2030',
  ],
  anthem_tagline: [
    'Hear a snippet of a national anthem, guess the nation in six tries.',
    'Escucha un fragmento de un himno nacional y adivina el país en seis intentos.',
    'Écoutez un extrait d’un hymne national et devinez le pays en six essais.',
  ],
  badge_live: ['Daily · Play now', 'Diario · Juega ya', 'Quotidien · Jouez'],
  badge_soon: ['Coming soon', 'Próximamente', 'Bientôt'],
  tba_tagline: [
    'Next fixture being scheduled…',
    'Programando el próximo partido…',
    'Prochain match en cours de programmation…',
  ],
  play_cta: ['PLAY', 'JUGAR', 'JOUER'],
  nl_title: ['🔔 More games are coming', '🔔 Vienen más juegos', '🔔 D’autres jeux arrivent'],
  nl_sub: [
    'Want a heads-up when the next one drops? No spam — only new games.',
    '¿Quieres un aviso cuando salga el próximo? Sin spam — solo juegos nuevos.',
    'Envie d’être prévenu à la sortie du prochain ? Pas de spam — uniquement les nouveaux jeux.',
  ],
  nl_placeholder: ['you@example.com', 'tu@ejemplo.com', 'vous@exemple.com'],
  nl_button: ['Keep me posted', 'Avísame', 'Tenez-moi au courant'],
  nl_done: [
    '✅ You’re on the team sheet — we’ll email you when a new game drops.',
    '✅ Estás en la alineación — te escribiremos cuando salga un juego nuevo.',
    '✅ Vous êtes sur la feuille de match — on vous écrit dès qu’un nouveau jeu sort.',
  ],
  nl_error: [
    'That didn’t go in — check the address and shoot again.',
    'Ese tiro salió fuera — revisa la dirección y dispara otra vez.',
    'C’est passé à côté — vérifiez l’adresse et retentez votre tir.',
  ],
  hub_foot1: [
    'Unofficial fan project · not affiliated with FIFA.',
    'Proyecto no oficial de aficionados · sin afiliación con la FIFA.',
    'Projet de fans non officiel · sans affiliation avec la FIFA.',
  ],
  hub_foot2: [
    'Anthem audio: public-domain recordings by the U.S. Navy Band via archive.org.',
    'Audio de los himnos: grabaciones de dominio público de la U.S. Navy Band vía archive.org.',
    'Audio des hymnes : enregistrements du domaine public de l’U.S. Navy Band via archive.org.',
  ],

  /* ---- anthem: header / player ---- */
  an_kicker: ['Summer 2026 · Daily', 'Verano 2026 · Diario', 'Été 2026 · Quotidien'],
  an_sub: [
    'Guess the nation from its anthem',
    'Adivina el país por su himno',
    'Devinez le pays à son hymne',
  ],
  an_games_link: ['⚽ Games', '⚽ Juegos', '⚽ Jeux'],
  practice_label: ['🎯 PRACTICE', '🎯 PRÁCTICA', '🎯 ENTRAÎNEMENT'],
  clip_unlocked_1: ['1 second unlocked', '1 segundo desbloqueado', '1 seconde débloquée'],
  clip_unlocked_n: [
    '{n} seconds unlocked',
    '{n} segundos desbloqueados',
    '{n} secondes débloquées',
  ],
  clip_solved: ['Solved! 🎉', '¡Resuelto! 🎉', 'Trouvé ! 🎉'],
  clip_out: ['Out of guesses', 'Sin intentos', 'Plus d’essais'],

  /* ---- anthem: guessing ---- */
  guess_placeholder: ['Your guess…', 'Tu respuesta…', 'Votre réponse…'],
  no_match: [
    'No qualified nation matches',
    'Ningún país clasificado coincide',
    'Aucun pays qualifié ne correspond',
  ],
  tried_tag: ['tried', 'usado', 'déjà'],
  shoot: ['SHOOT', 'CHUTA', 'TIREZ'],
  skip: ['Skip', 'Saltar', 'Passer'],
  guess_n_of_6: ['Guess {n} / 6', 'Intento {n} / 6', 'Essai {n} / 6'],
  hint_lock: [
    '🟨 A hint card unlocks with each miss',
    '🟨 Cada fallo desbloquea una pista',
    '🟨 Chaque raté débloque un indice',
  ],
  tag_goal: ['✓ GOAL', '✓ GOL', '✓ BUT'],
  tag_miss: ['✗ MISS', '✗ FALLO', '✗ RATÉ'],
  tag_skip: ['SKIP', 'SALTO', 'PASSÉ'],
  toast_type_first: ['Type a country first', 'Escribe un país primero', 'Écrivez d’abord un pays'],
  toast_pick_list: [
    'Pick a country from the list',
    'Elige un país de la lista',
    'Choisissez un pays dans la liste',
  ],
  toast_practice_cap: [
    'Practice limit reached — next anthem at midnight UTC ⏱',
    'Límite de práctica alcanzado — próximo himno a medianoche UTC ⏱',
    'Limite d’entraînement atteinte — prochain hymne à minuit UTC ⏱',
  ],
  toast_copied: [
    'Copied — paste it anywhere ✓',
    'Copiado — pégalo donde quieras ✓',
    'Copié — collez-le où vous voulez ✓',
  ],

  /* ---- anthem: end screen ---- */
  goal_excl: ['GOAL! ⚽', '¡GOL! ⚽', 'BUT ! ⚽'],
  off_target: ['OFF TARGET', 'FUERA', 'À CÔTÉ'],
  about_anthem: ['About this anthem ↗', 'Sobre este himno ↗', 'À propos de cet hymne ↗'],
  streak_n: ['🔥 Streak {n}', '🔥 Racha {n}', '🔥 Série {n}'],
  archive_chip: ['📅 Archive', '📅 Archivo', '📅 Archives'],
  practice_chip: ['🎯 Practice', '🎯 Práctica', '🎯 Entraînement'],
  share_result: ['📋 Share result', '📋 Compartir', '📋 Partager'],
  stats_btn: ['📊 Stats', '📊 Estadísticas', '📊 Stats'],
  another_anthem: ['▶ Another anthem', '▶ Otro himno', '▶ Un autre hymne'],
  next_anthem_in: [
    '⏱ Next anthem in {t}',
    '⏱ Próximo himno en {t}',
    '⏱ Prochain hymne dans {t}',
  ],
  global_solved: [
    '📊 {p}% of today’s players solved it',
    '📊 El {p}% de los jugadores de hoy lo acertó',
    '📊 {p}% des joueurs du jour l’ont trouvé',
  ],
  global_in_n: [
    ' · {p}% in {n} or fewer',
    ' · {p}% en {n} o menos',
    ' · {p}% en {n} ou moins',
  ],
  practice_mode: ['🎯 Practice mode', '🎯 Modo práctica', '🎯 Mode entraînement'],
  back_to_today: [
    '⚽ Back to today’s match',
    '⚽ Volver al partido de hoy',
    '⚽ Retour au match du jour',
  ],
  prev_matches: ['📅 Previous matches', '📅 Partidos anteriores', '📅 Matchs précédents'],
  an_foot: [
    'A new anthem every day at midnight UTC · part of the MATCHDAY mini games. Anthem recordings by the U.S. Navy Band (public domain, via archive.org).',
    'Un himno nuevo cada día a medianoche UTC · parte de los minijuegos MATCHDAY. Grabaciones de la U.S. Navy Band (dominio público, vía archive.org).',
    'Un nouvel hymne chaque jour à minuit UTC · fait partie des mini-jeux MATCHDAY. Enregistrements de l’U.S. Navy Band (domaine public, via archive.org).',
  ],

  /* scoreboard label — NBSP keeps "MATCH #5" on one line, as the original did */
  match_label: ['MATCH #{n}', 'PARTIDO #{n}', 'MATCH nº{n}'],

  /* ---- anthem: modals ---- */
  howto_title: ['How to play ⚽', '¿Cómo se juega? ⚽', 'Comment jouer ⚽'],
  /* **bold** spans are rendered by tb() */
  howto_1: [
    'Tap play to hear the anthem — it starts at just **1 second**.',
    'Pulsa play para escuchar el himno — empieza con solo **1 segundo**.',
    'Appuyez sur play pour écouter l’hymne — ça commence avec **1 seconde** seulement.',
  ],
  howto_2: [
    'Guess the nation. Each **miss or skip** reveals more of the clip and unlocks a hint card.',
    'Adivina el país. Cada **fallo o salto** revela más del clip y desbloquea una pista.',
    'Devinez le pays. Chaque **raté ou passe** dévoile plus de l’extrait et débloque un indice.',
  ],
  howto_3: [
    'You get **6 tries**. A new anthem drops at **midnight UTC** — solve it, keep your streak, and share your spoiler-free score. Want more? Warm up in **practice mode**.',
    'Tienes **6 intentos**. Un himno nuevo cae a **medianoche UTC** — resuélvelo, mantén tu racha y comparte tu resultado sin spoilers. ¿Quieres más? Calienta en el **modo práctica**.',
    'Vous avez **6 essais**. Un nouvel hymne tombe à **minuit UTC** — trouvez-le, gardez votre série et partagez votre score sans spoiler. Envie de plus ? Échauffez-vous en **mode entraînement**.',
  ],
  howto_close: ['Let’s play', '¡A jugar!', 'C’est parti'],
  archive_title: ['Previous matches 📅', 'Partidos anteriores 📅', 'Matchs précédents 📅'],
  archive_play: ['▶ Play', '▶ Jugar', '▶ Jouer'],
  archive_close: ['Close', 'Cerrar', 'Fermer'],
  stats_title: ['Your stats 📊', 'Tus estadísticas 📊', 'Vos stats 📊'],
  stats_played: ['Played', 'Jugados', 'Joués'],
  stats_winpct: ['Win %', '% Victorias', '% Victoires'],
  stats_streak: ['Streak', 'Racha', 'Série'],
  stats_best: ['Best streak', 'Mejor racha', 'Meilleure série'],
  stats_dist: ['Guess distribution', 'Distribución de intentos', 'Répartition des essais'],
  stats_share: ['Share my record 📣', 'Compartir mi récord 📣', 'Partager mon bilan 📣'],
  back_to_match: ['Back to the match', 'Volver al partido', 'Retour au match'],

  /* ---- canvas share cards (drawn labels — no emoji glyphs) ---- */
  card_practice: ['PRACTICE', 'PRÁCTICA', 'ENTRAÎNEMENT'],
  card_goal: ['GOAL!', '¡GOL!', 'BUT !'],
  card_fulltime: ['FULL TIME', 'FIN DEL PARTIDO', 'FIN DU MATCH'],
  card_streak_n: ['STREAK {n}', 'RACHA {n}', 'SÉRIE {n}'],
  card_play_at: ['play at {h}', 'juega en {h}', 'jouez sur {h}'],
  card_record_sub: ['My anthem record', 'Mi récord de himnos', 'Mon bilan des hymnes'],
  card_played: ['PLAYED', 'JUGADOS', 'JOUÉS'],
  card_winrate: ['WIN RATE', '% VICTORIAS', '% VICTOIRES'],
  card_streak: ['STREAK', 'RACHA', 'SÉRIE'],
  card_best: ['BEST', 'MEJOR', 'RECORD'],

  /* ---- share text (travels with the card) ---- */
  share_tail: [
    'Name the nation from its anthem',
    'Adivina el país por su himno',
    'Devinez le pays à son hymne',
  ],
  share_practice: ['ANTHEM ⚽ Practice', 'ANTHEM ⚽ Práctica', 'ANTHEM ⚽ Entraînement'],
  share_match: ['ANTHEM ⚽ Match #{n}', 'ANTHEM ⚽ Partido #{n}', 'ANTHEM ⚽ Match nº{n}'],
  share_record_head: ['ANTHEM ⚽ My record', 'ANTHEM ⚽ Mi récord', 'ANTHEM ⚽ Mon bilan'],
  share_record_line: [
    'Played {p} · Win {w}% · Streak {s}',
    'Jugados {p} · Victorias {w}% · Racha {s}',
    'Joués {p} · Victoires {w}% · Série {s}',
  ],
  share_record_best: [' (best {b})', ' (mejor {b})', ' (record {b})'],
} satisfies Record<string, [string, string, string]>

export type StringKey = keyof typeof T
const IDX: Record<Lang, 0 | 1 | 2> = { en: 0, es: 1, fr: 2 }

export function t(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  let s: string = T[key][IDX[lang]]
  if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', String(vars[k]))
  return s
}

/* like t(), but renders **spans** as <b> — for the how-to steps */
export function tb(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>,
): ReactNode[] {
  return t(lang, key, vars)
    .split('**')
    .map((part, i) => (i % 2 ? createElement('b', { key: i }, part) : part))
}

/* SSR-stable language hook: first render is always EN, the detected/saved
   language lands in the first client effect (and on <html lang>). */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => {
    setLang(detectLang())
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
  const set = (l: Lang) => {
    saveLang(l)
    setLang(l)
  }
  return [lang, set]
}
