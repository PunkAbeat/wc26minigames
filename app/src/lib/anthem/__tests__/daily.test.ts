import { describe, expect, it } from 'vitest'
import {
  DAILY_ORDER,
  LAUNCH_DAY,
  POOL,
  dailyPuzzleIndex,
  dayNumber,
  matchNumber,
  mulberry32,
  randomPracticeIndex,
  utcDay,
} from '../daily'
import { PUZZLES } from '../puzzles'

const DAY_MS = 86400000
const LAUNCH_MS = Date.UTC(2026, 5, 11)

describe('daily schedule', () => {
  it('pool has 45 playable nations (3 lack audio + melody)', () => {
    expect(POOL).toHaveLength(45)
    const excluded = PUZZLES.filter((_, i) => !POOL.includes(i)).map((p) => p.name)
    expect(excluded.sort()).toEqual(['Curaçao', 'DR Congo', 'Scotland'])
  })

  it('daily order is a permutation of the pool', () => {
    expect(new Set(DAILY_ORDER).size).toBe(45)
    expect([...DAILY_ORDER].sort((a, b) => a - b)).toEqual(POOL)
  })

  it('Mexico is pinned to Match #1', () => {
    expect(PUZZLES[DAILY_ORDER[0]].name).toBe('Mexico')
    expect(PUZZLES[dailyPuzzleIndex(LAUNCH_MS)].name).toBe('Mexico')
  })

  it('mulberry32 is the exact original PRNG (deterministic)', () => {
    const r = mulberry32(0x26061126)
    const seq = [r(), r(), r()]
    const r2 = mulberry32(0x26061126)
    expect([r2(), r2(), r2()]).toEqual(seq)
    seq.forEach((v) => expect(v).toBeGreaterThanOrEqual(0))
    seq.forEach((v) => expect(v).toBeLessThan(1))
  })

  it('day/match numbers are UTC-keyed to the launch day', () => {
    expect(LAUNCH_DAY).toBe(Math.floor(LAUNCH_MS / DAY_MS))
    expect(dayNumber(LAUNCH_MS)).toBe(0)
    expect(matchNumber(LAUNCH_MS)).toBe(1)
    expect(dayNumber(LAUNCH_MS + 5 * DAY_MS + 123)).toBe(5)
    expect(matchNumber(LAUNCH_MS + 5 * DAY_MS)).toBe(6)
    // pre-launch clamps to day 0, never negative
    expect(dayNumber(LAUNCH_MS - 3 * DAY_MS)).toBe(0)
    expect(utcDay(0)).toBe(0)
  })

  it('rotation wraps after 45 days', () => {
    const idx0 = dailyPuzzleIndex(LAUNCH_MS)
    expect(dailyPuzzleIndex(LAUNCH_MS + 45 * DAY_MS)).toBe(idx0)
    expect(dailyPuzzleIndex(LAUNCH_MS + DAY_MS)).toBe(DAILY_ORDER[1])
  })

  it('practice never serves today’s anthem nor the current one', () => {
    const today = dailyPuzzleIndex(LAUNCH_MS)
    for (let i = 0; i < 200; i++) {
      const pick = randomPracticeIndex(today, LAUNCH_MS)
      expect(pick).not.toBe(today)
      expect(POOL).toContain(pick)
    }
    const other = POOL.find((i) => i !== today)!
    for (let i = 0; i < 200; i++) {
      const pick = randomPracticeIndex(other, LAUNCH_MS)
      expect(pick).not.toBe(today)
      expect(pick).not.toBe(other)
    }
  })
})
