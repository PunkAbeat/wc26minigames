/* KEEPIES share card — the climb that travels in group chats: a stadium
   staircase of turf platforms with the gold ball bounding up to the trophy,
   your best height + tier called out. Same pitch-night art direction as the
   ANTHEM / HOIST cards (1200×630, the standard link-card aspect). Client-only
   — drawn on a user device. Chrome is shapes/text; the hero ball is the shared
   gold-ball raster, the optional nation chip is the real flag SVG. */

const W = 1200
const H = 630

const C = {
  bg1: '#0a5230',
  bg2: '#053a22',
  gold: '#ffd23f',
  goldD: '#e0a400',
  white: '#ffffff',
  mut: '#bfead0',
  turf: '#eef6ee',
  grass: '#2e8b46',
  slot: 'rgba(0,0,0,.28)',
}
const BUNTING = ['#ffd23f', '#ffffff', '#ff6b3d', '#1fd17a']

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    const done = (ok: boolean) => resolve(ok ? img : null)
    img.onload = () => done(true)
    img.onerror = () => done(false)
    img.src = src
    setTimeout(() => done(!!img.width), 1200)
  })
}

function drawTrophy(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.strokeStyle = C.gold
  ctx.lineWidth = 5 // handles
  ctx.beginPath()
  ctx.arc(-26, -20, 13, Math.PI * 0.5, Math.PI * 1.5, true)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(26, -20, 13, Math.PI * 1.5, Math.PI * 0.5, true)
  ctx.stroke()
  ctx.fillStyle = C.gold
  ctx.strokeStyle = C.goldD
  ctx.lineWidth = 2 // bowl
  ctx.beginPath()
  ctx.moveTo(-27, -34)
  ctx.lineTo(27, -34)
  ctx.lineTo(20, 4)
  ctx.quadraticCurveTo(0, 20, -20, 4)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillRect(-5, 4, 10, 12)
  ctx.fillRect(-17, 16, 34, 6)
  ctx.fillRect(-13, 22, 26, 7) // stem + base
  ctx.restore()
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 ? r * 0.45 : r
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad)
  }
  ctx.closePath()
  ctx.fill()
}

export interface KeepiesCardOpts {
  headline: string // gold pill text, e.g. "THE ROOF · 612 M" or "48 NATIONS · 48 CLIMBS"
  sub: string // muted subtitle line
  flagCode?: string // optional nation chip (real flag SVG) shown by the pill
  host: string // e.g. location.host
}

