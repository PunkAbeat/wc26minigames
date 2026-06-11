/* Guess normalisation + the autocomplete picker's matching/ranking, ported
   verbatim from games/anthem/index.html. */

import { ALL_NATIONS, PUZZLES } from './puzzles'
import type { Puzzle } from './puzzles'

export function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\./g, '').replace(/\s+/g, ' ')
}

/* accent-insensitive ("curacao" → Curaçao, "turkiye" → Türkiye) */
export function fold(s: string): string {
  return normalize(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function isCorrect(guess: string, puzzle: Puzzle): boolean {
  const n = normalize(guess)
  return n === normalize(puzzle.name) || puzzle.aliases.includes(n)
}

export function isKnownNation(guess: string): boolean {
  const n = normalize(guess)
  return (
    ALL_NATIONS.some((x) => normalize(x) === n) ||
    PUZZLES.some((p) => p.aliases.includes(n))
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
  aliases: p.aliases,
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
