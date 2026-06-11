/* Ball-rolls-to-goal progress geometry. Progress is guess-based ((stage+1)/6),
   NOT clip-seconds — see HANDOFF §4. Ported verbatim; imperative because the
   stage marks are pixel-positioned from clientWidth and the roll animation
   must not be re-rendered mid-flight (a render() that re-set the ball position
   used to cancel the roll — HANDOFF §7). */

export interface TrackEls {
  track: HTMLElement | null
  ballpos: HTMLElement | null
  ball: HTMLElement | null
  fill: HTMLElement | null
}

export class TrackView {
  constructor(
    private els: () => TrackEls,
    private reducedMotion: () => boolean,
  ) {}

  geomX(frac: number): number {
    const t = this.els().track
    const pad = 14
    const w = Math.max(40, (t?.clientWidth || 0) - pad * 2)
    return pad + frac * w
  }

  fracFor(stage: number): number {
    return (stage + 1) / 6
  }

  placeMarks(stage: number): void {
    const track = this.els().track
    if (!track) return
    track.querySelectorAll('.smark').forEach((n) => n.remove())
    for (let i = 0; i < 6; i++) {
      const m = document.createElement('div')
      m.className = 'smark' + (i <= stage ? ' on' : '')
      m.style.left = this.geomX((i + 1) / 6) + 'px'
      track.appendChild(m)
    }
  }

  setStatic(stage: number): void {
    const { ballpos, fill } = this.els()
    const x = this.geomX(this.fracFor(stage))
    if (ballpos) {
      ballpos.style.transition = 'none'
      ballpos.style.left = x + 'px'
    }
    if (fill) {
      fill.style.transition = 'none'
      fill.style.width = x + 'px'
    }
    this.placeMarks(stage)
  }

  animateBall(stage: number): void {
    const { ball, ballpos, fill } = this.els()
    if (this.reducedMotion()) {
      this.setStatic(stage)
      return
    }
    if (!ball || !ballpos || !fill) return
    const x0 = this.geomX(0)
    const x = this.geomX(this.fracFor(stage))
    ballpos.style.transition = 'none'
    fill.style.transition = 'none'
    ballpos.style.left = x0 + 'px'
    fill.style.width = x0 + 'px'
    ball.classList.remove('kick')
    void ball.offsetWidth
    this.placeMarks(stage)
    requestAnimationFrame(() => {
      ballpos.style.transition = 'left .9s cubic-bezier(.25,.9,.3,1)'
      fill.style.transition = 'width .9s cubic-bezier(.25,.9,.3,1)'
      ball.classList.add('kick')
      ballpos.style.left = x + 'px'
      fill.style.width = x + 'px'
    })
  }
}
