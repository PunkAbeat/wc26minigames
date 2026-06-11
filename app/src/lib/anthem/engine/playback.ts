/* Unified playback controller: play / pause / resume, real-time rAF playhead,
   clip-limited during the game, full anthem once finished. Ported verbatim from
   games/anthem/index.html (PLAYBACK section) as an imperative class held in a
   React ref — playhead/label updates run per-frame and must bypass React.
   Real audio (<audio> streaming archive.org) with auto-fallback to the synth
   engine if a track errors or play() is blocked. */

import { STAGES } from '../puzzles'
import { audioNow, ensureCtx, richNote, stopAll } from './synth'
import type { MelodySchedule } from './synth'

const SVG_NOTE =
  '<svg class="si" viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M9 17.5a2.5 2.5 0 11-1.7-2.36V7l9-1.8v8.3A2.5 2.5 0 1115 13V8.2L9 9.4z"/></svg>'

export interface PlaybackEls {
  playBtn: HTMLElement | null
  playhead: HTMLElement | null
  clipLabel: HTMLElement | null
  srcBadge: HTMLElement | null
}

export interface PlaybackHooks {
  els: () => PlaybackEls
  getStage: () => number // Math.min(state.attempt, 5)
  isFinished: () => boolean
  clipIdleLabel: () => string
  geomX: (frac: number) => number
}

export function fmtT(s: number): string {
  if (!isFinite(s) || isNaN(s)) return '…'
  s = Math.max(0, s)
  if (s < 60) return Math.round(s) + 's'
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
}

function fracFor(stage: number): number {
  return (stage + 1) / 6
}

export interface AudioSource {
  url: string
  /* leading-silence skip (seconds) for this recording: clip playback starts
     here so a 1s clip is always audible; the full reveal plays from 0.
     Self-hosted files have it baked in (0); archive.org originals don't. */
  startOffset: number
}

interface CurrentTrack {
  sources: AudioSource[]
  idx: number // active source; bumped on error until exhausted
  sched: MelodySchedule
  audioOk: boolean
}

export class PlaybackController {
  src: 'real' | 'synth' | null = null
  playing = false
  paused = false
  offset = 0
  limit = 0
  full = false
  private t0 = 0
  private raf = 0
  private wantPlay = false
  private audioEl: HTMLAudioElement
  private current: CurrentTrack | null = null

  constructor(private hooks: PlaybackHooks) {
    this.audioEl = new Audio()
    this.audioEl.preload = 'auto'
    this.audioEl.addEventListener('error', () => this.failCurrentSource())
    this.audioEl.addEventListener('ended', () => this.stop())
    this.audioEl.addEventListener('waiting', () => {
      if (this.wantPlay) this.setLoading(true)
    })
    this.audioEl.addEventListener('playing', () => this.setLoading(false))
    this.audioEl.addEventListener('canplay', () => this.setLoading(false))
  }

  /* loadPuzzle's audio half: point at the new track, reset state */
  setTrack(sources: AudioSource[], sched: MelodySchedule): void {
    this.stop()
    this.current = { sources, idx: 0, sched, audioOk: sources.length > 0 }
    if (this.current.audioOk) {
      this.loadActiveSource()
      this.setSource('real')
    } else {
      this.setSource('synth')
    }
  }

  private loadActiveSource(): void {
    if (!this.current) return
    this.audioEl.src = this.current.sources[this.current.idx].url
    try {
      this.audioEl.load()
    } catch {
      /* some browsers throw on load() mid-stream */
    }
  }

  /* active source is broken (404, decode error, blocked play()): advance to
     the next one — self-hosted → archive.org → synth */
  private failCurrentSource(): void {
    const c = this.current
    if (!c || !c.audioOk) return
    if (c.idx < c.sources.length - 1) {
      c.idx++
      this.loadActiveSource()
      if (this.wantPlay && this.src === 'real') this.startReal()
      return
    }
    c.audioOk = false
    this.setSource('synth')
    this.setLoading(false)
    if (this.wantPlay && this.src === 'real') this.startSynth(0)
  }

  private setSource(kind: 'real' | 'synth'): void {
    const el = this.hooks.els().srcBadge
    if (!el) return
    // players don't need a badge for the normal case
    el.innerHTML = kind === 'synth' ? SVG_NOTE + 'Synth fallback' : ''
  }
  private setPlaying(on: boolean): void {
    this.hooks.els().playBtn?.classList.toggle('playing', on)
  }
  private setLoading(on: boolean): void {
    this.hooks.els().playBtn?.classList.toggle('loading', on)
  }

