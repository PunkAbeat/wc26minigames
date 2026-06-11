/* Synth fallback engine — detuned brass + bass + pad + convolver reverb.
   Ported verbatim from games/anthem/index.html (AUDIO ENGINE section).
   Imperative on purpose: Web Audio nodes are not React state. Client-only. */

import type { MelodyNote } from '../puzzles'

export const SPB = 0.5
const NOTE_OFFSET: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

export function noteFreq(n: string): number {
  const m = n.match(/^([A-G]#?)(\d)$/)!
  const s = (parseInt(m[2], 10) - 4) * 12 + (NOTE_OFFSET[m[1]] - 9)
  return 440 * Math.pow(2, s / 12)
}

export interface ScheduledNote {
  f: number
  start: number
  dur: number
}
export interface MelodySchedule {
  notes: ScheduledNote[]
  total: number
}

export function scheduleMelody(mel: MelodyNote[]): MelodySchedule {
  let t = 0
  const notes: ScheduledNote[] = []
  for (const [name, beats] of mel) {
    const dur = beats * SPB
    if (name !== 'rest') notes.push({ f: noteFreq(name), start: t, dur })
    t += dur
  }
  return { notes, total: t }
}

let actx: AudioContext | null = null
let busDry: GainNode | null = null
let busWet: GainNode | null = null
let live: (OscillatorNode | AudioScheduledSourceNode)[] = []

function makeIR(ctx: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = ctx.sampleRate
  const len = rate * seconds
  const buf = ctx.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

export function ensureCtx(): AudioContext {
  if (!actx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    actx = new AC()
    const comp = actx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    comp.attack.value = 0.005
    comp.release.value = 0.18
    const master = actx.createGain()
    master.gain.value = 0.95
    const reverb = actx.createConvolver()
    reverb.buffer = makeIR(actx, 2.2, 2.6)
    const wet = actx.createGain()
    wet.gain.value = 0.32
    busDry = actx.createGain()
    busWet = actx.createGain()
    busDry.connect(comp)
    busWet.connect(reverb)
    reverb.connect(wet)
    wet.connect(comp)
    comp.connect(master)
    master.connect(actx.destination)
  }
  if (actx.state === 'suspended') actx.resume()
  return actx
}

export function audioNow(): number {
  return actx ? actx.currentTime : 0
}

export function richNote(freq: number, at: number, dur: number): void {
  if (!actx || !busDry || !busWet) return
  const leadMix = actx.createGain()
  const det = [-7, 0, 7]
  const vib = actx.createOscillator()
  vib.frequency.value = 5.2
  const vibAmt = actx.createGain()
  vibAmt.gain.value = dur > 0.6 ? 6 : 0
  vib.connect(vibAmt)
  vib.start(at)
  vib.stop(at + dur + 0.05)
  live.push(vib)
  det.forEach((c) => {
    const o = actx!.createOscillator()
    o.type = 'sawtooth'
    o.frequency.value = freq
    o.detune.value = c
    vibAmt.connect(o.detune)
    o.connect(leadMix)
    o.start(at)
    o.stop(at + dur + 0.06)
    live.push(o)
  })
  const lp = actx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.8
  lp.frequency.setValueAtTime(700, at)
  lp.frequency.linearRampToValueAtTime(2700, at + 0.09)
  lp.frequency.linearRampToValueAtTime(1500, at + dur)
  const env = actx.createGain()
  const a = 0.045,
    r = 0.14,
    pk = 0.13
  env.gain.setValueAtTime(0, at)
  env.gain.linearRampToValueAtTime(pk, at + a)
  env.gain.setValueAtTime(pk, at + Math.max(a, dur - r))
  env.gain.linearRampToValueAtTime(0.0001, at + dur)
  leadMix.connect(lp)
  lp.connect(env)
  env.connect(busDry)
  env.connect(busWet)
  const b = actx.createOscillator()
  b.type = 'triangle'
  b.frequency.value = freq / 2
  const bEnv = actx.createGain()
  bEnv.gain.setValueAtTime(0, at)
  bEnv.gain.linearRampToValueAtTime(0.09, at + 0.04)
  bEnv.gain.setValueAtTime(0.09, at + Math.max(0.05, dur - 0.1))
  bEnv.gain.linearRampToValueAtTime(0.0001, at + dur)
  b.connect(bEnv)
  bEnv.connect(busDry)
  b.start(at)
  b.stop(at + dur + 0.05)
  live.push(b)
  const p = actx.createOscillator()
  p.type = 'sine'
  p.frequency.value = freq
  const pEnv = actx.createGain()
  pEnv.gain.setValueAtTime(0, at)
  pEnv.gain.linearRampToValueAtTime(0.05, at + 0.08)
  pEnv.gain.linearRampToValueAtTime(0.0001, at + dur)
  p.connect(pEnv)
  pEnv.connect(busWet)
  p.start(at)
  p.stop(at + dur + 0.05)
  live.push(p)
}

export function stopAll(): void {
  live.forEach((o) => {
    try {
      o.stop()
    } catch {
      /* already stopped */
    }
  })
  live = []
}

/* the miss "thunk" — short pitch-drop sine straight to the destination */
export function missThunk(): void {
  try {
    const ctx = ensureCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(220, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18)
    g.gain.setValueAtTime(0.18, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.24)
  } catch {
    /* audio unavailable — silent miss */
  }
}

/* ---- moment SFX (post-migration polish). All gated behind the caller's
   reduced-motion check, matching the original thunk's behaviour. ---- */

/* ball strike on SHOOT: low thump + tiny noise snap */
export function sfxKick(): void {
  try {
    const ctx = ensureCtx()
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(150, t)
    o.frequency.exponentialRampToValueAtTime(55, t + 0.09)
    g.gain.setValueAtTime(0.22, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    o.connect(g)
    g.connect(ctx.destination)
    o.start(t)
    o.stop(t + 0.13)
    const len = Math.floor(ctx.sampleRate * 0.04)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const n = ctx.createBufferSource()
    n.buffer = buf
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2500
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.05, t)
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
    n.connect(hp)
    hp.connect(ng)
    ng.connect(ctx.destination)
    n.start(t)
  } catch {
    /* no audio — silent */
  }
}

/* GOAL: quick rising major arpeggio with a bright echo */
export function sfxGoal(): void {
  try {
    const ctx = ensureCtx()
    const t0 = ctx.currentTime + 0.02
    const freqs = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    freqs.forEach((f, i) => {
      const at = t0 + i * 0.085
      ;[0, 7].forEach((det) => {
        const o = ctx.createOscillator()
        o.type = 'triangle'
        o.frequency.value = f
        o.detune.value = det
        const g = ctx.createGain()
        const dur = i === freqs.length - 1 ? 0.6 : 0.22
        g.gain.setValueAtTime(0, at)
        g.gain.linearRampToValueAtTime(0.12, at + 0.015)
        g.gain.exponentialRampToValueAtTime(0.001, at + dur)
        o.connect(g)
        g.connect(ctx.destination)
        o.start(at)
        o.stop(at + dur + 0.05)
      })
    })
  } catch {
    /* silent */
  }
}

/* FULL TIME: referee whistle — peep, peep, peeeep (trilled ~2.8kHz) */
export function sfxWhistle(): void {
  try {
    const ctx = ensureCtx()
    const t0 = ctx.currentTime + 0.02
    const blast = (at: number, dur: number) => {
      const o = ctx.createOscillator()
      o.type = 'square'
      o.frequency.value = 2750
      const trill = ctx.createOscillator()
      trill.frequency.value = 38 // the pea rattling
      const trillAmt = ctx.createGain()
      trillAmt.gain.value = 220
      trill.connect(trillAmt)
      trillAmt.connect(o.frequency)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.05, at + 0.01)
      g.gain.setValueAtTime(0.05, at + dur - 0.02)
      g.gain.linearRampToValueAtTime(0.0001, at + dur)
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 5200
      o.connect(lp)
      lp.connect(g)
      g.connect(ctx.destination)
      o.start(at)
      o.stop(at + dur + 0.02)
      trill.start(at)
      trill.stop(at + dur + 0.02)
    }
    blast(t0, 0.14)
    blast(t0 + 0.22, 0.14)
    blast(t0 + 0.44, 0.55)
  } catch {
    /* silent */
  }
}
