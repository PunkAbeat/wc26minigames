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
import { useEffect, useRef, useState } from 'react'
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

const BUNTING_COLS = ['#ffd23f', '#ffffff', '#ff6b3d', '#1fd17a']

function FlagSortPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [howto, setHowto] = useState(false)

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
    <div className="page page-flagsort fs-root" ref={rootRef}>
      {/* liquid behind (#liqc), splashes in front (#fxc) — both full-viewport */}
      <canvas id="liqc" className="fx" />
      <canvas id="fxc" className="fx" />

      <div className="bunting" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => (
          <i key={i} style={{ borderTopColor: BUNTING_COLS[i % BUNTING_COLS.length] }} />
        ))}
      </div>

      <header>
        <Link className="back" to="/" aria-label="All games">
          ⚽ Games
        </Link>
        <button className="help" aria-label="How to play" type="button" onClick={() => setHowto(true)}>
          ?
        </button>
        <button className="statsbtn" id="menu" aria-label="All flags" type="button">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
          </svg>
        </button>
        <div className="kicker">Summer 2026 · 48 nations</div>
        <div className="wordmark disp">
          <span className="emblem" aria-hidden="true">
            🎌
          </span>
          FLAG SORT
        </div>
        <div className="sub">Pour the colours, build the flag</div>
        <div className="scoreboard">
          <span className="trophy" aria-hidden="true">
            🏆
          </span>
          <span id="lvl" />
        </div>
      </header>

      {/* the engine fills #select (grid), #frame (regions), #row (tubes),
          #flagname / #lvl / #hint, and wires #menu / #undo / #restart */}
      <div id="select" hidden />

      <div className="card">
        <div className="deco" aria-hidden="true">
          <div className="markings" />
          <div className="cl" />
          <div className="cc" />
        </div>
        <div className="pad">
          <div className="flagname" id="flagname" />
          <div className="frame" id="frame" />
          <div className="hintwrap">
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
        </div>
      </div>

      {howto && (
        <div className="fs-modal" onClick={() => setHowto(false)}>
          <div className="fs-modalcard" onClick={(e) => e.stopPropagation()}>
            <h2>How to play</h2>
            <p>
              Tap a tube, then tap another tube or the flag frame to pour. The flag fills its{' '}
              <b>highlighted region first</b> — match the colour the hint asks for.
            </p>
            <p>
              Some colours are <b>junk</b>: they never belong in the flag. Park them in spare tubes
              to clear the way. Build all 48 nations on the Road to the Final.
            </p>
            <button type="button" onClick={() => setHowto(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
