/* FLAG SORT campaign progress — the set of nation names whose flag the player
   has built at least once. Drives the ✅ ticks and the "n / 48" counter on the
   ROAD TO THE FINAL grid. Client-side only; no-ops without a window. */

const KEY = 'wc26_flagsort_solved'
const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage

export function loadSolved(): Set<string> {
  if (!hasStorage()) return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return new Set(JSON.parse(raw) as string[])
  } catch {
    /* private mode / blocked storage — campaign just won't persist */
  }
  return new Set()
}

export function saveSolved(solved: Set<string>): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem(KEY, JSON.stringify([...solved]))
  } catch {
    /* ignore */
  }
}