async function drawKeepiesCard(canvas: HTMLCanvasElement, o: KeepiesCardOpts): Promise<void> {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  /* background + warm stadium glow */
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, C.bg1)
  bg.addColorStop(1, C.bg2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, -80, 60, W / 2, -80, 720)
  glow.addColorStop(0, 'rgba(255,226,140,.30)')
  glow.addColorStop(1, 'rgba(255,226,140,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,.14)'
  ctx.lineWidth = 4
  rr(ctx, 26, 26, W - 52, H - 52, 24)
  ctx.stroke()

  /* bunting */
  for (let i = 0; i < 16; i++) {
    const bx = 60 + i * ((W - 120) / 15)
    ctx.fillStyle = BUNTING[i % BUNTING.length]
    ctx.beginPath()
    ctx.moveTo(bx - 16, 0)
    ctx.lineTo(bx + 16, 0)
    ctx.lineTo(bx, 34)
    ctx.closePath()
    ctx.fill()
  }

  const ball = await loadImg('/keepies-ball.png')
  const flag = o.flagCode ? await loadImg(`/flags/${o.flagCode}.svg`) : null

  /* gold ball + KEEPIES wordmark, centred as one group */
  const cy = 116
  ctx.font = "800 78px 'Baloo 2', sans-serif"
  const word = 'KEEPIES'
  const tw = ctx.measureText(word).width
  const ballR = 34
  const gap = 18
  const x0 = (W - (ballR * 2 + gap + tw)) / 2
  const bx = x0 + ballR
  if (ball) {
    ctx.drawImage(ball, bx - ballR, cy - ballR, ballR * 2, ballR * 2)
  } else {
    const g = ctx.createRadialGradient(bx - 8, cy - 12, 6, bx, cy, 42)
    g.addColorStop(0, '#fff')
    g.addColorStop(0.45, '#ffe9a6')
    g.addColorStop(0.8, C.gold)
    g.addColorStop(1, C.goldD)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(bx, cy, ballR, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.white
  ctx.shadowColor = 'rgba(0,0,0,.25)'
  ctx.shadowOffsetY = 5
  ctx.fillText(word, x0 + ballR * 2 + gap, cy)
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0

  /* headline pill (+ optional nation flag chip to its left) */
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = "800 34px 'Baloo 2', sans-serif"
  const pillH = 58
  const pillY = 176
  const chipW = flag ? 54 : 0
  const chipGap = flag ? 14 : 0
  const textW = ctx.measureText(o.headline).width
  const pillW = textW + 64
  const groupW = chipW + chipGap + pillW
  const gx = (W - groupW) / 2
  if (flag) {
    const chipH = 38
    const chipY = pillY + (pillH - chipH) / 2
    ctx.save()
    rr(ctx, gx, chipY, chipW, chipH, 6)
    ctx.clip()
    ctx.drawImage(flag, gx, chipY, chipW, chipH)
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,.55)'
    ctx.lineWidth = 2
    rr(ctx, gx, chipY, chipW, chipH, 6)
    ctx.stroke()
  }
  const px = gx + chipW + chipGap
  rr(ctx, px, pillY, pillW, pillH, 29)
  ctx.fillStyle = 'rgba(0,0,0,.30)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.18)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = C.gold
  ctx.fillText(o.headline, px + pillW / 2, pillY + pillH / 2 + 1)

  /* subtitle */
  ctx.fillStyle = C.mut
  ctx.font = "700 24px 'Nunito', sans-serif"
  ctx.fillText(o.sub, W / 2, 262)

  /* the climb — a staircase of turf platforms rising left→right, the gold ball
     bounding up a dashed trail to the trophy at the top */
  const steps = [
    { x: 250, y: 540 },
    { x: 430, y: 492 },
    { x: 610, y: 440 },
    { x: 790, y: 388 },
    { x: 960, y: 340 },
  ]
  const pw = 132
  const ph = 22
  // dashed bounce trail between platform tops
  ctx.strokeStyle = 'rgba(255,255,255,.4)'
  ctx.lineWidth = 3
  ctx.setLineDash([3, 12])
  ctx.lineCap = 'round'
  ctx.beginPath()
  steps.forEach((s, i) => {
    const tx = s.x
    const ty = s.y - 36
    if (i === 0) ctx.moveTo(tx, ty)
    else {
      const p = steps[i - 1]
      const mx = (p.x + s.x) / 2
      ctx.quadraticCurveTo(mx, Math.min(p.y, s.y) - 96, tx, ty)
    }
  })
  ctx.stroke()
  ctx.setLineDash([])

  // platforms (clean turf bars, matching the game)
  for (const s of steps) {
    ctx.fillStyle = 'rgba(0,0,0,.22)'
    rr(ctx, s.x - pw / 2 + 3, s.y + 4, pw, ph, 9)
    ctx.fill()
    ctx.fillStyle = C.turf
    rr(ctx, s.x - pw / 2, s.y, pw, ph, 9)
    ctx.fill()
    ctx.fillStyle = C.grass
    rr(ctx, s.x - pw / 2, s.y, pw, 6, 5)
    ctx.fill()
  }

  // trophy above the top step, with sparkle stars
  const top = steps[steps.length - 1]
  drawTrophy(ctx, top.x, top.y - 64, 1.15)
  ctx.fillStyle = C.gold
  star(ctx, top.x - 64, top.y - 96, 9)
  star(ctx, top.x + 60, top.y - 72, 7)
  star(ctx, top.x + 30, top.y - 120, 6)

  // the climbing ball, resting on the middle step
  const mid = steps[2]
  const r = 34
  if (ball) ctx.drawImage(ball, mid.x - r, mid.y - r * 2 + 4, r * 2, r * 2)

  /* footer */
  ctx.fillStyle = C.mut
  ctx.font = "700 26px 'Nunito', sans-serif"
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(o.host ? `Play at ${o.host}/keepies` : '', W - 56, H - 40)
}

export async function renderKeepiesCard(o: KeepiesCardOpts): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  try {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
    }
  } catch {
    /* draw with fallback fonts */
  }
  const canvas = document.createElement('canvas')
  await drawKeepiesCard(canvas, o)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

/* static OG link-unfurl card (no per-user data). Rendered by /og?card=keepies
   and screenshot to public/og/keepies.png. */
export async function drawKeepiesOg(canvas: HTMLCanvasElement): Promise<void> {
  await drawKeepiesCard(canvas, {
    headline: '48 NATIONS · 48 CLIMBS',
    sub: 'Bounce your nation up the stadium',
    host: 'wc26minigames.com',
  })
}
