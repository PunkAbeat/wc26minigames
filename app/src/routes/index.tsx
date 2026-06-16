/* MATCHDAY hub — ported from the original root index.html. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { track, trackPageView } from '../lib/analytics'
import { t, useLang } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import { LangSwitch } from '../components/LangSwitch'
import { FlagMark } from '../components/FlagMark'
import { BallMark } from '../components/BallMark'
import '../styles/hub.css'

const ORIGIN = (import.meta.env.VITE_SITE_ORIGIN as string | undefined) || ''

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        name: 'description',
        content:
          'A series of shareable mini games for the 2026 tournament. One stadium, many games.',
      },
      { property: 'og:title', content: 'MATCHDAY ⚽ WC26 mini games' },
      {
        property: 'og:description',
        content: 'One stadium, many games.',
      },
      { property: 'og:type', content: 'website' },
      /* the root link is what people paste — it must unfurl with a card */
      ...(ORIGIN
        ? [
            { property: 'og:url', content: ORIGIN + '/' },
            { property: 'og:image', content: ORIGIN + '/og/matchday.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:image', content: ORIGIN + '/og/matchday.png' },
          ]
        : []),
    ],
  }),
  component: Hub,
})

/* ===================== GAMES MANIFEST =====================
   Add a game: create its route under src/routes/, then add an entry here.
   status: "live" | "soon". tagline/badge are i18n keys. */
interface GameEntry {
  id: string
  name: string
  icon: string
  tagline: 'anthem_tagline' | 'flagsort_tagline' | 'keepies_tagline' | 'tba_tagline'
  status: 'live' | 'soon'
  badge: 'badge_live' | 'badge_campaign' | 'badge_freeplay' | 'badge_soon'
  to?: string
}

const GAMES: GameEntry[] = [
  {
    id: 'anthem',
    name: 'ANTHEM',
    icon: '🎺',
    tagline: 'anthem_tagline',
    status: 'live',
    badge: 'badge_live',
    to: '/anthem',
  },
  {
    id: 'flagsort',
    name: 'HOIST',
    icon: '🏴',
    tagline: 'flagsort_tagline',
    status: 'live',
    badge: 'badge_campaign',
    to: '/hoist',
  },
  {
    id: 'keepies',
    name: 'KEEPIES',
    icon: '⚽',
    tagline: 'keepies_tagline',
    status: 'live',
    badge: 'badge_freeplay',
    to: '/keepies',
  },
]

const BUNTING_COLS = ['#ffd23f', '#ff6b3d', '#ffffff', '#2fb955']

/* WC26: 11 Jun – 19 Jul 2026. Before: countdown. During: live. After: full time. */
const KICKOFF = new Date('2026-06-11T00:00:00')
const FULLTIME = new Date('2026-07-20T00:00:00')

function countdownText(now: Date, lang: Lang): string {
  if (now >= FULLTIME) return t(lang, 'full_time_2030')
  if (now >= KICKOFF) {
    const day = Math.floor((now.getTime() - KICKOFF.getTime()) / 86400000) + 1
    return t(lang, 'tournament_live', { n: day })
  }
  const ms = KICKOFF.getTime() - now.getTime()
  const d = Math.floor(ms / 86400000),
    h = Math.floor(ms / 3600000) % 24,
    m = Math.floor(ms / 60000) % 60
  return t(lang, 'kickoff_in', { t: (d > 0 ? d + 'D ' : '') + h + 'H ' + m + 'M' })
}

