/* MATCHDAY hub — ported from the original root index.html. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { track, trackPageView } from '../lib/analytics'
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
            { property: 'og:image', content: ORIGIN + '/og/anthem.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:image', content: ORIGIN + '/og/anthem.png' },
          ]
        : []),
    ],
  }),
  component: Hub,
})

/* ===================== GAMES MANIFEST =====================
   Add a game: create its route under src/routes/, then add an entry here.
   status: "live" | "soon".  */
interface GameEntry {
  id: string
  name: string
  icon: string
  tagline: string
  status: 'live' | 'soon'
  badge: string
  to?: string
}

const GAMES: GameEntry[] = [
  {
    id: 'anthem',
    name: 'ANTHEM',
    icon: '🎺',
    tagline: 'Hear a snippet of a national anthem, guess the nation in six tries.',
    status: 'live',
    badge: 'Daily · Play now',
    to: '/anthem',
  },
  { id: 'tba-1', name: '???', icon: '🥅', tagline: 'Next fixture being scheduled…', status: 'soon', badge: 'Coming soon' },
  { id: 'tba-2', name: '???', icon: '🏆', tagline: 'Next fixture being scheduled…', status: 'soon', badge: 'Coming soon' },
]

const BUNTING_COLS = ['#ffd23f', '#ff6b3d', '#ffffff', '#2fb955']

/* WC26: 11 Jun – 19 Jul 2026. Before: countdown. During: live. After: full time. */
const KICKOFF = new Date('2026-06-11T00:00:00')
const FULLTIME = new Date('2026-07-20T00:00:00')

function countdownText(now: Date): string {
  if (now >= FULLTIME) return 'FULL TIME · SEE YOU IN 2030'
  if (now >= KICKOFF) {
    const day = Math.floor((now.getTime() - KICKOFF.getTime()) / 86400000) + 1
    return 'TOURNAMENT LIVE · DAY ' + day
  }
  const ms = KICKOFF.getTime() - now.getTime()
  const d = Math.floor(ms / 86400000),
    h = Math.floor(ms / 3600000) % 24,
    m = Math.floor(ms / 60000) % 60
  return 'KICKOFF IN ' + (d > 0 ? d + 'D ' : '') + h + 'H ' + m + 'M'
}

function Hub() {
  // client-only: the text depends on local time, so SSR renders the neutral
  // placeholder and the first effect tick fills it in (no hydration mismatch)
  const [countdown, setCountdown] = useState('KICKOFF SOON')
  useEffect(() => {
    trackPageView('/')
    const tick = () => setCountdown(countdownText(new Date()))
    tick()
    const t = setInterval(tick, 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="page page-hub">
      <div className="bunting">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ borderTopColor: BUNTING_COLS[i % BUNTING_COLS.length] }} />
        ))}
      </div>

      <header>
        <div className="kicker">Summer 2026 · Mini Games</div>
        <div className="wordmark disp">
          <span className="ball" />
          MATCHDAY
        </div>
        <div className="sub">
          Mini games for the 2026 tournament.
          <br />
          One stadium, many games.
        </div>
        <div className="scoreboard">
          <span className="live" />
          <span id="countdown">{countdown}</span>
        </div>
      </header>

      <main className="fixtures" id="fixtures">
        {GAMES.map((g, i) => {
          const live = g.status === 'live'
          const inner = (
            <>
              <div className="markings" />
              <div className="gc-pad">
                <div className="gc-icon">{g.icon}</div>
                <div className="gc-body">
                  <div className="gc-name disp">{g.name}</div>
                  <div className="gc-tag">{g.tagline}</div>
                  <div className="gc-badge">
                    <span className="dot" />
                    {g.badge}
                  </div>
                </div>
                {live ? <div className="gc-cta disp">PLAY</div> : <div className="gc-lock">🔒</div>}
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

      <NewsletterCard />

      <div className="foot">
        Unofficial fan project · not affiliated with FIFA.
        <br />
        Anthem audio: public-domain recordings by the U.S. Navy Band via archive.org.
      </div>
    </div>
  )
}

function NewsletterCard() {
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
          ✅ You’re on the team sheet — we’ll email you when a new game drops.
        </div>
      ) : (
        <>
          <div className="su-title disp">🔔 More games are coming</div>
          <div className="su-sub">
            Want a heads-up when the next one drops? No spam — only new games.
          </div>
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
              placeholder="you@example.com"
              autoComplete="email"
              aria-label="Email address"
            />
            <button className="disp" id="signupBtn" disabled={state === 'sending'}>
              {state === 'sending' ? '…' : 'Keep me posted'}
            </button>
          </form>
          <div className="su-msg" id="signupMsg">
            {state === 'error' ? 'That didn’t go in — check the address and shoot again.' : ''}
          </div>
        </>
      )}
    </div>
  )
}
