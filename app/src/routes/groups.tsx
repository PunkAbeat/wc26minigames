/* GROUPS — game #2 (prototype): daily Connections-style grid. Sort the 16
   nations into four hidden groups of four; 4 mistakes allowed; one grid per
   UTC day. All daily/localStorage computation happens in mount effects only
   (SSR renders an empty shell) — see docs/engineering.md runtime rules. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { trackPageView, track } from '../lib/analytics'
import { t, tb, useLang } from '../lib/i18n'
import { LangSwitch } from '../components/LangSwitch'
import { PUZZLES } from '../lib/anthem/puzzles'
import { utcDay } from '../lib/anthem/daily'
import {
  dailyPuzzle,
  dailyPuzzleIndex,
  dailyTileOrder,
  gridNumber,
  groupsDayNumber,
} from '../lib/groups/daily'
import {
  MAX_MISTAKES,
  applyGuess,
  freshState,
  remainingTiles,
  shareText,
  unsolvedGroups,
  updateStreak,
} from '../lib/groups/game'
import type { GroupsState } from '../lib/groups/game'
import type { GroupsPuzzle } from '../lib/groups/puzzles'
import {
  hasSeenHowto,
  loadSavedDaily,
  loadStreak,
  markHowtoSeen,
  saveDaily,
  saveStreak,
} from '../lib/groups/storage'
import '../styles/groups.css'

export const Route = createFileRoute('/groups')({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Sort 16 World Cup nations into four hidden groups — a new grid every day.',
      },
      { property: 'og:title', content: 'GROUPS ⚽ daily nation-sorting game' },
      { property: 'og:description', content: 'Sort 16 nations into 4 hidden groups.' },
      { property: 'og:type', content: 'website' },
    ],
  }),
  component: GroupsPage,
})

const BUNTING_COLS = ['#ffd23f', '#ff6b3d', '#ffffff', '#2fb955']

/* nation name → flagcdn country code, from the anthem roster */
const CC: Record<string, string> = Object.fromEntries(PUZZLES.map((p) => [p.name, p.cc]))

interface Boot {
  day: number
  gridNo: number
  puzzle: GroupsPuzzle
  order: string[]
}

