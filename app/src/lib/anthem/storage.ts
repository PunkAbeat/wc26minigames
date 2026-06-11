/* localStorage persistence — keys and JSON shapes identical to the original
   game so existing player progress survives the migration:
     anthem_daily  {day, state}   today's game (reload restore, blocks replays)
     anthem_streak {count,lastDay}
     anthem_seen   "1"            how-to-play modal dismissed
   Client-side only: every function no-ops/returns null without a window. */

import { freshStats } from './game'
import type { GameState, Stats, Streak } from './game'

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage

export function saveDaily(day: number, state: GameState): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('anthem_daily', JSON.stringify({ day, state }))
  } catch {
    /* storage may be unavailable (private mode) — the game just won't persist */
  }
}

export function loadSavedDaily(day: number): GameState | null {
  if (!hasStorage()) return null
  try {
    const d = JSON.parse(localStorage.getItem('anthem_daily') || 'null')
    return d && d.day === day && d.state ? (d.state as GameState) : null
  } catch {
    return null
  }
}

export function loadStreak(): Streak {
  if (!hasStorage()) return {}
  try {
    return JSON.parse(localStorage.getItem('anthem_streak') || '{}') as Streak
  } catch {
    return {}
  }
}

export function saveStreak(s: Streak): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('anthem_streak', JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

/* anthem_stats {played,wins,dist[6],maxStreak} — new key (post-migration);
   existing players start at zero except maxStreak, seeded from their streak */
export function loadStats(): Stats {
  if (!hasStorage()) return freshStats()
  try {
    const raw = JSON.parse(localStorage.getItem('anthem_stats') || 'null')
    if (!raw) {
      const seeded = freshStats()
      const streak = JSON.parse(localStorage.getItem('anthem_streak') || '{}')
      if (streak && typeof streak.count === 'number') seeded.maxStreak = streak.count
      return seeded
    }
    return {
      played: raw.played || 0,
      wins: raw.wins || 0,
      dist: Array.isArray(raw.dist) ? raw.dist.slice(0, 6) : freshStats().dist,
      maxStreak: raw.maxStreak || 0,
    }
  } catch {
    return freshStats()
  }
}

export function saveStats(st: Stats): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('anthem_stats', JSON.stringify(st))
  } catch {
    /* ignore */
  }
}

export function hasSeenHowto(): boolean {
  if (!hasStorage()) return false
  try {
    return !!localStorage.getItem('anthem_seen')
  } catch {
    return true // can't persist the flag → don't nag every interaction
  }
}

export function markHowtoSeen(): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('anthem_seen', '1')
  } catch {
    /* ignore */
  }
}
