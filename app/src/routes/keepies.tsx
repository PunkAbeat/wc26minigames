/* KEEPIES — bounce your nation's flag-ball up the stadium; how high can you climb?
   A Doodle-Jump-style endless climber. Each of the 48 nations is a distinct course
   whose platform layout traces its flag's geometry (not its difficulty), so heights
   aren't comparable across nations — the nation is identity, not a ranking. Pure
   free-play: a fresh random course every run, best height saved per flag.

   The game is the imperative canvas engine in ../lib/keepies/game (ported verbatim
   from the feel mock); this route mounts it fullscreen and owns only the page chrome
   (back link, how-to) + best-height storage. Like ANTHEM/HOIST phase 1, in-game copy
   is English-only for now; the hub tagline is translated. SSR renders an empty shell;
   the engine mounts in a client effect, so server and client markup always agree. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { mountKeepies } from '../lib/keepies/game'
import { loadBest, saveBest } from '../lib/keepies/storage'
import { track, trackPageView } from '../lib/analytics'
import '../styles/keepies.css'

const ORIGIN = (import.meta.env.VITE_SITE_ORIGIN as string | undefined) || ''

export const Route = createFileRoute('/keepies')({
  head: () => ({
    meta: [
      { title: 'KEEPIES ⚽ Bounce your nation up the stadium' },
      {
        name: 'description',
        content:
          'Bounce your nation’s ball up the stadium in this endless climber — 48 nations, 48 courses. How high can you climb?',
      },
      { property: 'og:title', content: 'KEEPIES ⚽ Bounce your nation up the stadium' },
      { property: 'og:description', content: '48 nations, 48 climbs. How high can you go?' },
      { property: 'og:type', content: 'website' },
      ...(ORIGIN ? [{ property: 'og:url', content: ORIGIN + '/keepies' }] : []),
    ],
  }),
  component: KeepiesPage,
})

function KeepiesPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const ctrlRef = useRef<{ destroy: () => void; setPaused: (p: boolean) => void } | null>(null)
  const [howto, setHowto] = useState(false)

  useEffect(() => {
    trackPageView('/keepies')
    const root = rootRef.current
    if (!root) return
    const ctrl = mountKeepies(root, { loadBest, saveBest, track })
    ctrlRef.current = ctrl
    return () => ctrl.destroy()
  }, [])

  // freeze the climb while the how-to modal is open
  useEffect(() => {
    ctrlRef.current?.setPaused(howto)
  }, [howto])

  return (
    <div className="page-keepies">
      <div className="kp-stage">
        <div className="kp-root" ref={rootRef} />

        <Link className="kp-chrome kp-back" to="/" aria-label="All games">
          ⚽ Games
        </Link>
        <button
          className="kp-chrome kp-help"
          aria-label="How to play"
          type="button"
          onClick={() => setHowto(true)}
        >
          ?
        </button>
      </div>

      {howto && (
        <div className="kp-chrome kp-modal" onClick={() => setHowto(false)}>
          <div className="kp-modalcard" onClick={(e) => e.stopPropagation()}>
            <h2>How to play</h2>
            <p>
              The ball bounces on its own. <b>Drag left/right</b> (or use the{' '}
              <b>arrow keys</b>) to land each bounce on a platform and climb higher.
            </p>
            <p>
              Watch for <b>gold trampolines</b> and the <b>keeper’s punt</b> (a big boost) —
              and don’t trust the <b>cracked platforms</b>, they crumble. Pick any of the 48
              nations; each is its own course. Don’t let the ball drop!
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
