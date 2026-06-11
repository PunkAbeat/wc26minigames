/* Win confetti: centre fountain + side cannons + second wave. Everyone gets a
   celebration — full blast normally, a gentler shower under
   prefers-reduced-motion (fewer/slower pieces, no cannons, no second wave).
   Ported verbatim from games/anthem/index.html (CONFETTI section); canvas 2D
   particle loop stays imperative behind a ref. */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  g: number
  s: number
  c: string
  r: number
  vr: number
  life: number
}

export class Confetti {
  parts: Particle[] = []
  private ctx: CanvasRenderingContext2D
  private raf = 0

  constructor(
    private canvas: HTMLCanvasElement,
    private reducedMotion: () => boolean,
  ) {
    this.ctx = canvas.getContext('2d')!
    this.size()
  }

  size(): void {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  burst(x: number, y: number, n: number, vx0: number, spread: number): void {
    const colors = ['#ffd23f', '#ffffff', '#1fd17a', '#ff6b3d', '#33c6ff']
    const RM = this.reducedMotion()
    const K = RM ? 0.55 : 1 // reduced motion: slower, softer drift
    for (let i = 0; i < n; i++) {
      this.parts.push({
        x: x + (Math.random() - 0.5) * 60,
        y,
        vx: (vx0 + (Math.random() - 0.5) * spread) * K,
        vy: (-5 - Math.random() * 11) * K,
        g: RM ? 0.16 : 0.3,
        s: 6 + Math.random() * 8,
        c: colors[(Math.random() * colors.length) | 0],
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * (RM ? 0.25 : 0.55),
        life: 150 + Math.random() * 50,
      })
    }
  }

  launch(): void {
    const RM = this.reducedMotion()
    this.parts = []
    const C = RM ? 0.4 : 1
    this.burst(window.innerWidth / 2, window.innerHeight * 0.3, Math.round(130 * C), 0, 10) // centre fountain
    if (!RM) {
      this.burst(12, window.innerHeight * 0.72, 60, 7.5, 5) // left cannon
      this.burst(window.innerWidth - 12, window.innerHeight * 0.72, 60, -7.5, 5) // right cannon
      setTimeout(() => this.burst(window.innerWidth / 2, window.innerHeight * 0.35, 80, 0, 11), 650) // second wave
    }
    cancelAnimationFrame(this.raf)
    this.run()
  }

  private run = (): void => {
    const { ctx, canvas } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false
    this.parts.forEach((p) => {
      if (p.life <= 0) return
      alive = true
      p.vy += p.g
      p.x += p.vx
      p.y += p.vy
      p.r += p.vr
      p.life--
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.r)
      ctx.globalAlpha = Math.min(1, p.life / 30)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62)
      ctx.restore()
    })
    if (alive) this.raf = requestAnimationFrame(this.run)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  destroy(): void {
    cancelAnimationFrame(this.raf)
    this.parts = []
  }
}
