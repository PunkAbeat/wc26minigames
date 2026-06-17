// @ts-nocheck — Web Audio is loosely typed; this is a tiny synth, not worth typing.
/* KEEPIES sound — synthesized SFX, no audio assets. One shared AudioContext,
   created lazily on the first tap (browser autoplay policy needs a gesture);
   each cue is a short oscillator + gain envelope. Muteable, persisted in
   localStorage. No-ops where Web Audio is unavailable (SSR / old browsers). */

const KEY = 'wc26_keepies_muted'

export function createKpSound() {
  const AC =
    (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null
  let ctx = null
  let muted = false
  try {
    muted = localStorage.getItem(KEY) === '1'
  } catch {
    /* storage blocked */
  }

  function ensure() {
    if (!AC) return null
    if (!ctx) {
      try {
        ctx = new AC()
      } catch {
        return null
      }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return ctx
  }

  // a short tone with a quick attack + exponential decay; optional pitch slide
  function tone(freq, dur, type = 'sine', gain = 0.16, slideTo = null) {
    if (muted) return
    const c = ensure()
    if (!c) return
    const t = c.currentTime
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = type
    o.frequency.setValueAtTime(freq, t)
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(c.destination)
    o.start(t)
    o.stop(t + dur + 0.02)
  }

  return {
    resume() {
      ensure()
    },
    get muted() {
      return muted
    },
    setMuted(m) {
      muted = !!m
      try {
        localStorage.setItem(KEY, m ? '1' : '0')
      } catch {
        /* storage blocked */
      }
    },
    bounce() {
      tone(430, 0.11, 'triangle', 0.14, 300)
    }, // soft blip, slight down-slide
    spring() {
      tone(300, 0.22, 'square', 0.15, 780)
    }, // trampoline boing (up)
    punt() {
      tone(200, 0.4, 'sawtooth', 0.17, 900)
    }, // keeper-punt whoosh (big up)
    crack() {
      tone(170, 0.1, 'square', 0.11, 80)
    }, // crumble thud (down)
    tier() {
      tone(680, 0.18, 'sine', 0.15, 1000)
    }, // milestone chime
    best() {
      tone(660, 0.16, 'sine', 0.15)
      setTimeout(() => tone(990, 0.26, 'sine', 0.15), 120)
    }, // new-best flourish
  }
}
