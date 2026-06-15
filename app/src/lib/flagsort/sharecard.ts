/* HOIST share card — the "collection wall" that travels in group chats:
   the real flags you've built, lit up against the ones still to go, with the
   X/48 count. Same pitch-night art direction as the ANTHEM card (1200×630, the
   standard link-card aspect). Client-only — drawn on a user device where SVG
   flags rasterise to canvas fine. The chrome is shapes/text only; the flag
   thumbnails are the real official SVGs (already cached from gameplay). */

const W = 1200
const H = 630

const C = {
  bg1: '#0a5230',
  bg2: '#053a22',
  gold: '#ffd23f',
  goldD: '#e0a400',
  coral: '#ff6b3d',
  green: '#1bb85c',
  white: '#ffffff',
  mut: '#bfead0',
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

export interface FlagCardOpts {
  cells: boolean[] // solved? in display order (length 48)
  codes: string[] // ISO code per cell, same order
  built: number
  total: number
  host: string // e.g. location.host
  label?: string // overrides the "X / 48 FLAGS RAISED" pill (used by the static OG card)
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

async function drawFlagCard(canvas: HTMLCanvasElement, o: FlagCardOpts): Promise<void> {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  /* background + warm stadium glow */
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, C.bg1)
  bg.addColorStop(1, C.bg2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, -80, 60, W / 2, -80, 700)
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

  /* gold ball + HOIST wordmark, centred as one group */
  const cy = 118
  ctx.font = "800 80px 'Baloo 2', sans-serif"
  const word = 'HOIST'
  const tw = ctx.measureText(word).width
  const ballR = 32
  const gap = 16
  const x0 = (W - (ballR * 2 + gap + tw)) / 2
  const bx = x0 + ballR
  const ball = ctx.createRadialGradient(bx - 8, cy - 12, 6, bx, cy, 40)
  ball.addColorStop(0, '#fff')
  ball.addColorStop(0.45, '#ffe9a6')
  ball.addColorStop(0.8, C.gold)
  ball.addColorStop(1, C.goldD)
  ctx.fillStyle = ball
  ctx.beginPath()
  ctx.arc(bx, cy, ballR, 0, Math.PI * 2)
  ctx.fill()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.white
  ctx.shadowColor = 'rgba(0,0,0,.25)'
  ctx.shadowOffsetY = 5
  ctx.fillText(word, x0 + ballR * 2 + gap, cy)
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0

  /* count pill: "23 / 48 FLAGS RAISED" */
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const label = o.label || `${o.built} / ${o.total} FLAGS RAISED`
  ctx.font = "800 32px 'Baloo 2', sans-serif"
  const pillW = ctx.measureText(label).width + 64
  rr(ctx, (W - pillW) / 2, 168, pillW, 56, 28)
  ctx.fillStyle = 'rgba(0,0,0,.30)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.18)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = C.gold
  ctx.fillText(label, W / 2, 198)

  /* the collection grid — 8×6, real flag where built, dark slot otherwise */
  const cols = 8
  const rows = 6
  const yTop = 256
  const yBot = 556
  const gapC = 8
  const cellH = Math.floor((yBot - yTop - (rows - 1) * gapC) / rows)
  const cellW = Math.round(cellH * 1.5)
  const gridW = cols * cellW + (cols - 1) * gapC
  const gx0 = (W - gridW) / 2

  /* preload only the built flags (cached from gameplay) */
  const imgs = await Promise.all(
    o.cells.map((built, i) => (built ? loadImg(`/flags/${o.codes[i]}.svg`) : Promise.resolve(null))),
  )

  for (let i = 0; i < cols * rows; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const x = gx0 + c * (cellW + gapC)
    const y = yTop + r * (cellH + gapC)
    const img = imgs[i]
    ctx.save()
    rr(ctx, x, y, cellW, cellH, 6)
    ctx.clip()
    if (o.cells[i] && img) {
      ctx.drawImage(img, x, y, cellW, cellH)
    } else {
      ctx.fillStyle = C.slot
      ctx.fillRect(x, y, cellW, cellH)
    }
    ctx.restore()
    ctx.strokeStyle = o.cells[i] ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.10)'
    ctx.lineWidth = o.cells[i] ? 2 : 1.5
    rr(ctx, x, y, cellW, cellH, 6)
    ctx.stroke()
  }

  /* footer */
  ctx.fillStyle = C.mut
  ctx.font = "700 26px 'Nunito', sans-serif"
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(o.host ? `Play at ${o.host}/hoist` : '', W - 56, H - 40)
}

export async function renderFlagCard(o: FlagCardOpts): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  try {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
    }
  } catch {
    /* draw with fallback fonts */
  }
  const canvas = document.createElement('canvas')
  await drawFlagCard(canvas, o)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

/* static OG link-unfurl card: the full wall of all 48 flags + a tagline (no
   per-user data). Rendered by /og?card=hoist and screenshot to public/og/hoist.png. */
const OG_CODES = ['mx','za','kr','cz','ca','ba','qa','ch','br','ma','ht','gb-sct','us','py','au','tr',
  'de','cw','ci','ec','nl','jp','se','tn','be','eg','ir','nz','es','cv','sa','uy','fr','sn','iq','no',
  'ar','dz','at','jo','pt','cd','uz','co','gb-eng','hr','gh','pa']
export async function drawHoistOg(canvas: HTMLCanvasElement): Promise<void> {
  await drawFlagCard(canvas, {
    cells: OG_CODES.map(() => true), codes: OG_CODES, built: 48, total: 48,
    host: 'wc26minigames.com', label: 'RAISE EVERY WORLD CUP FLAG',
  })
}

/* text fallback (and the body that rides along with the image): an emoji grid
   of the collection — 🟩 built, ⬜ still to go — 8 per row */
export function flagShareText(built: number, total: number, cells: boolean[]): string {
  let grid = ''
  for (let i = 0; i < cells.length; i++) {
    grid += cells[i] ? '🟩' : '⬜'
    if (i % 8 === 7) grid += '\n'
  }
  return `⚽ HOIST\n${built}/${total} World Cup flags raised\n\n${grid.trim()}`
}
