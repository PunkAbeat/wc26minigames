import { describe, expect, it } from 'vitest'
import { noteFreq, scheduleMelody } from '../engine/synth'
import { PUZZLES } from '../puzzles'

describe('noteFreq', () => {
  it('A4 = 440, octaves double, semitones step by 2^(1/12)', () => {
    expect(noteFreq('A4')).toBeCloseTo(440)
    expect(noteFreq('A5')).toBeCloseTo(880)
    expect(noteFreq('A3')).toBeCloseTo(220)
    expect(noteFreq('A#4')).toBeCloseTo(440 * Math.pow(2, 1 / 12))
    expect(noteFreq('C4')).toBeCloseTo(261.626, 2)
  })
})

describe('scheduleMelody', () => {
  it('lays notes back to back at 0.5s per beat', () => {
    const s = scheduleMelody([
      ['C4', 1],
      ['rest', 2],
      ['E4', 0.5],
    ])
    expect(s.total).toBeCloseTo(1.75)
    expect(s.notes).toHaveLength(2) // rest occupies time but emits no note
    expect(s.notes[0]).toMatchObject({ start: 0, dur: 0.5 })
    expect(s.notes[1].start).toBeCloseTo(1.5)
    expect(s.notes[1].dur).toBeCloseTo(0.25)
  })

  it('parses every hand-transcribed melody in the puzzle data', () => {
    const withMelody = PUZZLES.filter((p) => p.melody && p.melody.length)
    expect(withMelody.map((p) => p.name).sort()).toEqual([
      'England',
      'France',
      'Germany',
      'Japan',
      'United States',
    ])
    for (const p of withMelody) {
      const s = scheduleMelody(p.melody!)
      expect(s.total).toBeGreaterThan(3)
      expect(s.notes.length).toBeGreaterThan(8)
      s.notes.forEach((n) => expect(n.f).toBeGreaterThan(100))
    }
  })
})
