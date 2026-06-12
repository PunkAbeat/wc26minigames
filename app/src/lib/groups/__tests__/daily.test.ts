import { describe, expect, it } from 'vitest'
import {
  GROUPS_LAUNCH_DAY,
  dailyPuzzle,
  dailyPuzzleIndex,
  dailyTileOrder,
  gridNumber,
  groupsDayNumber,
} from '../daily'
import { GROUPS_BANK, puzzleNations } from '../puzzles'

const DAY = 86400000
const launchMs = GROUPS_LAUNCH_DAY * DAY

describe('GROUPS daily schedule', () => {
  it('grid #1 on launch day, #2 the next UTC day', () => {
    expect(gridNumber(launchMs)).toBe(1)
    expect(gridNumber(launchMs + DAY - 1)).toBe(1)
    expect(gridNumber(launchMs + DAY)).toBe(2)
  })

  it('clamps before launch instead of going negative', () => {
    expect(groupsDayNumber(launchMs - 5 * DAY)).toBe(0)
  })

  it('cycles the bank deterministically', () => {
    for (let d = 0; d < GROUPS_BANK.length * 2; d++) {
      const now = launchMs + d * DAY
      expect(dailyPuzzleIndex(now)).toBe(d % GROUPS_BANK.length)
      expect(dailyPuzzle(now)).toBe(GROUPS_BANK[d % GROUPS_BANK.length])
    }
  })

  it('tile order is a stable seeded permutation of the 16 nations', () => {
    const now = launchMs + 3 * DAY
    const a = dailyTileOrder(now)
    const b = dailyTileOrder(now + 12 * 3600000) // same UTC day, later hour
    expect(a).toEqual(b)
    expect([...a].sort()).toEqual([...puzzleNations(dailyPuzzle(now))].sort())
  })

  it('different days shuffle differently even when the bank wraps', () => {
    const d0 = dailyTileOrder(launchMs)
    const wrapped = dailyTileOrder(launchMs + GROUPS_BANK.length * DAY) // same puzzle, next cycle
    expect([...d0].sort()).toEqual([...wrapped].sort())
    expect(d0).not.toEqual(wrapped)
  })
})
