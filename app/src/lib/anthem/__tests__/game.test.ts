import { describe, expect, it } from 'vitest'
import {
  applyGuess,
  applySkip,
  freshState,
  gridString,
  shareText,
  updateStreak,
} from '../game'
import { PUZZLES } from '../puzzles'

const france = PUZZLES.find((p) => p.name === 'France')!

describe('game transitions', () => {
  it('correct guess wins immediately and records the display name', () => {
    const s = applyGuess(freshState(), france, 'les bleus')
    expect(s.won).toBe(true)
    expect(s.finished).toBe(true)
    expect(s.attempt).toBe(1)
    expect(s.results[0]).toEqual({ type: 'correct', label: 'France' })
  })

  it('wrong guess advances the attempt and keeps the raw label', () => {
    const s = applyGuess(freshState(), france, 'Brazil')
    expect(s.won).toBe(false)
    expect(s.finished).toBe(false)
    expect(s.attempt).toBe(1)
    expect(s.results[0]).toEqual({ type: 'wrong', label: 'Brazil' })
  })

  it('six misses lose the game', () => {
    let s = freshState()
    for (let i = 0; i < 6; i++) s = applyGuess(s, france, 'Brazil')
    expect(s.finished).toBe(true)
    expect(s.won).toBe(false)
    expect(s.attempt).toBe(6)
  })

  it('skips count as attempts and can end the game', () => {
    let s = freshState()
    for (let i = 0; i < 6; i++) s = applySkip(s)
    expect(s.finished).toBe(true)
    expect(s.won).toBe(false)
    expect(s.results.every((r) => r.type === 'skip')).toBe(true)
  })

  it('finished games ignore further input', () => {
    let s = applyGuess(freshState(), france, 'France')
    const after = applyGuess(s, france, 'Brazil')
    expect(after).toBe(s)
    expect(applySkip(s)).toBe(s)
  })

  it('win after misses mixes the grid', () => {
    let s = applyGuess(freshState(), france, 'Brazil')
    s = applySkip(s)
    s = applyGuess(s, france, 'France')
    expect(gridString(s)).toBe('🟥⬛🟩')
    expect(s.attempt).toBe(3)
  })
})

describe('share text', () => {
  it('daily format', () => {
    let s = applyGuess(freshState(), france, 'Brazil')
    s = applyGuess(s, france, 'France')
    expect(shareText(s, 'daily', 2)).toBe(
      'ANTHEM ⚽ Match #2  2/6\n🟥🟩\nName the nation from its anthem',
    )
  })
  it('practice + loss format', () => {
    let s = freshState()
    for (let i = 0; i < 6; i++) s = applySkip(s)
    expect(shareText(s, 'practice', 7)).toBe(
      'ANTHEM ⚽ Practice  X/6\n⬛⬛⬛⬛⬛⬛\nName the nation from its anthem',
    )
  })
})

describe('streak', () => {
  it('first win starts at 1', () => {
    expect(updateStreak({}, 100, true)).toEqual({ count: 1, lastDay: 100 })
  })
  it('consecutive-day win increments', () => {
    expect(updateStreak({ count: 3, lastDay: 99 }, 100, true)).toEqual({
      count: 4,
      lastDay: 100,
    })
  })
  it('gap resets to 1', () => {
    expect(updateStreak({ count: 3, lastDay: 97 }, 100, true)).toEqual({
      count: 1,
      lastDay: 100,
    })
  })
  it('same-day repeat win does not double-count', () => {
    expect(updateStreak({ count: 3, lastDay: 100 }, 100, true)).toEqual({
      count: 3,
      lastDay: 100,
    })
  })
  it('loss zeroes the streak', () => {
    expect(updateStreak({ count: 5, lastDay: 99 }, 100, false)).toEqual({
      count: 0,
      lastDay: 100,
    })
  })
})

describe('stats', () => {
  it('counts a win into the right distribution slot', async () => {
    const { freshStats, updateStats, winPct } = await import('../game')
    let st = updateStats(freshStats(), true, 3, 1)
    expect(st).toEqual({ played: 1, wins: 1, dist: [0, 0, 1, 0, 0, 0], maxStreak: 1 })
    st = updateStats(st, false, 6, 0)
    expect(st.played).toBe(2)
    expect(st.wins).toBe(1)
    expect(st.dist).toEqual([0, 0, 1, 0, 0, 0])
    expect(winPct(st)).toBe(50)
  })
  it('tracks max streak across resets', async () => {
    const { freshStats, updateStats } = await import('../game')
    let st = updateStats(freshStats(), true, 1, 4)
    st = updateStats(st, false, 6, 0)
    st = updateStats(st, true, 2, 1)
    expect(st.maxStreak).toBe(4)
  })
  it('winPct of nothing is 0, never NaN', async () => {
    const { freshStats, winPct } = await import('../game')
    expect(winPct(freshStats())).toBe(0)
  })
})
