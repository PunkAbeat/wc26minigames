/* Pure game-state transitions, ported from games/anthem/index.html.
   The original mutated a global `state`; here each transition returns a new
   state object so React can own it. Shapes (and therefore the persisted
   localStorage JSON) are unchanged: {attempt, finished, won, results[], streak?}. */

import type { Puzzle } from './puzzles'
import { isCorrect } from './text'

export type ResultType = 'correct' | 'wrong' | 'skip'

export interface GuessResult {
  type: ResultType
  label: string
}

export interface GameState {
  attempt: number
  finished: boolean
  won: boolean
  results: GuessResult[]
  streak?: number
}

export type Mode = 'daily' | 'practice' | 'archive'

export function freshState(): GameState {
  return { attempt: 0, finished: false, won: false, results: [] }
}

export function applyGuess(state: GameState, puzzle: Puzzle, value: string): GameState {
  if (state.finished) return state
  const results = state.results.slice()
  if (isCorrect(value, puzzle)) {
    results[state.attempt] = { type: 'correct', label: puzzle.name }
    return { ...state, results, won: true, finished: true, attempt: state.attempt + 1 }
  }
  results[state.attempt] = { type: 'wrong', label: value }
  const attempt = state.attempt + 1
  return { ...state, results, attempt, finished: attempt >= 6 }
}

export function applySkip(state: GameState): GameState {
  if (state.finished) return state
  const results = state.results.slice()
  results[state.attempt] = { type: 'skip', label: 'Skipped' }
  const attempt = state.attempt + 1
  return { ...state, results, attempt, finished: attempt >= 6 }
}

export function gridString(state: GameState): string {
  return state.results
    .map((r) => (r.type === 'correct' ? '🟩' : r.type === 'wrong' ? '🟥' : '⬛'))
    .join('')
}

export function shareText(state: GameState, mode: Mode, matchNo: number): string {
  const tries = state.won ? state.attempt : 'X'
  // archive shares read like the daily they were: "Match #3"
  const head = mode === 'practice' ? 'ANTHEM ⚽ Practice' : 'ANTHEM ⚽ Match #' + matchNo
  return head + '  ' + tries + '/6\n' + gridString(state) + '\nName the World Cup nation from its anthem'
}

export interface Streak {
  count?: number
  lastDay?: number
}

/* lifetime daily stats (Wordle-style). dist[i] = wins in i+1 guesses.
   Practice games never touch these. */
export interface Stats {
  played: number
  wins: number
  dist: number[]
  maxStreak: number
}

export function freshStats(): Stats {
  return { played: 0, wins: 0, dist: [0, 0, 0, 0, 0, 0], maxStreak: 0 }
}

export function updateStats(
  st: Stats,
  won: boolean,
  attempt: number,
  streakCount: number,
): Stats {
  const dist = st.dist.slice()
  while (dist.length < 6) dist.push(0)
  if (won && attempt >= 1 && attempt <= 6) dist[attempt - 1]++
  return {
    played: st.played + 1,
    wins: st.wins + (won ? 1 : 0),
    dist,
    maxStreak: Math.max(st.maxStreak, streakCount),
  }
}

export function winPct(st: Stats): number {
  return st.played ? Math.round((st.wins / st.played) * 100) : 0
}

/* daily only — practice games never touch the streak */
export function updateStreak(s: Streak, today: number, won: boolean): Streak {
  const next: Streak = { ...s }
  if (won) {
    if (next.lastDay === today) {
      /* already counted today */
    } else if (next.lastDay === today - 1) next.count = (next.count || 0) + 1
    else next.count = 1
    next.lastDay = today
  } else {
    next.count = 0
    next.lastDay = today
  }
  return next
}
