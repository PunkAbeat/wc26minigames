import { describe, expect, it } from 'vitest'
import { START_OFFSETS } from '../offsets'
import { PUZZLES } from '../puzzles'

describe('start offsets', () => {
  it('every offset belongs to a real nation with real audio', () => {
    for (const name of Object.keys(START_OFFSETS)) {
      const p = PUZZLES.find((x) => x.name === name)
      expect(p, name).toBeDefined()
      expect(p!.audio, name).toBeTruthy()
    }
  })
  it('offsets are sane (0.4s–12s — a glitch must not eat the clip budget)', () => {
    for (const [name, off] of Object.entries(START_OFFSETS)) {
      expect(off, name).toBeGreaterThanOrEqual(0.4)
      expect(off, name).toBeLessThanOrEqual(12)
    }
  })
})
