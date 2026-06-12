/* ANTHEM — daily World Cup anthem-guessing game, ported from
   games/anthem/index.html (the behavioral reference; keep parity with it).

   Division of labour:
   - React state: game state, mode, picker, modal, toast, end panel.
   - Imperative refs (NOT React state): PlaybackController (rAF playhead +
     Web Audio), TrackView (ball geometry — re-rendering mid-roll used to
     cancel the animation), Confetti (canvas particles).
   - DOM nodes the engines write to (clipLabel text, playhead/playBtn classes,
     srcBadge, fill/ballpos styles) are rendered by React with constant
     props/children, so reconciliation never overwrites the engines' writes.

   Daily-puzzle computation + localStorage run client-side only (mount effect):
   SSR renders the fresh-game shell, so server and client markup always agree. */
import { Link, createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AUDIO_BASE,
  PUZZLES,
  STAGES,
} from '../lib/anthem/puzzles'
import type { Puzzle } from '../lib/anthem/puzzles'
import {
  DAILY_ORDER,
  LAUNCH_DAY,
  POOL,
  dailyPuzzleIndex,
  dayNumber,
  randomPracticeIndex,
  utcDay,
} from '../lib/anthem/daily'
import { fold, isKnownNation, isSelectedName, rankMatches } from '../lib/anthem/text'
import type { NationEntry } from '../lib/anthem/text'
import {
  applyGuess,
  applySkip,
  freshState,
  freshStats,
  gridString,
  shareText,
  statsShareText,
  updateStats,
  updateStreak,
  winPct,
} from '../lib/anthem/game'
import type { GameState, Mode, Stats } from '../lib/anthem/game'
import {
  bumpPracticePlays,
  hasSeenHowto,
  loadArchive,
  loadSavedDaily,
  loadStats,
  loadStreak,
  markHowtoSeen,
  practicePlaysToday,
  saveArchiveResult,
  saveDaily,
  saveStats,
  saveStreak,
} from '../lib/anthem/storage'
import { LOCAL_AUDIO } from '../lib/anthem/audio-local'
import { START_OFFSETS } from '../lib/anthem/offsets'
import { track, trackPageView } from '../lib/analytics'
import { t, tb, useLang } from '../lib/i18n'
import type { Lang } from '../lib/i18n'
import { LangSwitch } from '../components/LangSwitch'
import {
  drawShareCard,
  drawStatsCard,
  gameToCardOpts,
  renderShareCard,
  renderStatsCard,
} from '../lib/anthem/sharecard'
import type { StatsCardOpts } from '../lib/anthem/sharecard'
import {
  missThunk,
  scheduleMelody,
  sfxGoal,
  sfxKick,
  sfxWhistle,
} from '../lib/anthem/engine/synth'
import { PlaybackController } from '../lib/anthem/engine/playback'
import type { AudioSource } from '../lib/anthem/engine/playback'
import { TrackView } from '../lib/anthem/engine/track'
import { Confetti } from '../lib/anthem/engine/confetti'
import '../styles/anthem.css'

/* absolute origin for og:image (crawlers reject relative URLs) — set
   VITE_SITE_ORIGIN at build time once the production domain exists */
const ORIGIN = (import.meta.env.VITE_SITE_ORIGIN as string | undefined) || ''

export const Route = createFileRoute('/anthem')({
  head: () => ({
    meta: [
      { title: 'ANTHEM ⚽ Guess the nation from its anthem' },
      {
        name: 'description',
        content:
          'Hear a snippet of a national anthem and guess the nation in six tries. A new anthem every day at midnight UTC.',
      },
      { property: 'og:title', content: 'ANTHEM ⚽ Guess the nation from its anthem' },
      {
        property: 'og:description',
        content: 'One anthem a day, six guesses. Can you keep your streak?',
      },
      { property: 'og:type', content: 'website' },
      ...(ORIGIN
        ? [
            { property: 'og:url', content: ORIGIN + '/anthem' },
            { property: 'og:image', content: ORIGIN + '/og/anthem.png' },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:image', content: ORIGIN + '/og/anthem.png' },
          ]
        : []),
    ],
  }),
  component: AnthemPage,
})

const BUNTING_COLS = ['#ffd23f', '#ffffff', '#ff6b3d', '#1fd17a']

function hexA(h: string, a: number): string {
  const n = h.replace('#', '')
  const r = parseInt(n.substring(0, 2), 16)
  const g = parseInt(n.substring(2, 4), 16)
  const b = parseInt(n.substring(4, 6), 16)
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}

