/* KEEPIES progress — the best height (in metres) the player has reached on each
   nation's course. Drives the gold best-height badges on the course-select grid
   and the "NEW BEST!" end screen. Client-side only; no-ops without a window. */

const KEY = 'wc26_keepies_best'
const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage

export type BestMap = Record<string, number>

export function loadBest(): BestMap {
  if (!hasStorage()) return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as BestMap
  } catch {
    /* private mode / blocked storage — bests just won't persist */
  }
  return {}
}

export function saveBest(best: BestMap): void {
  if (!hasStorage()) return
  try {
    localStorage.setItem(KEY, JSON.stringify(best))
  } catch {
    /* ignore */
  }
}
