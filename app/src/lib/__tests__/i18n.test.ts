import { describe, expect, it } from 'vitest'
import { detectLang, t } from '../i18n'
import { isCorrect, isKnownNation, rankMatches } from '../anthem/text'
import { PUZZLES } from '../anthem/puzzles'
import { NATION_NAMES_I18N } from '../anthem/nation-names'
import { shareText, statsShareText, applyGuess, freshState } from '../anthem/game'

describe('string table', () => {
  it('substitutes vars', () => {
    expect(t('en', 'guess_n_of_6', { n: 3 })).toBe('Guess 3 / 6')
    expect(t('es', 'guess_n_of_6', { n: 3 })).toBe('Intento 3 / 6')
    expect(t('fr', 'guess_n_of_6', { n: 3 })).toBe('Essai 3 / 6')
  })
  it('match label keeps the non-breaking space', () => {
    expect(t('en', 'match_label', { n: 5 })).toBe('MATCH #5')
    expect(t('es', 'match_label', { n: 5 })).toBe('PARTIDO #5')
  })
  it('detectLang falls back to en outside the browser', () => {
    expect(detectLang()).toBe('en')
  })
})

describe('i18n nation names', () => {
  it('covers all 48 nations', () => {
    expect(Object.keys(NATION_NAMES_I18N).sort()).toEqual(PUZZLES.map((p) => p.name).sort())
  })
  it('localized names are correct guesses', () => {
    const spain = PUZZLES.find((p) => p.name === 'Spain')!
    const germany = PUZZLES.find((p) => p.name === 'Germany')!
    expect(isCorrect('España', spain)).toBe(true)
    expect(isCorrect('espana', spain)).toBe(true) // accent-folded
    expect(isCorrect('Allemagne', germany)).toBe(true)
    expect(isCorrect('Alemania', germany)).toBe(true)
    expect(isCorrect('Alemanha', germany)).toBe(true) // pt
    expect(isCorrect('Deutschland', germany)).toBe(true) // de
    expect(isCorrect('Duitsland', germany)).toBe(true) // nl
    expect(isCorrect('Almanya', germany)).toBe(true) // tr
    expect(isCorrect('ألمانيا', germany)).toBe(true) // ar
    expect(isCorrect('آلمان', germany)).toBe(true) // fa
    expect(isCorrect('ドイツ', germany)).toBe(true) // ja
    expect(isCorrect('독일', germany)).toBe(true) // ko
  })
  it('every shipped language has a name for every nation', () => {
    for (const [nation, n] of Object.entries(NATION_NAMES_I18N)) {
      for (const lang of ['es', 'fr', 'pt', 'de', 'nl', 'tr', 'ar', 'fa', 'ja', 'ko'] as const) {
        expect(n.names[lang], nation + ' missing ' + lang).toBeTruthy()
      }
    }
  })
  it('alt long forms are accepted', () => {
    const cz = PUZZLES.find((p) => p.name === 'Czechia')!
    expect(isCorrect('República Checa', cz)).toBe(true)
  })
  it('ES/FR names count as known nations (no "pick from the list" toast)', () => {
    expect(isKnownNation('Inglaterra')).toBe(true)
    expect(isKnownNation('Côte d’Ivoire')).toBe(true)
    expect(isKnownNation('Atlantis')).toBe(false)
  })
  it('the picker surfaces ES/FR prefixes', () => {
    expect(rankMatches('Espa')[0].name).toBe('Spain')
    expect(rankMatches('Allema')[0].name).toBe('Germany')
  })
  it('wrong guesses stay wrong', () => {
    const spain = PUZZLES.find((p) => p.name === 'Spain')!
    expect(isCorrect('Francia', spain)).toBe(false)
  })
})

describe('localized share text', () => {
  it('es share text', () => {
    const france = PUZZLES.find((p) => p.name === 'France')!
    const s = applyGuess(freshState(), france, 'France')
    expect(shareText(s, 'daily', 2, 'es')).toBe(
      'ANTHEM ⚽ Partido #2  1/6\n🟩\nAdivina el país por su himno',
    )
  })
  it('fr record text', () => {
    const st = { played: 12, wins: 10, dist: [1, 2, 3, 2, 1, 1], maxStreak: 7 }
    expect(statsShareText(st, 5, 'fr')).toBe(
      'ANTHEM ⚽ Mon bilan\nJoués 12 · Victoires 83% · Série 5 (record 7)\nDevinez le pays à son hymne',
    )
  })
  it('defaults to en (back-compat)', () => {
    const france = PUZZLES.find((p) => p.name === 'France')!
    const s = applyGuess(freshState(), france, 'France')
    expect(shareText(s, 'daily', 1)).toBe(
      'ANTHEM ⚽ Match #1  1/6\n🟩\nName the nation from its anthem',
    )
  })
})
