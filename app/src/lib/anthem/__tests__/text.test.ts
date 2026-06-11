import { describe, expect, it } from 'vitest'
import { PUZZLES } from '../puzzles'
import {
  NATIONS,
  fold,
  isCorrect,
  isKnownNation,
  isSelectedName,
  normalize,
  rankMatches,
} from '../text'

const byName = (n: string) => PUZZLES.find((p) => p.name === n)!

describe('normalize / fold', () => {
  it('lowercases, trims, strips dots, collapses spaces', () => {
    expect(normalize('  U.S.A.  ')).toBe('usa')
    expect(normalize('South   Korea')).toBe('south korea')
  })
  it('folds accents', () => {
    expect(fold('Curaçao')).toBe('curacao')
    expect(fold('Türkiye')).toBe('turkiye')
  })
})

describe('isCorrect / isKnownNation', () => {
  it('accepts the display name in any case', () => {
    expect(isCorrect('  france ', byName('France'))).toBe(true)
    expect(isCorrect('FRANCE', byName('France'))).toBe(true)
  })
  it('accepts aliases', () => {
    expect(isCorrect('holland', byName('Netherlands'))).toBe(true)
    expect(isCorrect('usa', byName('United States'))).toBe(true)
    expect(isCorrect('el tri', byName('Mexico'))).toBe(true)
  })
  it('rejects other nations and garbage', () => {
    expect(isCorrect('Brazil', byName('France'))).toBe(false)
    expect(isCorrect('xyz', byName('France'))).toBe(false)
  })
  it('isKnownNation covers names and aliases, not garbage', () => {
    expect(isKnownNation('Brazil')).toBe(true)
    expect(isKnownNation('holland')).toBe(true)
    expect(isKnownNation('narnia')).toBe(false)
  })
})

describe('picker ranking', () => {
  it('empty query lists all 48 nations alphabetically', () => {
    const all = rankMatches('')
    expect(all).toHaveLength(48)
    expect(all.map((n) => n.name)).toEqual(NATIONS.map((n) => n.name))
  })
  it("'fra' filters to France", () => {
    const m = rankMatches('fra')
    expect(m).toHaveLength(1)
    expect(m[0].name).toBe('France')
  })
  it('alias prefix matches rank below name prefix', () => {
    const m = rankMatches('holland')
    expect(m[0].name).toBe('Netherlands')
  })
  it('accent folding finds Türkiye and Curaçao', () => {
    expect(rankMatches('turk').some((n) => n.name === 'Türkiye')).toBe(true)
    expect(rankMatches('curacao').some((n) => n.name === 'Curaçao')).toBe(true)
  })
  it('no match for garbage', () => {
    expect(rankMatches('xyz')).toHaveLength(0)
  })
  it('isSelectedName only matches full display names', () => {
    expect(isSelectedName('Brazil')).toBe(true)
    expect(isSelectedName('brazil')).toBe(true)
    expect(isSelectedName('holland')).toBe(false)
    expect(isSelectedName('bra')).toBe(false)
  })
})