  private realStart(): number {
    if (this.full || !this.current?.audioOk) return 0
    return this.current.sources[this.current.idx]?.startOffset || 0
  }
  private elapsed(): number {
    if (this.src === 'real')
      return Math.max(0, (this.audioEl.currentTime || 0) - this.realStart())
    return Math.max(0, this.offset + (this.playing ? audioNow() - this.t0 : 0))
  }
  private limitNow(): number {
    return this.full
      ? this.src === 'real'
        ? this.audioEl.duration || Infinity
        : this.current?.sched.total || 0
      : this.limit
  }

  /* one paint of playhead + label. Called every frame by tick, and once
     synchronously on each state change — the label must never wait for the
     next animation frame (rAF can stall while paused, e.g. headless/hidden) */
  private paint(): void {
    const el = this.elapsed()
    const lim = this.limitNow()
    const { playhead, clipLabel } = this.hooks.els()
    const x0 = this.hooks.geomX(0)
    const xEnd = this.hooks.geomX(this.full ? 1 : fracFor(this.hooks.getStage()))
    const frac = isFinite(lim) && lim > 0 ? Math.min(1, Math.max(0, el / lim)) : 0
    if (playhead) playhead.style.left = x0 + (xEnd - x0) * frac + 'px'
    if (clipLabel)
      clipLabel.textContent = (this.playing ? '▶ ' : '⏸ ') + fmtT(el) + ' / ' + fmtT(lim)
  }

  private tick = (): void => {
    if (!this.playing && !this.paused) return
    this.paint()
    if (this.playing && this.elapsed() >= this.limitNow() - 0.03) {
      this.stop()
      return
    }
    this.raf = requestAnimationFrame(this.tick)
  }

  start(): void {
    this.stop()
    this.full = this.hooks.isFinished() // game over → reveal the whole anthem
    this.limit = this.full ? Infinity : STAGES[this.hooks.getStage()]
    this.hooks.els().playhead?.classList.add('show')
    if (this.current?.audioOk) this.startReal()
    else this.startSynth(0)
  }

  private startReal(): void {
    this.src = 'real'
    this.wantPlay = true
    this.setLoading(true)
    this.setSource('real')
    try {
      this.audioEl.currentTime = this.realStart()
    } catch {
      /* not seekable yet — plays from 0, same as pre-offset behaviour */
    }
    this.playing = true
    this.paused = false
    this.setPlaying(true)
    const pr = this.audioEl.play()
    if (pr && pr.catch)
      pr.catch(() => {
        if (!this.wantPlay) return
        this.failCurrentSource()
      })
    this.paint()
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(this.tick)
  }

  private startSynth(offset: number): void {
    this.src = 'synth'
    ensureCtx()
    stopAll()
    this.setLoading(false)
    this.setSource('synth')
    const begin = audioNow() + 0.06
    this.current?.sched.notes.forEach((n) => {
      const end = n.start + n.dur
      if (end <= offset) return
      if (!this.full && n.start >= this.limit) return
      const st = Math.max(n.start, offset)
      const capped = this.full ? end : Math.min(end, this.limit)
      if (capped > st) richNote(n.f, begin + (st - offset), capped - st)
    })
    this.t0 = begin
    this.offset = offset
    this.playing = true
    this.paused = false
    this.setPlaying(true)
    this.paint()
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame(this.tick)
  }

  pause(): void {
    if (!this.playing) return
    if (this.src === 'real') {
      try {
        this.audioEl.pause()
      } catch {
        /* ignore */
      }
    } else {
      this.offset = this.elapsed()
      stopAll()
    }
    this.playing = false
    this.paused = true
    this.setPlaying(false)
    this.paint()
  }

  resume(): void {
    if (!this.paused) return
    if (this.src === 'real') {
      this.playing = true
      this.paused = false
      this.setPlaying(true)
      const pr = this.audioEl.play()
      if (pr && pr.catch) pr.catch(() => {})
      this.paint()
    } else this.startSynth(this.offset)
  }

  stop(): void {
    cancelAnimationFrame(this.raf)
    if (this.src === 'real') {
      try {
        this.audioEl.pause()
      } catch {
        /* ignore */
      }
    }
    if (this.src === 'synth') stopAll()
    this.src = null
    this.playing = false
    this.paused = false
    this.offset = 0
    this.wantPlay = false
    this.setPlaying(false)
    this.setLoading(false)
    const { playhead, clipLabel } = this.hooks.els()
    playhead?.classList.remove('show')
    if (clipLabel && this.current) clipLabel.textContent = this.hooks.clipIdleLabel()
  }

  /* the big button: play → pause → resume */
  toggle(): void {
    if (this.playing) {
      this.pause() // the running tick loop flips the label to ⏸
      return
    }
    if (this.paused) {
      this.resume()
      return
    }
    this.start()
  }

  destroy(): void {
    this.stop()
    this.audioEl.removeAttribute('src')
  }
}
