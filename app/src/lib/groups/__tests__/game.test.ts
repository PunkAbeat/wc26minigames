import { describe, expect, it } from 'vitest'
import {
  MAX_MISTAKES,
  applyGuess,
  evaluateGuess,
  freshState,
  remainingTiles,
  shareText,
  unsolvedGroups,
  updateStreak,
} from '../game'
import type { GroupsState } from '../game'
import { GROUPS_BANK, puzzleNations } from '../puzzles'

const P = GROUPS_BANK[0]
const g = (i: number) => [...P.groups[i].nations]
/* 3 from group a + 1 from group b */
const oneAway = (a: number, b: number) => [...g(a).slice(0, 3), g(b)[0]]

describe('evaluateGuess', () => {
  it('full group → correct with index', () => {
    expect(evaluateGuess(P, g(2))).toEqual({ kind: 'correct', groupIdx: 2 })
  })
  it('3 of 4 → one-away', () => {
    expect(evaluateGuess(P, oneAway(1, 3)).kind).toBe('one-away')
  })
  it('2+2 → plain miss', () => {
    expect(evaluateGuess(P, [...g(0).slice(0, 2), ...g(1).slice(0, 2)]).kind).toBe('miss')
  })
  it('wrong sizes / unknown nations are invalid', () => {
    expect(evaluateGuess(P, g(0).slice(0, 3)).kind).toBe('invalid')
    expect(evaluateGuess(P, [...g(0).slice(0, 3), 'Atlantis']).kind).toBe('invalid')
    expect(evaluateGuess(P, [g(0)[0], g(0)[0], g(0)[1], g(0)[2]]).kind).toBe('invalid')
  })
})

describe('applyGuess', () => {
  it('solves all four groups → win, mistakes preserved', () => {
    let s = freshState()
    const r1 = applyGuess(s, P, oneAway(0, 1))
    s = r1.state
    expect(r1.outcome.kind).toBe('one-away')
    expect(s.mistakes).toBe(1)
    for (const i of [0, 1, 2, 3]) s = applyGuess(s, P, g(i)).state
    expect(s.finished && s.won).toBe(true)
    expect(s.found).toEqual([0, 1, 2, 3])
    expect(s.guesses).toHaveLength(5)
  })

  it('4 mistakes → loss', () => {
    let s = freshState()
    // four distinct wrong picks (varying the odd-one-out group)
    for (const [a, b] of [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
    ]) {
      const r = applyGuess(s, P, oneAway(a, b))
      expect(r.outcome.kind).toBe('one-away')
      s = r.state
    }
    expect(s.mistakes).toBe(MAX_MISTAKES)
    expect(s.finished).toBe(true)
    expect(s.won).toBe(false)
    expect(unsolvedGroups(P, s)).toEqual([0, 1, 2, 3])
  })

  it('duplicate pick costs nothing (order-insensitive)', () => {
    let s = freshState()
    const picks = oneAway(0, 2)
    s = applyGuess(s, P, picks).state
    const again = applyGuess(s, P, [...picks].reverse())
    expect(again.outcome.kind).toBe('duplicate')
    expect(again.state.mistakes).toBe(1)
    expect(again.state.guesses).toHaveLength(1)
  })

  it('no further input after finish', () => {
    let s = freshState()
    for (const i of [0, 1, 2, 3]) s = applyGuess(s, P, g(i)).state
    expect(applyGuess(s, P, g(0)).outcome.kind).toBe('invalid')
  })

  it('remainingTiles shrinks as groups solve', () => {
    const order = puzzleNations(P)
    let s = freshState()
    expect(remainingTiles(P, s, order)).toHaveLength(16)
    s = applyGuess(s, P, g(1)).state
    const left = remainingTiles(P, s, order)
    expect(left).toHaveLength(12)
    for (const n of P.groups[1].nations) expect(left).not.toContain(n)
  })
})

describe('streak & share', () => {
  it('streak: consecutive wins chain, a miss day resets, a loss zeroes', () => {
    let st = updateStreak({}, 10, true)
    expect(st).toEqual({ count: 1, lastDay: 10 })
    st = updateStreak(st, 11, true)
    expect(st.count).toBe(2)
    st = updateStreak(st, 13, true) // skipped day 12
    expect(st.count).toBe(1)
    st = updateStreak(st, 14, false)
    expect(st.count).toBe(0)
  })

  it('share text: one tier-emoji row per guess, spoiler-free', () => {
    let s = freshState()
    s = applyGuess(s, P, oneAway(3, 0)).state
    for (const i of [0, 1, 2, 3]) s = applyGuess(s, P, g(i)).state
    const txt = shareText(s, 7, 'example.com')
    const lines = txt.split('\n')
    expect(lines[0]).toBe('GROUPS ⚽ Grid #7 1 mistake')
    expect(lines).toHaveLength(1 + 5 + 1)
    expect(lines[1]).toBe('🟪🟪🟪🟨') // the one-away row, true colours
    expect(lines[2]).toBe('🟨🟨🟨🟨')
    expect(lines[5]).toBe('🟪🟪🟪🟪')
    expect(lines[6]).toBe('example.com/groups')
    for (const n of puzzleNations(P)) expect(txt).not.toContain(n)
  })

  it('share text marks a loss with X', () => {
    const lost: GroupsState = { ...freshState(), finished: true, won: false, mistakes: 4 }
    expect(shareText(lost, 2, '').startsWith('GROUPS ⚽ Grid #2 X')).toBe(true)
  })
})
