/* Guess normalisation + the autocomplete picker's matching/ranking, ported
   from games/anthem/index.html. Post-launch divergence: ES/FR nation names
   (nation-names.ts) join each nation's alias set, so "Alemania"/"Allemagne"
   are accepted and ranked no matter what language the UI is in. */

import { ALL_NATIONS, PUZZLES } from './puzzles'
import type { Puzzle } from './puzzles'
import { NATION_NAMES_I18N } from './nation-names'

export function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\./g, '').replace(/\s+/g, ' ')
}

/* accent-insensitive ("curacao" → Curaçao, "turkiye" → Türkiye) */
export function fold(s: string): string {
  return normalize(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/* per-nation alias set = original aliases + ES/FR names (normalized) */
function i18nAliases(name: string): string[] {
  const n = NATION_NAMES_I18N[name]
  if (!n) return []
  return [n.es, n.fr, ...(n.alt || [])].map(normalize).filter((a) => a !== normalize(name))
}

export function isCorrect(guess: string, puzzle: Puzzle): boolean {
  const n = normalize(guess)
  return (
    n === normalize(puzzle.name) ||
    puzzle.aliases.includes(n) ||
    i18nAliases(puzzle.name).some((a) => fold(a) === fold(n))
  )
}

export function isKnownNation(guess: string): boolean {
  const n = normalize(guess)
  return (
    ALL_NATIONS.some((x) => normalize(x) === n) ||
    PUZZLES.some((p) => p.aliases.includes(n)) ||
    PUZZLES.some((p) => i18nAliases(p.name).some((a) => fold(a) === fold(n)))
  )
}

export interface NationEntry {
  name: string
  cc: string
  flag: string
  aliases: string[]
}

export const NATIONS: NationEntry[] = PUZZLES.map((p) => ({
  name: p.name,
  cc: p.cc,
  flag: p.flag,
  aliases: [...p.aliases, ...i18nAliases(p.name)],
})).sort((a, b) => a.name.localeCompare(b.name))

export function isSelectedName(q: string): boolean {
  const f = fold(q)
  return NATIONS.some((n) => fold(n.name) === f)
}

/* rank 0: name prefix · rank 1: alias prefix · rank 2: substring anywhere */
export function rankMatches(q: string): NationEntry[] {
  const f = fold(q)
  if (!f) return NATIONS.slice()
  const out: { n: NationEntry; rank: number }[] = []
  for (const n of NATIONS) {
    const name = fold(n.name)
    let rank = -1
    if (name.startsWith(f)) rank = 0
    else if (n.aliases.some((a) => fold(a).startsWith(f))) rank = 1
    else if (name.includes(f) || n.aliases.some((a) => fold(a).includes(f))) rank = 2
    if (rank >= 0) out.push({ n, rank })
  }
  return out
    .sort((a, b) => a.rank - b.rank || a.n.name.localeCompare(b.n.name))
    .map(({ n }) => n)
}
