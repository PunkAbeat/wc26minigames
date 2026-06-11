/* MATCHDAY hub — ported from the original root index.html. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import '../styles/hub.css'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        name: 'description',
        content:
          'A series of daily, shareable mini games for the 2026 World Cup. One stadium, many games — new kickoff every day.',
      },
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
        <div className="kicker">World Cup 2026 · USA · Canada · Mexico</div>
        <div className="wordmark disp">
          <span className="ball" />
          MATCHDAY
        </div>
        <div className="sub">
          Daily mini games for the World Cup.
          <br />
          One stadium, many games — new kickoff every day.
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

      <div className="foot">
        Unofficial fan project · not affiliated with FIFA.
        <br />
        Anthem audio: public-domain recordings by the U.S. Navy Band via archive.org.
      </div>
    </div>
  )
}
