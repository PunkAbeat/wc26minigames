/* FLAG SORT — build the flag by pouring its colours into place, water-sort
   style. Campaign ("Road to the Final", all 48 qualified nations) + play any
   nation. The game itself is the imperative canvas engine in
   ../lib/flagsort/game (ported verbatim from the feel mock); this route only
   renders the DOM skeleton it writes into, plus the app chrome, and owns
   campaign progress via localStorage.

   Like ANTHEM at phase 1, the in-game copy is English-only for now; the hub
   tagline is translated. SSR renders the static shell; the engine mounts in a
   client effect, so server and client markup always agree. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { mountFlagSort } from '../lib/flagsort/game'
import { loadSolved, saveSolved } from '../lib/flagsort/storage'
import { track, trackPageView } from '../lib/analytics'
import '../styles/flagsort.css'

const ORIGIN = (import.meta.env.VITE_SITE_ORIGIN as string | undefined) || ''

export const Route = createFileRoute('/flagsort')({
  head: () => ({
    meta: [
      { title: 'FLAG SORT ⚽ Build every World Cup flag' },
      {
        name: 'description',
        content:
          'Pour the colours into place to build the flags of all 48 qualified nations. A water-sort puzzle for the 2026 tournament.',
      },
      { property: 'og:title', content: 'FLAG SORT ⚽ Build every World Cup flag' },
      {
        property: 'og:description',
        content: 'Sort the colours, build the flag. 48 nations, one Road to the Final.',
      },
      { property: 'og:type', content: 'website' },
      ...(ORIGIN
        ? [
            { property: 'og:url', content: ORIGIN + '/flagsort' },
            { property: 'og:image', content: ORIGIN + '/og/matchday.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:image', content: ORIGIN + '/og/matchday.png' },
          ]
        : []),
    ],
  }),
  component: FlagSortPage,
})

function FlagSortPage() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackPageView('/flagsort')
    const root = rootRef.current
    if (!root) return
    const solved = loadSolved()
    const ctrl = mountFlagSort(root, {
      solved,
      onSolve: (name: string) => {
        saveSolved(solved)
        track('flagsort_solve', { flag: name })
      },
      track,
    })
    return () => ctrl.destroy()
  }, [])

  return (
    <div className="fs-root" ref={rootRef}>
      {/* liquid behind (#liqc), splashes in front (#fxc) — both full-viewport */}
      <canvas id="liqc" className="fx" />
      <canvas id="fxc" className="fx" />

      <header className="top">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="back" aria-label="Back to games">
            ⚽ Games
          </Link>
          <button id="menu" title="All flags" type="button">
            ≡
          </button>
          <div className="brand">
            FLAG SORT<span className="tag">BETA</span>
          </div>
        </div>
        <div className="lvl" id="lvl" />
      </header>

      {/* the engine fills #select (grid), #frame (regions), #row (tubes),
          #flagname / #lvl / #hint, and wires #menu / #undo / #restart */}
      <div id="select" hidden />

      <main>
        <div className="flagname" id="flagname" />
        <div className="frame" id="frame" />
        <div>
          <span className="hint" id="hint" />
        </div>
        <div className="row" id="row" />
        <div className="controls">
          <button id="undo" type="button">
            ↩ UNDO
          </button>
          <button id="restart" type="button">
            ↻ RESTART
          </button>
        </div>
        <p className="note">
          Tap a tube, then tap another tube or the flag. The flag fills its{' '}
          <b>highlighted region first</b>. Junk colours never enter the flag — park them in tubes.
        </p>
      </main>
    </div>
  )
}
