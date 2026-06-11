import { describe, expect, it } from 'vitest'
import { LOCAL_AUDIO } from '../audio-local'
import { PUZZLES } from '../puzzles'

describe('self-hosted audio manifest', () => {
  it('covers exactly the nations that have archive audio', () => {
    const expected = PUZZLES.filter((p) => p.audio).map((p) => p.name)
    expect(Object.keys(LOCAL_AUDIO).sort()).toEqual(expected.sort())
  })
  it('files are named by cc and durations are plausible anthem lengths', () => {
    for (const [name, { file, duration }] of Object.entries(LOCAL_AUDIO)) {
      const p = PUZZLES.find((x) => x.name === name)!
      expect(file).toBe(p.cc + '.mp3')
      expect(duration, name).toBeGreaterThan(20)
      expect(duration, name).toBeLessThan(400)
    }
  })
})
