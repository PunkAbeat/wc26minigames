/* GROUPS daily schedule — same grid for everyone, keyed to the UTC date.
   Same no-backend trick as ANTHEM's daily.ts: launch day + deterministic
   selection means every client agrees. The bank cycles (prototype: 10 grids);
   the on-screen tile order is also seeded per day so everyone stares at the
   identical board.
   NOTE: anything taking `now` defaults to Date.now() — call client-side only
   (mount effects), never during SSR. */

import { mulberry32, utcDay } from '../anthem/daily'
import { GROUPS_BANK, puzzleNations } from './puzzles'
import type { GroupsPuzzle } from './puzzles'

export const GROUPS_LAUNCH_DAY = Math.floor(Date.UTC(2026, 5, 12) / 86400000) // Grid #1 = 12 Jun 2026 (UTC)

export function groupsDayNumber(now: number = Date.now()): number {
  return Math.max(0, utcDay(now) - GROUPS_LAUNCH_DAY)
}
export function gridNumber(now: number = Date.now()): number {
  return groupsDayNumber(now) + 1
}

export function dailyPuzzleIndex(now: number = Date.now()): number {
  return groupsDayNumber(now) % GROUPS_BANK.length
}
export function dailyPuzzle(now: number = Date.now()): GroupsPuzzle {
  return GROUPS_BANK[dailyPuzzleIndex(now)]
}

/* seeded per-day board order — a fresh shuffle each day even when the bank
   wraps around, and identical on every device */
export function dailyTileOrder(now: number = Date.now()): string[] {
  const names = puzzleNations(dailyPuzzle(now))
  const rnd = mulberry32(0x47525053 ^ utcDay(now)) // 'GRPS' ^ day
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = names[i]
    names[i] = names[j]
    names[j] = t
  }
  return names
}
