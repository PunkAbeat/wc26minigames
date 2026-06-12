/* Bank validity — editorial mistakes here would ship a broken grid, so the
   shape rules from puzzles.ts are enforced mechanically. */
import { describe, expect, it } from 'vitest'
import { GROUPS_BANK, puzzleNations } from '../puzzles'
import { PUZZLES } from '../../anthem/puzzles'

const KNOWN = new Set(PUZZLES.map((p) => p.name))

describe('GROUPS bank', () => {
  it('has at least a week of grids', () => {
    expect(GROUPS_BANK.length).toBeGreaterThanOrEqual(7)
  })

  it.each(GROUPS_BANK.map((p, i) => [i + 1, p] as const))('grid #%i is well-formed', (_n, p) => {
    expect(p.groups).toHaveLength(4)
    // one group per tier, stored in tier order
    expect(p.groups.map((g) => g.tier)).toEqual([0, 1, 2, 3])
    for (const g of p.groups) {
      expect(g.nations).toHaveLength(4)
      expect(g.title.length).toBeGreaterThan(3)
    }
    // 16 distinct nations, every one a qualified 2026 nation from the anthem data
    const names = puzzleNations(p)
    expect(new Set(names).size).toBe(16)
    for (const n of names) expect(KNOWN, `unknown nation "${n}"`).toContain(n)
  })
})
