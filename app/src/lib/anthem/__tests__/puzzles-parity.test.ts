/* Parity gate: the TS port of PUZZLES must match the original game file
   byte-for-byte in content. We extract the original array literal from
   games/anthem/index.html (the untouched behavioral reference) and eval it. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_NATIONS, PUZZLES } from '../puzzles'

function originalPuzzles(): any[] {
  const html = readFileSync(
    join(__dirname, '../../../../../games/anthem/index.html'),
    'utf-8',
  )
  const m = html.match(/const PUZZLES=(\[[\s\S]*?\n\]);/)
  if (!m) throw new Error('could not locate PUZZLES literal in original file')
  return new Function('return ' + m[1])()
}

describe('PUZZLES parity with the original game', () => {
  const orig = originalPuzzles()

  it('has the same 48 nations in the same order', () => {
    expect(PUZZLES.map((p) => p.name)).toEqual(orig.map((p: any) => p.name))
    expect(PUZZLES).toHaveLength(48)
  })

  it('every field matches the original exactly', () => {
    // normalise: TS port types audio as string|null; original omits melody sometimes
    const norm = (p: any) => ({
      name: p.name,
      flag: p.flag,
      cc: p.cc,
      colors: p.colors,
      aliases: p.aliases,
      audio: p.audio ?? null,
      verdict: p.verdict,
      hints: p.hints,
      melody: p.melody ?? undefined,
    })
    expect(PUZZLES.map(norm)).toEqual(orig.map(norm))
  })

  it('ALL_NATIONS is the sorted name list', () => {
    expect(ALL_NATIONS).toEqual(orig.map((p: any) => p.name).sort())
  })
})