function GroupsPage() {
  const [lang, setLang] = useLang()
  const [boot, setBoot] = useState<Boot | null>(null) // client-only daily context
  const [game, setGame] = useState<GroupsState>(freshState)
  const [sel, setSel] = useState<string[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [streak, setStreakState] = useState(0)
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [toast, setToastState] = useState({ msg: '', on: false })
  const [shaking, setShaking] = useState(false)
  const [nextIn, setNextIn] = useState('')

  const langRef = useRef(lang)
  langRef.current = lang
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setToast = useCallback((msg: string) => {
    setToastState({ msg, on: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState((s) => ({ ...s, on: false })), 1600)
  }, [])

  /* boot/reboot from localStorage — mount effect + test hook entry point */
  const startDaily = useCallback(() => {
    const day = groupsDayNumber()
    const b: Boot = {
      day,
      gridNo: gridNumber(),
      puzzle: dailyPuzzle(),
      order: dailyTileOrder(),
    }
    setBoot(b)
    setOrder(b.order)
    setGame(loadSavedDaily(day) || freshState())
    setSel([])
    setStreakState(loadStreak().count || 0)
    if (!hasSeenHowto()) setHowtoOpen(true)
  }, [])

  useEffect(() => {
    trackPageView('/groups')
    startDaily()
  }, [startDaily])

  const hideHowto = useCallback(() => {
    setHowtoOpen(false)
    markHowtoSeen()
  }, [])

  /* Escape closes the modal */
  useEffect(() => {
    if (!howtoOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideHowto()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [howtoOpen, hideHowto])

  const toggleTile = useCallback(
    (name: string) => {
      if (game.finished) return
      setSel((s) =>
        s.includes(name) ? s.filter((n) => n !== name) : s.length < 4 ? [...s, name] : s,
      )
    },
    [game.finished],
  )

  const shuffle = useCallback(() => {
    setOrder((o) => {
      const a = o.slice()
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t2 = a[i]
        a[i] = a[j]
        a[j] = t2
      }
      return a
    })
  }, [])

  const submitGuess = useCallback(() => {
    if (!boot || game.finished) return
    if (sel.length !== 4) {
      setToast(t(langRef.current, 'gr_pick4'))
      return
    }
    const { state: next, outcome } = applyGuess(game, boot.puzzle, sel)
    if (outcome.kind === 'duplicate') {
      setToast(t(langRef.current, 'gr_dup'))
      return
    }
    if (outcome.kind === 'invalid') return
    setGame(next)
    saveDaily(boot.day, next)
    if (outcome.kind === 'correct') {
      setSel([])
    } else {
      if (outcome.kind === 'one-away') setToast(t(langRef.current, 'gr_one_away'))
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
    if (next.finished) {
      setSel([])
      const st = updateStreak(loadStreak(), boot.day, next.won)
      saveStreak(st)
      setStreakState(st.count || 0)
      track(next.won ? 'groups_win' : 'groups_lose', { mistakes: String(next.mistakes) })
    }
  }, [boot, game, sel, setToast])

  /* countdown to the next grid (next UTC midnight) */
  useEffect(() => {
    if (!game.finished) {
      setNextIn('')
      return
    }
    const tick = () => {
      const ms = (utcDay() + 1) * 86400000 - Date.now()
      if (ms <= 0) {
        location.reload()
        return
      }
      const h = String(Math.floor(ms / 3600000)).padStart(2, '0')
      const m = String(Math.floor(ms / 60000) % 60).padStart(2, '0')
      const s = String(Math.floor(ms / 1000) % 60).padStart(2, '0')
      setNextIn(t(lang, 'gr_next_in', { t: h + ':' + m + ':' + s }))
    }
    tick()
    const tmr = setInterval(tick, 1000)
    return () => clearInterval(tmr)
  }, [game.finished, lang])

  const share = useCallback(() => {
    if (!boot) return
    const txt =
      shareText(game, boot.gridNo, '') +
      '\n' +
      t(langRef.current, 'gr_share_tail') +
      '\n' +
      location.host + '/groups'
    track('groups_share')
    if (navigator.share) {
      navigator.share({ text: txt }).catch(() => {})
      return
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(txt)
        .then(() => setToast(t(langRef.current, 'toast_copied')))
        .catch(() => {})
    }
  }, [boot, game, setToast])

  /* ---------- test hook (headless suite 12 drives the game through this) ---------- */
  useEffect(() => {
    ;(window as any).__groups = {
      state: game,
      puzzle: boot?.puzzle ?? null,
      order,
      selection: sel,
      gridNo: boot?.gridNo ?? null,
      day: boot?.day ?? null,
      puzzleIndex: dailyPuzzleIndex,
      toggleTile,
      clearSel: () => setSel([]),
      submitGuess,
      startDaily,
      shuffle,
      hideHowto,
      showHowto: () => setHowtoOpen(true),
      shareText: () => (boot ? shareText(game, boot.gridNo, location.host) : ''),
    }
  })

  const left = boot ? remainingTiles(boot.puzzle, game, order) : []
  const lost = game.finished && !game.won

  return (
    <div className="page page-groups">
      <div className="bunting">
        {Array.from({ length: 15 }, (_, i) => (
          <i key={i} style={{ borderTopColor: BUNTING_COLS[i % BUNTING_COLS.length] }} />
        ))}
      </div>

      <header>
        <Link className="back" to="/" aria-label="All games">
          {t(lang, 'an_games_link')}
        </Link>
        <button className="help" id="helpBtn" aria-label="How to play" onClick={() => setHowtoOpen(true)}>
          ?
        </button>
        <div className="kicker">{t(lang, 'an_kicker')}</div>
        <div className="wordmark disp">
          <span className="emblem" aria-hidden="true">🧩</span>
          GROUPS
        </div>
        <div className="sub">{t(lang, 'gr_sub')}</div>
        <div className="scoreboard">
          <span className="live" />
          <span id="gridLabel" suppressHydrationWarning>
            {boot ? t(lang, 'gr_grid_label', { n: boot.gridNo }) : '…'}
          </span>
        </div>
      </header>

      <div className="card">
        <div className="markings" />
        <div className="pad">
          {/* solved groups, in solve order */}
          <div id="solved">
            {boot &&
              game.found.map((gi) => {
                const g = boot.puzzle.groups[gi]
                return (
                  <div key={gi} className={'banner t' + g.tier}>
                    <div className="bt">{g.title}</div>
                    <div className="bn">{g.nations.join(' · ')}</div>
                  </div>
                )
              })}
            {/* full time: reveal what was missed */}
            {boot &&
              lost &&
              unsolvedGroups(boot.puzzle, game).map((gi) => {
                const g = boot.puzzle.groups[gi]
                return (
                  <div key={gi} className={'banner missed t' + g.tier}>
                    <div className="bt">{g.title}</div>
                    <div className="bn">{g.nations.join(' · ')}</div>
                  </div>
                )
              })}
          </div>

          {!game.finished && (
            <div className="board" id="board">
              {left.map((name) => (
                <button
                  key={name}
                  className={
                    'tile' +
                    (sel.includes(name) ? ' sel' : '') +
                    (shaking && sel.includes(name) ? ' shake' : '')
                  }
                  data-nation={name}
                  onClick={() => toggleTile(name)}
                >
                  <img
                    src={'https://flagcdn.com/w40/' + CC[name] + '.png'}
                    srcSet={'https://flagcdn.com/w80/' + CC[name] + '.png 2x'}
                    alt=""
                    loading="lazy"
                  />
                  <span className="tn">{name}</span>
                </button>
              ))}
            </div>
          )}

          {!game.finished && (
            <>
              <div className="mist" id="mistakes">
                <span>{t(lang, 'gr_mistakes')}</span>
                {Array.from({ length: MAX_MISTAKES }, (_, i) => (
                  <i key={i} className={i < MAX_MISTAKES - game.mistakes ? '' : 'off'} />
                ))}
              </div>
              <div className="ctrls">
                <button className="cbtn" id="shuffleBtn" onClick={shuffle}>
                  {t(lang, 'gr_shuffle')}
                </button>
                <button
                  className="cbtn"
                  id="deselBtn"
                  onClick={() => setSel([])}
                  disabled={sel.length === 0}
                >
                  {t(lang, 'gr_deselect')}
                </button>
                <button
                  className="submit disp"
                  id="submitBtn"
                  onClick={submitGuess}
                  disabled={sel.length !== 4}
                >
                  {t(lang, 'gr_submit')}
                </button>
              </div>
            </>
          )}

          {game.finished && (
            <div className="end" id="endPanel">
              <div className="headline disp" id="endHeadline">
                {t(lang, game.won ? 'gr_win' : 'gr_lose')}
              </div>
              {game.won && streak > 0 && (
                <div className="streak" id="streakLine">
                  {t(lang, 'streak_n', { n: streak })}
                </div>
              )}
              <button className="sharebtn disp" id="shareBtn" onClick={share}>
                {t(lang, 'share_result')}
              </button>
              <div className="nextin" id="nextIn">
                {nextIn}
              </div>
            </div>
          )}
        </div>
      </div>

      <LangSwitch lang={lang} onChange={setLang} inline />

      <div className="foot">{t(lang, 'groups_tagline')}</div>

      <div
        className={'modal' + (howtoOpen ? ' show' : '')}
        id="howto"
        onClick={(e) => {
          if (e.target === e.currentTarget) hideHowto()
        }}
      >
        <div className="modal-card">
          <h3 className="disp">{t(lang, 'howto_title')}</h3>
          <div className="step">
            <span className="n">1</span>
            <span>{tb(lang, 'gr_howto_1')}</span>
          </div>
          <div className="step">
            <span className="n">2</span>
            <span>{tb(lang, 'gr_howto_2')}</span>
          </div>
          <div className="step">
            <span className="n">3</span>
            <span>{tb(lang, 'gr_howto_3')}</span>
          </div>
          <button className="go disp" id="howtoClose" onClick={hideHowto}>
            {t(lang, 'howto_close')}
          </button>
        </div>
      </div>

      <div className={'toast' + (toast.on ? ' show' : '')} id="toast">
        {toast.msg}
      </div>
    </div>
  )
}