function Hub() {
  const [lang, setLang] = useLang()
  // client-only: the text depends on local time (and detected language), so
  // SSR renders the neutral placeholder and the first effect tick fills it in
  const [countdown, setCountdown] = useState('')
  useEffect(() => {
    trackPageView('/')
  }, [])
  useEffect(() => {
    const tick = () => setCountdown(countdownText(new Date(), lang))
    tick()
    const tmr = setInterval(tick, 30000)
    return () => clearInterval(tmr)
  }, [lang])

  return (
    <div className="page page-hub">
      <div className="bunting">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ borderTopColor: BUNTING_COLS[i % BUNTING_COLS.length] }} />
        ))}
      </div>

      <LangSwitch lang={lang} onChange={setLang} />

      <header>
        <div className="kicker">{t(lang, 'hub_kicker')}</div>
        <div className="wordmark disp">
          <span className="ball" />
          MATCHDAY
        </div>
        <div className="sub">
          {t(lang, 'hub_sub1')}
          <br />
          {t(lang, 'hub_sub2')}
        </div>
        <div className="scoreboard">
          <span className="live" />
          <span id="countdown">{countdown || t(lang, 'kickoff_soon')}</span>
        </div>
      </header>

      <main className="fixtures" id="fixtures">
        {GAMES.map((g, i) => {
          const live = g.status === 'live'
          const inner = (
            <>
              <div className="markings" />
              <div className="gc-pad">
                <div className="gc-icon">
                  {g.id === 'flagsort' ? (
                    <FlagMark size={38} />
                  ) : g.id === 'keepies' ? (
                    <BallMark size={36} />
                  ) : (
                    g.icon
                  )}
                </div>
                <div className="gc-body">
                  <div className="gc-name disp">{g.name}</div>
                  <div className="gc-tag">{t(lang, g.tagline)}</div>
                  <div className="gc-badge">
                    <span className="dot" />
                    {t(lang, g.badge)}
                  </div>
                </div>
                {live ? (
                  <div className="gc-cta disp">{t(lang, 'play_cta')}</div>
                ) : (
                  <div className="gc-lock">🔒</div>
                )}
              </div>
            </>
          )
          const style = { animationDelay: 0.08 * i + 's' }
          return live ? (
            <Link
              key={g.id}
              to={g.to!}
              className={'gamecard ' + g.status}
              style={style}
              aria-label={'Play ' + g.name}
            >
              {inner}
            </Link>
          ) : (
            <div key={g.id} className={'gamecard ' + g.status} style={style}>
              {inner}
            </div>
          )
        })}
      </main>

      <NewsletterCard lang={lang} />

      <div className="foot">
        {t(lang, 'hub_foot1')}
        <br />
        {t(lang, 'hub_foot2')}
      </div>
    </div>
  )
}

function NewsletterCard({ lang }: { lang: Lang }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)
  const hpRef = useRef<HTMLInputElement>(null)
  const mountTs = useRef(0) // set on mount (client-only) for the bot time check
  useEffect(() => {
    mountTs.current = Date.now()
  }, [])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = inputRef.current?.value.trim() || ''
    if (!email || state === 'sending') return
    setState('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          website: hpRef.current?.value || '',
          elapsed: mountTs.current ? Date.now() - mountTs.current : 0,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('done')
      track('newsletter_signup')
    } catch {
      setState('error')
    }
  }
  return (
    <div className="signup" id="signup">
      {state === 'done' ? (
        <div className="su-done" id="signupDone">
          {t(lang, 'nl_done')}
        </div>
      ) : (
        <>
          <div className="su-title disp">{t(lang, 'nl_title')}</div>
          <div className="su-sub">{t(lang, 'nl_sub')}</div>
          <form className="su-form" onSubmit={submit}>
            {/* honeypot: invisible to humans, irresistible to form bots */}
            <input
              ref={hpRef}
              type="text"
              name="website"
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {/* 16px input: anything smaller makes iOS zoom the page on focus */}
            <input
              ref={inputRef}
              id="signupEmail"
              type="email"
              required
              placeholder={t(lang, 'nl_placeholder')}
              autoComplete="email"
              aria-label="Email address"
            />
            <button className="disp" id="signupBtn" disabled={state === 'sending'}>
              {state === 'sending' ? '…' : t(lang, 'nl_button')}
            </button>
          </form>
          <div className="su-msg" id="signupMsg">
            {state === 'error' ? t(lang, 'nl_error') : ''}
          </div>
        </>
      )}
    </div>
  )
}
