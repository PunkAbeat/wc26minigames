/* GROUPS localStorage persistence — same conventions as anthem/storage.ts:
     groups_daily  {day, state}   today's grid (reload restore, blocks replays)
     groups_streak {count,lastDay}
     groups_seen   "1"            how-to modal dismissed
   Client-side only: every function no-ops/returns null without a window. */

import type { GroupsState, Streak } from './game'

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage

export function saveDaily(day: number, state: GroupsState): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('groups_daily', JSON.stringify({ day, state }))
  } catch {
    /* private mode — the game just won't persist */
  }
}

export function loadSavedDaily(day: number): GroupsState | null {
  if (!hasStorage()) return null
  try {
    const d = JSON.parse(localStorage.getItem('groups_daily') || 'null')
    return d && d.day === day && d.state ? (d.state as GroupsState) : null
  } catch {
    return null
  }
}

export function loadStreak(): Streak {
  if (!hasStorage()) return {}
  try {
    return JSON.parse(localStorage.getItem('groups_streak') || '{}') as Streak
  } catch {
    return {}
  }
}

export function saveStreak(s: Streak): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('groups_streak', JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function hasSeenHowto(): boolean {
  if (!hasStorage()) return false
  try {
    return !!localStorage.getItem('groups_seen')
  } catch {
    return true // can't persist the flag → don't nag every interaction
  }
}

export function markHowtoSeen(): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem('groups_seen', '1')
  } catch {
    /* ignore */
  }
}
