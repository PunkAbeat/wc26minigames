/* Daily schedule: same anthem for everyone, keyed to the UTC date.
   The order is a fixed seeded shuffle of every puzzle that has audio (or a melody
   fallback), with Mexico pinned to Match #1. No backend: clients agree because the
   seed, the launch day and the roster are identical for everyone.
   NOTE: dayNumber()/dailyPuzzleIndex() depend on Date.now() — call them client-side
   only (after hydration) so SSR can never disagree with the browser. */

import { PUZZLES } from './puzzles'

export const LAUNCH_DAY = Math.floor(Date.UTC(2026, 5, 10) / 86400000) // Match #1 = 10 Jun 2026 (UTC)

export function utcDay(now: number = Date.now()): number {
  return Math.floor(now / 86400000)
}
export function dayNumber(now: number = Date.now()): number {
  return Math.max(0, utcDay(now) - LAUNCH_DAY)
}
export function matchNumber(now: number = Date.now()): number {
  return dayNumber(now) + 1
}

export function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* indices of puzzles eligible for the rotation (real audio or melody fallback) */
export const POOL = PUZZLES.map((p, i) =>
  p.audio || (p.melody && p.melody.length) ? i : -1,
).filter((i) => i >= 0)

export const DAILY_ORDER = (() => {
  const a = POOL.slice()
  const rnd = mulberry32(0x26061126)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  const mex = PUZZLES.findIndex((p) => p.name === 'Mexico')
  const k = a.indexOf(mex)
  if (k > 0) {
    a.splice(k, 1)
    a.unshift(mex) // the opening hosts kick off Match #1
  }
  return a
})()

export function dailyPuzzleIndex(now: number = Date.now()): number {
  return DAILY_ORDER[dayNumber(now) % DAILY_ORDER.length]
}

/* practice: never spoil today's anthem, never repeat the current one */
export function randomPracticeIndex(currentIndex: number, now: number = Date.now()): number {
  const avoid = [dailyPuzzleIndex(now), currentIndex]
  const cand = POOL.filter((i) => !avoid.includes(i))
  return cand[Math.floor(Math.random() * cand.length)]
}