function AnthemPage() {
  /* ---------- React state ---------- */
  const [lang, setLang] = useLang()
  const [puzzleIndex, setPuzzleIndex] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>('daily')
  const [game, setGame] = useState<GameState>(freshState())
  const [inputValue, setInputValue] = useState('')
  const [suggOpen, setSuggOpen] = useState(false)
  const [hiOverride, setHiOverride] = useState<number | null>(null)
  const [toast, setToastState] = useState({ msg: '', on: false })
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [stats, setStats] = useState<Stats>(freshStats)
  const openStats = useCallback(() => {
    setStats(loadStats()) // re-read: another tab / a fresh finish may have written
    setStatsOpen(true)
  }, [])
  const [copied, setCopied] = useState('')
  const [nextIn, setNextIn] = useState('')
  const [flagBroken, setFlagBroken] = useState(false)
  const [globalLine, setGlobalLine] = useState('')
  const [globalTick, setGlobalTick] = useState(0) // bumped after our POST lands
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveDay, setArchiveDay] = useState<number | null>(null)
  const [archiveResults, setArchiveResults] = useState<Record<number, string>>({})

  const current: Puzzle | null = puzzleIndex === null ? null : PUZZLES[puzzleIndex]

  /* ---------- refs (latest values for engine hooks & timeouts) ---------- */
  const stateRef = useRef(game)
  const modeRef = useRef(mode)
  const puzzleIndexRef = useRef<number | null>(null)
  const rmRef = useRef(false)
  const endScrolledForRef = useRef<string | null>(null)
  const archiveDayRef = useRef<number | null>(null)
  /* day the current daily game was STARTED on — a game spanning UTC midnight
     keeps saving/scoring against its own day, not the new one */
  const dailyDayRef = useRef<number | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /* latest language for engine hooks / event-time callbacks */
  const langRef = useRef<Lang>('en')
  langRef.current = lang

  const playBtnRef = useRef<HTMLButtonElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const clipLabelRef = useRef<HTMLSpanElement>(null)
  const srcBadgeRef = useRef<HTMLSpanElement>(null)
  const trackElRef = useRef<HTMLDivElement>(null)
  const ballposRef = useRef<HTMLDivElement>(null)
  const ballRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const guessrowRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggBoxRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const goalflashRef = useRef<HTMLDivElement>(null)

  const pbRef = useRef<PlaybackController | null>(null)
  const confettiRef = useRef<Confetti | null>(null)
  const trackViewRef = useRef<TrackView | null>(null)
  if (!trackViewRef.current) {
    trackViewRef.current = new TrackView(
      () => ({
        track: trackElRef.current,
        ballpos: ballposRef.current,
        ball: ballRef.current,
        fill: fillRef.current,
      }),
      () => rmRef.current,
    )
  }
  const trackView = trackViewRef.current

  const commit = useCallback((s: GameState) => {
    stateRef.current = s
    setGame(s)
  }, [])

  const clipIdleLabel = useCallback((): string => {
    const s = stateRef.current
    const secs = STAGES[Math.min(s.attempt, 5)]
    const L = langRef.current
    return s.finished
      ? s.won
        ? t(L, 'clip_solved')
        : t(L, 'clip_out')
      : secs === 1
        ? t(L, 'clip_unlocked_1')
        : t(L, 'clip_unlocked_n', { n: secs })
  }, [])

  /* ---------- core actions (mirroring the original WIRE UP section) ---------- */

  const setToast = useCallback((msg: string) => {
    setToastState({ msg, on: true })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastState((t) => ({ ...t, on: false })), 1400)
  }, [])

  const dailyDay = useCallback(() => dailyDayRef.current ?? dayNumber(), [])

  const persistDaily = useCallback((s: GameState) => {
    if (modeRef.current !== 'daily') return
    saveDaily(dailyDayRef.current ?? dayNumber(), s)
  }, [])

  const loadPuzzleImpl = useCallback(
    (idx: number, m: Mode) => {
      idx = ((idx % PUZZLES.length) + PUZZLES.length) % PUZZLES.length
      const p = PUZZLES[idx]
      puzzleIndexRef.current = idx
      modeRef.current = m
      setPuzzleIndex(idx)
      setMode(m)
      setFlagBroken(false)
      setCopied('')
      commit(freshState())
      setInputValue('')
      if (inputRef.current) inputRef.current.value = ''
      setSuggOpen(false)
      setHiOverride(null)
      /* audio resolution order: self-hosted trimmed copy (offset baked in) →
         archive.org original (measured offset) → synth fallback */
      const sources: AudioSource[] = []
      const local = LOCAL_AUDIO[p.name]
      if (local) sources.push({ url: '/audio/' + local.file, startOffset: 0 })
      if (p.audio)
        sources.push({
          url: AUDIO_BASE + encodeURI(p.audio),
          startOffset: START_OFFSETS[p.name] || 0,
        })
      pbRef.current?.setTrack(sources, scheduleMelody(p.melody || []))
      trackView.setStatic(0)
    },
    [commit, trackView],
  )

  const startArchive = useCallback(
    (day: number) => {
      archiveDayRef.current = day
      setArchiveDay(day)
      setArchiveOpen(false)
      loadPuzzleImpl(DAILY_ORDER[day % DAILY_ORDER.length], 'archive')
    },
    [loadPuzzleImpl],
  )

  const startDaily = useCallback(() => {
    archiveDayRef.current = null
    setArchiveDay(null)
    dailyDayRef.current = dayNumber()
    loadPuzzleImpl(dailyPuzzleIndex(), 'daily')
    const saved = loadSavedDaily(dailyDayRef.current)
    if (saved) {
      commit(saved)
      trackView.setStatic(Math.min(saved.attempt, 5))
    }
  }, [commit, loadPuzzleImpl, trackView])

  const PRACTICE_CAP = 2 // per UTC day — scarcity is the engine of the format
  const startPractice = useCallback(() => {
    if (practicePlaysToday(dayNumber()) >= PRACTICE_CAP) {
      setToast(t(langRef.current, 'toast_practice_cap'))
      return
    }
    bumpPracticePlays(dayNumber())
    track('practice_started')
    loadPuzzleImpl(randomPracticeIndex(puzzleIndexRef.current ?? -1), 'practice')
  }, [loadPuzzleImpl, setToast])

  const playClip = useCallback(() => {
    pbRef.current?.toggle()
  }, [])

  const missFeedback = useCallback(() => {
    const gr = guessrowRef.current
    if (gr) {
      gr.classList.remove('shake')
      void gr.offsetWidth
      gr.classList.add('shake')
    }
    if (!rmRef.current) missThunk()
  }, [])

  const endGame = useCallback(
    (s: GameState): GameState => {
      let ns = s
      track('game_finished', {
        mode: modeRef.current,
        tries: ns.won ? String(ns.attempt) : 'X',
      })
      if (modeRef.current === 'archive' && archiveDayRef.current !== null) {
        const tries = ns.won ? String(ns.attempt) : 'X'
        saveArchiveResult(archiveDayRef.current, tries)
        setArchiveResults((r) => ({ ...r, [archiveDayRef.current!]: tries }))
      }
      if (modeRef.current === 'daily') {
        // practice and archive games never touch the streak or the lifetime stats
        // (day captured at game start: a finish just past UTC midnight credits
        // the day actually played, so tomorrow's game still extends the streak)
        const day = dailyDayRef.current ?? dayNumber()
        const streak = updateStreak(loadStreak(), LAUNCH_DAY + day, ns.won)
        saveStreak(streak)
        saveStats(updateStats(loadStats(), ns.won, ns.attempt, streak.count || 0))
        ns = { ...ns, streak: streak.count }
        /* anonymous global counter — only on a live daily finish, never a
           restore. Fire-and-forget: the game must work without the backend. */
        fetch('/api/anthem-stats', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            day,
            tries: ns.won ? String(ns.attempt) : 'X',
          }),
          keepalive: true,
        })
          .then(() => setGlobalTick((t) => t + 1)) // refetch including ourselves
          .catch(() => {})
      }
      if (ns.won) {
        confettiRef.current?.launch()
        if (!rmRef.current) {
          sfxGoal()
          /* gold flash behind the confetti — transient, engine-style DOM */
          const fl = goalflashRef.current
          if (fl) {
            fl.classList.remove('on')
            void fl.offsetWidth
            fl.classList.add('on')
            setTimeout(() => fl.classList.remove('on'), 750)
          }
        }
      } else if (!rmRef.current) sfxWhistle() // full time
      /* reveal: play the whole anthem (win or lose). Only here — i.e. in the same
         user-gesture chain as the final guess — so autoplay is allowed; a restored
         finished game won't autoplay. */
      pbRef.current?.stop()
      setTimeout(() => {
        const pb = pbRef.current
        if (stateRef.current.finished && pb && !pb.playing && !pb.paused) pb.toggle()
      }, 900)
      return ns
    },
    [],
  )

  const submitGuess = useCallback(() => {
    const s = stateRef.current
    const p = puzzleIndexRef.current === null ? null : PUZZLES[puzzleIndexRef.current]
    if (s.finished || !p) return
    setSuggOpen(false)
    setHiOverride(null)
    const inp = inputRef.current
    const val = inp ? inp.value : ''
    if (!val.trim()) {
      setToast(t(langRef.current, 'toast_type_first'))
      return
    }
    if (!isKnownNation(val)) {
      setToast(t(langRef.current, 'toast_pick_list'))
      missFeedback()
      return
    }
    if (inp) inp.value = ''
    setInputValue('')
    if (!rmRef.current) sfxKick() // the shot is away
    let ns = applyGuess(s, p, val)
    if (ns.won) {
      ns = endGame(ns)
    } else {
      missFeedback()
      if (ns.finished) {
        ns = endGame(ns)
      } else {
        pbRef.current?.stop()
        trackView.animateBall(Math.min(ns.attempt, 5))
        stateRef.current = ns // playClip reads the new stage for the clip limit
        playClip()
      }
    }
    commit(ns)
    persistDaily(ns)
  }, [commit, endGame, missFeedback, persistDaily, playClip, setToast, trackView])

  const skip = useCallback(() => {
    const s = stateRef.current
    if (s.finished || puzzleIndexRef.current === null) return
    let ns = applySkip(s)
    if (ns.finished) {
      ns = endGame(ns)
    } else {
      pbRef.current?.stop()
      trackView.animateBall(Math.min(ns.attempt, 5))
      stateRef.current = ns
      playClip()
    }
    commit(ns)
    persistDaily(ns)
  }, [commit, endGame, persistDaily, playClip, trackView])

  const hideHowto = useCallback(() => {
    setHowtoOpen(false)
    markHowtoSeen()
  }, [])

  const currentMatchNo = useCallback((): number => {
    return modeRef.current === 'archive' && archiveDayRef.current !== null
      ? archiveDayRef.current + 1
      : dailyDay() + 1
  }, [dailyDay])

  const makeShareCard = useCallback(async (): Promise<Blob | null> => {
    const s = stateRef.current
    return renderShareCard(
      gameToCardOpts(s, modeRef.current, currentMatchNo(), location.host),
    )
  }, [currentMatchNo])

  const share = useCallback(async () => {
    const s = stateRef.current
    track('share_clicked', { mode: modeRef.current })
    /* ?ref=share closes the measurement loop: page_view{ref=share} over
       share_clicked is the viral coefficient */
    const txt =
      shareText(s, modeRef.current, currentMatchNo(), langRef.current) +
      '\n' +
      location.origin +
      '/anthem?ref=share'
    const done = () => setCopied(t(langRef.current, 'toast_copied'))
    /* best path: share sheet with the rendered card attached (iOS 15+, Android) */
    if (navigator.share) {
      let files: File[] | undefined
      try {
        const blob = await makeShareCard()
        if (blob) {
          const f = new File(
            [blob],
            'anthem-' + (modeRef.current === 'daily' ? 'match-' + currentMatchNo() : 'practice') + '.png',
            { type: 'image/png' },
          )
          if (navigator.canShare && navigator.canShare({ files: [f] })) files = [f]
        }
      } catch {
        /* card render failed — share text only */
      }
      navigator.share(files ? { files, text: txt } : { text: txt }).catch(() => {})
      return
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(txt)
        .then(done)
        .catch(() => {
          fallbackCopy(txt)
          done()
        })
    } else {
      fallbackCopy(txt)
      done()
    }
  }, [currentMatchNo, makeShareCard])

  const statsCardOpts = useCallback((): StatsCardOpts => {
    const st = loadStats()
    return {
      played: st.played,
      winPct: winPct(st),
      streak: loadStreak().count || 0,
      maxStreak: st.maxStreak,
      dist: st.dist,
      host: location.host,
    }
  }, [])

  const shareStats = useCallback(async () => {
    track('share_clicked', { mode: 'stats' })
    const st = loadStats()
    const txt =
      statsShareText(st, loadStreak().count || 0, langRef.current) +
      '\n' +
      location.origin +
      '/anthem?ref=share'
    if (navigator.share) {
      let files: File[] | undefined
      try {
        const blob = await renderStatsCard(statsCardOpts())
        if (blob) {
          const f = new File([blob], 'anthem-record.png', { type: 'image/png' })
          if (navigator.canShare && navigator.canShare({ files: [f] })) files = [f]
        }
      } catch {
        /* card render failed — share text only */
      }
      navigator.share(files ? { files, text: txt } : { text: txt }).catch(() => {})
      return
    }
    const done = () => setToast(t(langRef.current, 'toast_copied'))
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(txt)
        .then(done)
        .catch(() => {
          fallbackCopy(txt)
          done()
        })
    } else {
      fallbackCopy(txt)
      done()
    }
  }, [setToast, statsCardOpts])

  /* ---------- mount: engines, daily boot, listeners ---------- */
  useEffect(() => {
    rmRef.current =
      !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pbRef.current = new PlaybackController({
      els: () => ({
        playBtn: playBtnRef.current,
        playhead: playheadRef.current,
        clipLabel: clipLabelRef.current,
        srcBadge: srcBadgeRef.current,
      }),
      getStage: () => Math.min(stateRef.current.attempt, 5),
      isFinished: () => stateRef.current.finished,
      clipIdleLabel,
      geomX: (f) => trackView.geomX(f),
    })
    if (confettiCanvasRef.current)
      confettiRef.current = new Confetti(confettiCanvasRef.current, () => rmRef.current)

    const onResize = () => {
      confettiRef.current?.size()
      if (puzzleIndexRef.current !== null && !stateRef.current.finished)
        trackView.setStatic(Math.min(stateRef.current.attempt, 5))
    }
    window.addEventListener('resize', onResize)

    startDaily()
    setArchiveResults(loadArchive())
    if (!hasSeenHowto()) setHowtoOpen(true)
    trackPageView('/anthem')

    return () => {
      window.removeEventListener('resize', onResize)
      pbRef.current?.destroy()
      confettiRef.current?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Escape closes whichever modal is open */
  useEffect(() => {
    if (!(howtoOpen || statsOpen || archiveOpen)) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (howtoOpen) hideHowto()
      setStatsOpen(false)
      setArchiveOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [howtoOpen, statsOpen, archiveOpen, hideHowto])

  /* close the picker when tapping/clicking outside it */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setSuggOpen(false)
        setHiOverride(null)
      }
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  /* idle clip label is engine-owned DOM text; refresh it when state changes */
  useEffect(() => {
    const pb = pbRef.current
    const el = clipLabelRef.current
    if (el && (!pb || (!pb.playing && !pb.paused))) el.textContent = clipIdleLabel()
  }, [game, puzzleIndex, clipIdleLabel])

  /* countdown to the next daily anthem (next UTC midnight) */
  useEffect(() => {
    if (!(game.finished && mode === 'daily')) {
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
      setNextIn(t(lang, 'next_anthem_in', { t: h + ':' + m + ':' + s }))
    }
    tick()
    const tmr = setInterval(tick, 1000)
    return () => clearInterval(tmr)
  }, [game.finished, mode, lang])

  /* global "X% solved it" line for the end screen (daily only; silent when the
     backend is missing or empty) */
  useEffect(() => {
    if (!(game.finished && mode === 'daily')) {
      setGlobalLine('')
      return
    }
    let dead = false
    ;(async () => {
      try {
        const res = await fetch('/api/anthem-stats?day=' + dailyDay())
        if (!res.ok) return
        const d: { total: number; dist: Record<string, number> } = await res.json()
        if (dead || !d.total) return
        const pct = (n: number) => Math.round((n / d.total) * 100)
        const solved = d.total - (d.dist.X || 0)
        let line = t(lang, 'global_solved', { p: pct(solved) })
        const s = stateRef.current
        if (s.won && s.attempt > 1) {
          let leN = 0
          for (let i = 1; i <= s.attempt; i++) leN += d.dist[String(i)] || 0
          line += t(lang, 'global_in_n', { p: pct(leN), n: s.attempt })
        }
        setGlobalLine(line)
      } catch {
        /* offline / no backend — just don't show the line */
      }
    })()
    return () => {
      dead = true
    }
  }, [game.finished, mode, globalTick, lang])

  /* make sure the result is actually on screen (player may be scrolled deep into
     hints/rows) — once per game only, so it never fights the user's own scrolling */
  useEffect(() => {
    if (!game.finished || puzzleIndex === null) return
    const key = mode + puzzleIndex
    if (endScrolledForRef.current === key) return
    endScrolledForRef.current = key
    const end = document.getElementById('end')
    if (!end) return
    const eb = end.getBoundingClientRect()
    if (eb.top < 0 || eb.top > innerHeight * 0.5)
      cardRef.current?.scrollIntoView({
        behavior: rmRef.current ? 'auto' : 'smooth',
        block: 'start',
      })
  }, [game.finished, mode, puzzleIndex])

  /* ---------- picker derived view ---------- */
  const guessed = useMemo(
    () =>
      new Set(
        game.results.filter((r) => r && r.type === 'wrong').map((r) => fold(r.label)),
      ),
    [game.results],
  )
  /* a completed selection must not filter: show the full list again so the user
     can browse/re-pick without deleting the previous country first.
     Only display names count — an alias like "holland" is still a search, not a selection. */
  const exactSelected = isSelectedName(inputValue)
  const view = useMemo(
    () =>
      rankMatches(exactSelected ? '' : inputValue).map((n) => ({
        n,
        used: guessed.has(fold(n.name)),
      })),
    [exactSelected, inputValue, guessed],
  )
  const defaultHi = useMemo(() => {
    let hi = exactSelected
      ? view.findIndex((v) => fold(v.n.name) === fold(inputValue) && !v.used)
      : -1 // highlight the current selection…
    if (hi < 0) hi = view.findIndex((v) => !v.used) // …else the best selectable match
    return hi
  }, [exactSelected, inputValue, view])
  const hiIdx = hiOverride !== null && hiOverride < view.length ? hiOverride : defaultHi

  useEffect(() => {
    if (!suggOpen || hiIdx < 0) return
    suggBoxRef.current?.children[hiIdx]?.scrollIntoView({ block: 'nearest' })
  }, [suggOpen, hiIdx])

  const openSugg = useCallback(() => {
    setSuggOpen(true)
    setHiOverride(null)
  }, [])

  const pickNation = useCallback((n: NationEntry) => {
    const inp = inputRef.current
    if (inp) inp.value = n.name
    setInputValue(n.name)
    inp?.focus() // focus before close: the focus event reopens the list, so close must come last
    setSuggOpen(false)
    setHiOverride(null)
  }, [])

  const moveHi = useCallback(
    (dir: number) => {
      if (!view.length) return
      let i = hiIdx
      for (let step = 0; step < view.length; step++) {
        i = (i + dir + view.length) % view.length
        if (!view[i].used) {
          setHiOverride(i)
          return
        }
      }
    },
    [view, hiIdx],
  )

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const open = suggOpen
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (!open) openSugg()
        else moveHi(e.key === 'ArrowDown' ? 1 : -1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const val = inputRef.current?.value ?? ''
        if (open && hiIdx >= 0 && view[hiIdx] && !isKnownNation(val))
          pickNation(view[hiIdx].n) // fill first…
        else {
          setSuggOpen(false)
          setHiOverride(null)
          submitGuess() // …then SHOOT
        }
      } else if (e.key === 'Escape') {
        setSuggOpen(false)
        setHiOverride(null)
      }
    },
    [suggOpen, hiIdx, view, moveHi, openSugg, pickNation, submitGuess],
  )

  /* ---------- test hook (parity with the original's global functions; the
       headless suites in tests/ drive the game through this) ---------- */
  useEffect(() => {
    ;(window as any).__anthem = {
      get state() {
        return stateRef.current
      },
      get mode() {
        return modeRef.current
      },
      get current() {
        return puzzleIndexRef.current === null ? null : PUZZLES[puzzleIndexRef.current]
      },
      get pb() {
        return pbRef.current
      },
      get confetti() {
        return confettiRef.current
      },
      get RM() {
        return rmRef.current
      },
      PUZZLES,
      POOL,
      DAILY_ORDER,
      get dailyIndex() {
        return dailyPuzzleIndex()
      },
      startDaily,
      startPractice,
      loadPuzzle: (idx: number) => loadPuzzleImpl(idx, modeRef.current),
      setMode: (m: Mode) => {
        modeRef.current = m
        setMode(m)
      },
      submitGuess,
      skip,
      playClip,
      stopPlayback: () => pbRef.current?.stop(),
      hideHowto,
      showHowto: () => setHowtoOpen(true),
      startArchive,
      makeShareCard,
      // suite 7 draws onto a live canvas instead of decoding the PNG blob —
      // image decode stalls under headless virtual time
      drawShareCardTo: (canvas: HTMLCanvasElement) =>
        drawShareCard(
          canvas,
          gameToCardOpts(stateRef.current, modeRef.current, currentMatchNo(), location.host),
        ),
      drawStatsCardTo: (canvas: HTMLCanvasElement) => drawStatsCard(canvas, statsCardOpts()),
      shareStats,
    }
  })

  /* ---------- derived render bits ---------- */
  const matchLabel =
    puzzleIndex === null
      ? t(lang, 'match_label', { n: '…' })
      : mode === 'daily'
        ? t(lang, 'match_label', { n: dailyDay() + 1 })
        : mode === 'archive'
          ? '📅 ' + t(lang, 'match_label', { n: (archiveDay ?? 0) + 1 })
          : t(lang, 'practice_label')
  const hintsToShow =
    current && !game.finished
      ? Array.from(
          { length: Math.min(game.attempt, current.hints.length) },
          (_, i) => current.hints[i],
        ).reverse() // newest first: fresh hints appear right under the input
      : []
  const endBg =
    current && game.finished
      ? 'radial-gradient(130% 90% at 50% 0%, ' +
        hexA(current.colors[0], 0.34) +
        ', ' +
        hexA(current.colors[1] || current.colors[0], 0.14) +
        ' 46%, transparent 72%)'
      : undefined
  const tries = game.won ? game.attempt : 'X'

  return (
    <div className="page page-anthem">
      <canvas id="confetti" ref={confettiCanvasRef} />
      <div id="goalflash" ref={goalflashRef} aria-hidden="true" />
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
        <button className="statsbtn" id="statsBtn" aria-label="Your stats" onClick={openStats}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M5 12h3v8H5zM10.5 4h3v16h-3zM16 9h3v11h-3z" />
          </svg>
        </button>
        <div className="kicker">{t(lang, 'an_kicker')}</div>
        <div className="wordmark disp">
          <span className="emblem" aria-hidden="true">🎺</span>
          ANTHEM
        </div>
        <div className="sub">{t(lang, 'an_sub')}</div>
        <div className="scoreboard">
          <span className="live" />
          <span id="matchLabel">{matchLabel}</span>
        </div>
      </header>

      <div className="card" ref={cardRef}>
        <div className="deco">
          <div className="markings" />
          <div className="cl" />
          <div className="cc" />
        </div>
        <div className="pad">
          <div className="player">
            <button className="play" id="playBtn" ref={playBtnRef} aria-label="Play anthem clip" onClick={playClip}>
              <span className="ico">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="ico-pause">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                </svg>
              </span>
              <span className="spinner" aria-hidden="true" />
            </button>
            <div className="pcol">
              <div className="track" id="track" ref={trackElRef}>
                <div className="stripes" />
                <div className="fill" id="fill" ref={fillRef} />
                <div className="goalL" />
                <div className="goalR" />
                <div className="playhead" id="playhead" ref={playheadRef} />
                <div className="ballpos" id="ballpos" ref={ballposRef}>
                  <div className="ball" id="ball" ref={ballRef}>
                    ⚽
                  </div>
                </div>
              </div>
              <div className="labelrow">
                <span id="clipLabel" ref={clipLabelRef} suppressHydrationWarning>
                  1 second unlocked
                </span>
                <span id="srcBadge" ref={srcBadgeRef} />
              </div>
            </div>
          </div>

          <div
            className="guessrow"
            id="guessrow"
            ref={guessrowRef}
            style={{ display: game.finished ? 'none' : 'flex' }}
          >
            <div className="picker" id="picker" ref={pickerRef}>
              {/* type=search + no address-words in placeholder: keeps iOS from
                  offering Contact/address AutoFill on this field */}
              <input
                type="search"
                id="guessInput"
                ref={inputRef}
                placeholder={t(lang, 'guess_placeholder')}
                enterKeyHint="go"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                role="combobox"
                aria-label="Guess the nation"
                aria-expanded={suggOpen}
                aria-controls="suggList"
                aria-autocomplete="list"
                onChange={(e) => {
                  setInputValue(e.target.value)
                  openSugg()
                }}
                onFocus={() => {
                  const inp = inputRef.current
                  if (inp && isSelectedName(inp.value)) inp.select() // typing replaces the previous selection
                  openSugg()
                }}
                onKeyDown={onInputKeyDown}
              />
              <button
                className={'clearbtn' + (inputValue && !game.finished ? ' show' : '')}
                id="clearBtn"
                aria-label="Clear"
                tabIndex={-1}
                onPointerDown={(e) => e.preventDefault()} // keep input focus
                onClick={() => {
                  const inp = inputRef.current
                  if (inp) inp.value = ''
                  setInputValue('')
                  inp?.focus()
                  openSugg()
                }}
              >
                ✕
              </button>
              <div
                className={'sugg' + (suggOpen ? ' open' : '')}
                id="suggList"
                role="listbox"
                ref={suggBoxRef}
              >
                {view.length ? (
                  view.map((v, i) => (
                    <div
                      key={v.n.name}
                      className={'srow' + (v.used ? ' used' : '') + (i === hiIdx ? ' hi' : '')}
                      role="option"
                      aria-selected={i === hiIdx}
                      /* select on click, not pointerdown: a touch that becomes a
                         scroll never fires click, so the list stays scrollable on
                         mobile. pointerdown only keeps the input focused. */
                      onPointerDown={v.used ? undefined : (e) => e.preventDefault()}
                      onClick={v.used ? undefined : () => pickNation(v.n)}
                      onMouseEnter={v.used ? undefined : () => setHiOverride(i)}
                    >
                      <img
                        src={'https://flagcdn.com/w40/' + v.n.cc + '.png'}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget
                          img.style.display = 'none'
                          const em = img.nextElementSibling as HTMLElement | null
                          if (em) em.style.display = 'inline'
                        }}
                      />
                      <span className="se">{v.n.flag}</span>
                      <span className="sname">{v.n.name}</span>
                      {v.used && <span className="stag">{t(lang, 'tried_tag')}</span>}
                    </div>
                  ))
                ) : (
                  <div className="snone">{t(lang, 'no_match')}</div>
                )}
              </div>
            </div>
            <button className="shoot" id="guessBtn" onClick={submitGuess}>
              {t(lang, 'shoot')}
            </button>
          </div>
          <div
            className="subrow"
            id="subrow"
            style={{ display: game.finished ? 'none' : 'flex' }}
          >
            <button className="skip" id="skipBtn" onClick={skip}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M4 5v14l8-7zM13 5v14l8-7z" />
              </svg>
              {t(lang, 'skip')}
            </button>
            <span className="attempts" id="attempts">
              {game.finished ? '' : t(lang, 'guess_n_of_6', { n: game.attempt + 1 })}
            </span>
          </div>

          <div className="hints" id="hints">
            {hintsToShow.map((h) => (
              <div className="hint" key={h}>
                <span className="rc" />
                {h}
              </div>
            ))}
            {current && !game.finished && game.attempt === 0 && (
              <div className="hintlock">{t(lang, 'hint_lock')}</div>
            )}
          </div>
          <div className="rows" id="rows">
            {game.results
              .slice()
              .reverse() /* newest first, like the hints */
              .map((res, i) => (
                <div className={'grow ' + res.type} key={game.results.length - 1 - i}>
                  <span className="dot" />
                  <span className="gtext">{res.label}</span>
                  <span className="tag">
                    {res.type === 'correct'
                      ? t(lang, 'tag_goal')
                      : res.type === 'wrong'
                        ? t(lang, 'tag_miss')
                        : t(lang, 'tag_skip')}
                  </span>
                </div>
              ))}
          </div>

          <div
            className="end"
            id="end"
            style={{ display: game.finished ? 'block' : 'none', background: endBg }}
          >
            <div className={'bigresult disp' + (game.won ? '' : ' lose')} id="bigResult">
              {game.won ? t(lang, 'goal_excl') : t(lang, 'off_target')}
            </div>
            <div className="flagwrap">
              <img
                id="endFlagImg"
                alt=""
                src={current ? 'https://flagcdn.com/w320/' + current.cc + '.png' : undefined}
                style={{
                  display: flagBroken ? 'none' : 'block',
                  filter: current
                    ? 'drop-shadow(0 0 22px ' + hexA(current.colors[0], 0.6) + ')'
                    : undefined,
                }}
                onError={() => setFlagBroken(true)}
              />
              <span id="endFlagEmoji" style={{ display: flagBroken ? 'block' : 'none' }}>
                {current?.flag}
              </span>
            </div>
            <div className="ans disp" id="endAns">
              {current?.name}
            </div>
            <div className="verdict" id="endVerdict">
              {current?.verdict}
            </div>
            {current && (
              <a
                className="wikilink"
                id="anthemWiki"
                href={
                  'https://en.wikipedia.org/wiki/Special:Search?search=' +
                  encodeURIComponent(
                    (current.verdict.match(/[“"]([^”"]+)[”"]/) || [])[1] ||
                      current.name + ' national anthem',
                  )
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(lang, 'about_anthem')}
              </a>
            )}
            <div className="grid-share" id="gridShare">
              {gridString(game)}
            </div>
            {globalLine && (
              <div className="globalstats" id="globalStats">
                {globalLine}
              </div>
            )}
            <div className="streak" id="streakLine">
              <span>{game.won ? '🎺 ' + tries + '/6' : '😵 X/6'}</span>
              {mode === 'daily' ? (
                <span className="g">{t(lang, 'streak_n', { n: game.streak || 0 })}</span>
              ) : mode === 'archive' ? (
                <span className="g">{t(lang, 'archive_chip')}</span>
              ) : (
                <span className="g">{t(lang, 'practice_chip')}</span>
              )}
            </div>
            <div className="endbtns">
              <button className="share-btn" id="shareBtn" onClick={share}>
                {t(lang, 'share_result')}
              </button>
              <button className="stats-btn" id="endStatsBtn" onClick={openStats}>
                {t(lang, 'stats_btn')}
              </button>
              <button
                className="again-btn"
                id="againBtn"
                style={{ display: mode === 'practice' ? 'inline-block' : 'none' }}
                onClick={startPractice}
              >
                {t(lang, 'another_anthem')}
              </button>
            </div>
            <div className="nextin" id="nextIn">
              {nextIn}
            </div>
            <div className="copied" id="copied">
              {copied}
            </div>
          </div>
        </div>
      </div>

      <div className="preview">
        <button
          id="practiceBtn"
          onClick={() => (mode === 'daily' ? startPractice() : startDaily())}
        >
          {mode === 'daily' ? t(lang, 'practice_mode') : t(lang, 'back_to_today')}
        </button>
        {dayNumber() > 0 && mode === 'daily' && (
          <button id="archiveBtn" onClick={() => setArchiveOpen(true)}>
            {t(lang, 'prev_matches')}
          </button>
        )}
      </div>

      <div className="foot">
        {t(lang, 'an_foot')}
        <br />
        {t(lang, 'hub_foot1')}
      </div>

      <LangSwitch lang={lang} onChange={setLang} inline />

      <div className={'toast' + (toast.on ? ' show' : '')} id="toast">
        {toast.msg}
      </div>

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
            <span>{tb(lang, 'howto_1')}</span>
          </div>
          <div className="step">
            <span className="n">2</span>
            <span>{tb(lang, 'howto_2')}</span>
          </div>
          <div className="step">
            <span className="n">3</span>
            <span>{tb(lang, 'howto_3')}</span>
          </div>
          <button className="go disp" id="howtoClose" onClick={hideHowto}>
            {t(lang, 'howto_close')}
          </button>
        </div>
      </div>

      <div
        className={'modal' + (archiveOpen ? ' show' : '')}
        id="archiveModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setArchiveOpen(false)
        }}
      >
        {archiveOpen && (
          <div className="modal-card">
            <h3 className="disp">{t(lang, 'archive_title')}</h3>
            <div className="archlist">
              {Array.from({ length: dayNumber() }, (_, k) => dayNumber() - 1 - k).map((day) => {
                const d = new Date((LAUNCH_DAY + day) * 86400000)
                const label = d.toLocaleDateString(
                  lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-GB',
                  {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC',
                  },
                )
                const res = archiveResults[day]
                return (
                  <button key={day} className="archrow" onClick={() => startArchive(day)}>
                    <span className="archname disp">Match #{day + 1}</span>
                    <span className="archdate">{label}</span>
                    <span className={'archres' + (res ? (res === 'X' ? ' lost' : ' won') : '')}>
                      {res ? (res === 'X' ? '✗' : '✓ ' + res + '/6') : t(lang, 'archive_play')}
                    </span>
                  </button>
                )
              })}
            </div>
            <button className="go disp" onClick={() => setArchiveOpen(false)}>
              {t(lang, 'archive_close')}
            </button>
          </div>
        )}
      </div>

      <div
        className={'modal' + (statsOpen ? ' show' : '')}
        id="statsModal"
        onClick={(e) => {
          if (e.target === e.currentTarget) setStatsOpen(false)
        }}
      >
        {statsOpen && (
          <div className="modal-card">
            <h3 className="disp">{t(lang, 'stats_title')}</h3>
            <div className="statnums">
              <div className="statnum">
                <b>{stats.played}</b>
                <span>{t(lang, 'stats_played')}</span>
              </div>
              <div className="statnum">
                <b>{winPct(stats)}</b>
                <span>{t(lang, 'stats_winpct')}</span>
              </div>
              <div className="statnum">
                <b>{game.streak ?? loadStreakCount()}</b>
                <span>{t(lang, 'stats_streak')}</span>
              </div>
              <div className="statnum">
                <b>{stats.maxStreak}</b>
                <span>{t(lang, 'stats_best')}</span>
              </div>
            </div>
            <div className="distwrap">
              <div className="disttitle disp">{t(lang, 'stats_dist')}</div>
              {stats.dist.map((count, i) => {
                const max = Math.max(1, ...stats.dist)
                const today = game.finished && game.won && game.attempt === i + 1
                return (
                  <div className="distrow" key={i}>
                    <span className="distn disp">{i + 1}</span>
                    <div className="distbarwrap">
                      <div
                        className={'distbar' + (today ? ' today' : '')}
                        style={{ width: Math.max(8, (count / max) * 100) + '%' }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {stats.played > 0 && (
              <button className="go disp" id="statsShare" onClick={shareStats}>
                {t(lang, 'stats_share')}
              </button>
            )}
            <button
              className={'go disp' + (stats.played > 0 ? ' ghost' : '')}
              id="statsClose"
              onClick={() => setStatsOpen(false)}
            >
              {t(lang, 'back_to_match')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function loadStreakCount(): number {
  return loadStreak().count || 0
}

function fallbackCopy(t: string): void {
  const ta = document.createElement('textarea')
  ta.value = t
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch {
    /* clipboard unavailable */
  }
  document.body.removeChild(ta)
}
