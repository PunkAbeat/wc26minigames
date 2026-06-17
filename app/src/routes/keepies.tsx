/* KEEPIES — bounce your nation's flag-ball up the stadium; how high can you climb?
   A Doodle-Jump-style endless climber. Each of the 48 nations is a distinct course
   whose platform layout traces its flag's geometry (not its difficulty), so heights
   aren't comparable across nations — the nation is identity, not a ranking. Pure
   free-play: a fresh random course every run, best height saved per flag.

   The game is the imperative canvas engine in ../lib/keepies/game (ported verbatim
   from the feel mock); this route mounts it fullscreen and owns the page chrome
   (back link, how-to), best-height storage, and the in-game string table (the
   engine is language-agnostic — it reads localized copy via opts.strings). The
   language is the one chosen on the hub (detected/saved); on a language change the
   engine is remounted with the new strings. SSR renders an empty shell; the engine
   mounts in a client effect, so server and client markup always agree. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { mountKeepies } from '../lib/keepies/game'
import { loadBest, saveBest } from '../lib/keepies/storage'
import { track, trackPageView } from '../lib/analytics'
import { t, tb, useLang } from '../lib/i18n'
import type { StringKey } from '../lib/i18n'
import '../styles/keepies.css'

const ORIGIN = (import.meta.env.VITE_SITE_ORIGIN as string | undefined) || ''

/* in-game copy the engine renders itself (HUD, picker, overlay, end screen,
   share text). Built into a plain { key: text } map and injected as opts.strings. */
const KP_KEYS: StringKey[] = [
  'kp_metres_up', 'kp_best', 'kp_no_best', 'kp_style', 'kp_choose', 'kp_choose_sub',
  'kp_close', 'kp_reached', 'kp_start_sub', 'kp_tap_start', 'kp_new_best', 'kp_dropped',
  'kp_lost_at', 'kp_height_stat', 'kp_tap_again', 'kp_copied', 'kp_freeplay', 'kp_steer',
  'kp_tier_1', 'kp_tier_2', 'kp_tier_3', 'kp_tier_4', 'kp_tier_5', 'kp_tier_6',
  'kp_share', 'kp_card_sub', 'kp_share_line',
]

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
      ...(ORIGIN
        ? [
            { property: 'og:url', content: ORIGIN + '/keepies' },
            { property: 'og:image', content: ORIGIN + '/og/keepies.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:image', content: ORIGIN + '/og/keepies.png' },
          ]
        : []),
    ],
  }),
  component: KeepiesPage,
})

function KeepiesPage() {
  const [lang] = useLang()
  const rootRef = useRef<HTMLDivElement>(null)
  const ctrlRef = useRef<{ destroy: () => void; setPaused: (p: boolean) => void } | null>(null)
  const [howto, setHowto] = useState(false)

  useEffect(() => {
    trackPageView('/keepies')
  }, [])

  // (re)mount the engine with the current language's strings
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const strings: Record<string, string> = {}
    for (const k of KP_KEYS) strings[k] = t(lang, k)
    const ctrl = mountKeepies(root, { loadBest, saveBest, track, strings })
    ctrlRef.current = ctrl
    ctrl.setPaused(howto)
    return () => ctrl.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // freeze the climb while the how-to modal is open
  useEffect(() => {
    ctrlRef.current?.setPaused(howto)
  }, [howto])

  return (
    <div className="page-keepies">
      <div className="kp-stage">
        <div className="kp-root" ref={rootRef} />

        <Link className="kp-chrome kp-back" to="/" aria-label="All games">
          {t(lang, 'an_games_link')}
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
            <h2>{t(lang, 'kp_howto_title')}</h2>
            <p>{tb(lang, 'kp_howto_1')}</p>
            <p>{tb(lang, 'kp_howto_2')}</p>
            <button type="button" onClick={() => setHowto(false)}>
              {t(lang, 'kp_howto_close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
