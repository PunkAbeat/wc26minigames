/* GROUPS pure game logic — no DOM, no storage, fully unit-testable.
   Connections rules: pick 4 of the 16 tiles; a full match solves that group,
   3-of-4 is "one away", anything else is a plain miss. 4 mistakes = full time.
   The last group still has to be submitted (familiar NYT feel) — it just
   cannot miss. */

import type { GroupsPuzzle } from './puzzles'

export const MAX_MISTAKES = 4

export interface GuessRow {
  nations: string[]
  tiers: number[] // true tier of each picked nation — the share-grid row
  groupIdx: number // solved group index, or -1 for a miss
}

export interface GroupsState {
  found: number[] // group indices in solve order
  guesses: GuessRow[]
  mistakes: number
  finished: boolean
  won: boolean
}

export interface Streak {
  count?: number
  lastDay?: number
}

export function freshState(): GroupsState {
  return { found: [], guesses: [], mistakes: 0, finished: false, won: false }
}

export function groupOf(puzzle: GroupsPuzzle, nation: string): number {
  return puzzle.groups.findIndex((g) => (g.nations as readonly string[]).includes(nation))
}

/* tiles still on the board, in the given display order */
export function remainingTiles(puzzle: GroupsPuzzle, state: GroupsState, order: string[]): string[] {
  const gone = new Set(state.found.flatMap((gi) => puzzle.groups[gi].nations))
  return order.filter((n) => !gone.has(n))
}

export type GuessOutcome =
  | { kind: 'correct'; groupIdx: number }
  | { kind: 'one-away' }
  | { kind: 'miss' }
  | { kind: 'duplicate' }
  | { kind: 'invalid' }

export function evaluateGuess(puzzle: GroupsPuzzle, picks: string[]): GuessOutcome {
  if (picks.length !== 4 || new Set(picks).size !== 4) return { kind: 'invalid' }
  const counts = [0, 0, 0, 0]
  for (const n of picks) {
    const gi = groupOf(puzzle, n)
    if (gi < 0) return { kind: 'invalid' }
    counts[gi]++
  }
  const best = Math.max(...counts)
  if (best === 4) return { kind: 'correct', groupIdx: counts.indexOf(4) }
  if (best === 3) return { kind: 'one-away' }
  return { kind: 'miss' }
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n))
}

/* one submit: returns the next state plus the outcome the UI should react to.
   Duplicate/invalid picks never cost a mistake. */
export function applyGuess(
  state: GroupsState,
  puzzle: GroupsPuzzle,
  picks: string[],
): { state: GroupsState; outcome: GuessOutcome } {
  if (state.finished) return { state, outcome: { kind: 'invalid' } }
  if (state.guesses.some((g) => sameSet(g.nations, picks)))
    return { state, outcome: { kind: 'duplicate' } }
  const outcome = evaluateGuess(puzzle, picks)
  if (outcome.kind === 'invalid' || outcome.kind === 'duplicate') return { state, outcome }

  const row: GuessRow = {
    nations: picks.slice(),
    tiers: picks.map((n) => puzzle.groups[groupOf(puzzle, n)].tier),
    groupIdx: outcome.kind === 'correct' ? outcome.groupIdx : -1,
  }
  const next: GroupsState = {
    found: outcome.kind === 'correct' ? [...state.found, outcome.groupIdx] : state.found.slice(),
    guesses: [...state.guesses, row],
    mistakes: outcome.kind === 'correct' ? state.mistakes : state.mistakes + 1,
    finished: false,
    won: false,
  }
  if (next.found.length === 4) {
    next.finished = true
    next.won = true
  } else if (next.mistakes >= MAX_MISTAKES) {
    next.finished = true
  }
  return { state: next, outcome }
}

/* groups not solved by the player, revealed in tier order after a loss */
export function unsolvedGroups(puzzle: GroupsPuzzle, state: GroupsState): number[] {
  return puzzle.groups.map((_, i) => i).filter((i) => !state.found.includes(i))
}

export function updateStreak(prev: Streak, day: number, won: boolean): Streak {
  if (!won) return { count: 0, lastDay: day }
  const count = prev.lastDay === day - 1 ? (prev.count || 0) + 1 : 1
  return { count, lastDay: day }
}

/* spoiler-free share text — one emoji row per guess, true tier colours */
const TIER_EMOJI = ['🟨', '🟩', '🟦', '🟪']

export function shareText(state: GroupsState, gridNo: number, host: string): string {
  const head = `GROUPS ⚽ Grid #${gridNo} ${state.won ? state.mistakes + (state.mistakes === 1 ? ' mistake' : ' mistakes') : 'X'}`
  const rows = state.guesses.map((g) => g.tiers.map((t) => TIER_EMOJI[t]).join('')).join('\n')
  return head + '\n' + rows + (host ? '\n' + host + '/groups' : '')
}
