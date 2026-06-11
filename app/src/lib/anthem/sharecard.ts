/* Canvas-rendered share card — the visual that travels in group chats.
   Spoiler-free by design: grid + score + streak, never the answer's flag or
   name. Drawn with shapes (no emoji glyphs — headless/older devices render
   them inconsistently). 1200×630 = the standard link-card aspect, so the same
   art direction works for the OG image. Client-only. */

import type { GameState, Mode, ResultType } from './game'

const W = 1200
const H = 630

const C = {
  bg1: '#0a5230',
  bg2: '#053a22',
  ink: '#06321c',
  gold: '#ffd23f',
  goldD: '#e0a400',
  goldInk: '#4a3500',
  coral: '#ff6b3d',
  green: '#1bb85c',
  white: '#ffffff',
  soft: '#e6fff0',
  mut: '#bfead0',
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

export interface ShareCardOpts {
  results: ResultType[]
  won: boolean
  tries: string // "3" or "X"
  mode: Mode
  matchNo: number
  streak: number
  host: string // e.g. location.host — where to play
}

export function drawShareCard(canvas: HTMLCanvasElement, o: ShareCardOpts): void {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  /* pitch-night background + warm stadium glow */
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, C.bg1)
  bg.addColorStop(1, C.bg2)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, -80, 60, W / 2, -80, 700)
  glow.addColorStop(0, 'rgba(255,226,140,.32)')
  glow.addColorStop(1, 'rgba(255,226,140,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  /* faint pitch markings */
  ctx.strokeStyle = 'rgba(255,255,255,.14)'
  ctx.lineWidth = 4
  rr(ctx, 26, 26, W - 52, H - 52, 24)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(W / 2, 26, 110, 0, Math.PI)
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

  /* gold ball + wordmark */
  const cy = 150
  const ball = ctx.createRadialGradient(W / 2 - 180, cy - 12, 6, W / 2 - 172, cy, 44)
  ball.addColorStop(0, '#fff')
  ball.addColorStop(0.45, '#ffe9a6')
  ball.addColorStop(0.8, C.gold)
  ball.addColorStop(1, C.goldD)
  ctx.fillStyle = ball
  ctx.beginPath()
  ctx.arc(W / 2 - 172, cy, 36, 0, Math.PI * 2)
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.white
  ctx.font = "800 92px 'Baloo 2', sans-serif"
  ctx.shadowColor = 'rgba(0,0,0,.25)'
  ctx.shadowOffsetY = 5
  ctx.fillText('ANTHEM', W / 2 - 118, cy)
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0

  ctx.textAlign = 'center'
  ctx.fillStyle = C.mut
  ctx.font = "700 30px 'Nunito', sans-serif"
  ctx.fillText('Guess the nation from its anthem', W / 2, 232)

  /* scoreboard pill: MATCH #N · 3/6 (or PRACTICE) */
  const label =
    (o.mode === 'daily' ? 'MATCH #' + o.matchNo : 'PRACTICE') + '  ·  ' + o.tries + '/6'
  ctx.font = "700 34px 'Baloo 2', sans-serif"
  const pillW = ctx.measureText(label).width + 76
  rr(ctx, (W - pillW) / 2, 274, pillW, 64, 32)
  ctx.fillStyle = C.ink
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.18)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.fillStyle = C.coral
  ctx.beginPath()
  ctx.arc((W - pillW) / 2 + 34, 306, 7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = C.gold
  ctx.fillText(label, W / 2 + 12, 308)

  /* the grid — six slots so a 2-guess win still reads as "out of 6" */
  const n = 6
  const size = 86
  const gap = 22
  const gx0 = (W - (n * size + (n - 1) * gap)) / 2
  const gy = 386
  for (let i = 0; i < n; i++) {
    const r = o.results[i]
    const x = gx0 + i * (size + gap)
    rr(ctx, x, gy, size, size, 18)
    if (!r) {
      ctx.fillStyle = 'rgba(0,0,0,.25)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.12)'
      ctx.lineWidth = 3
      ctx.stroke()
      continue
    }
    const col = r === 'correct' ? C.green : r === 'wrong' ? C.coral : '#274d38'
    const g = ctx.createLinearGradient(0, gy, 0, gy + size)
    g.addColorStop(0, col)
    g.addColorStop(1, col + 'cc')
    ctx.fillStyle = g
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,.35)'
    ctx.lineWidth = 3
    ctx.stroke()
    /* goal slots get a little ball, misses an ✕, skips a dash — readable
       even for colorblind viewers */
    ctx.fillStyle = 'rgba(255,255,255,.95)'
    if (r === 'correct') {
      ctx.beginPath()
      ctx.arc(x + size / 2, gy + size / 2, 16, 0, Math.PI * 2)
      ctx.fill()
    } else if (r === 'wrong') {
      ctx.strokeStyle = 'rgba(255,255,255,.85)'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x + size / 2 - 14, gy + size / 2 - 14)
      ctx.lineTo(x + size / 2 + 14, gy + size / 2 + 14)
      ctx.moveTo(x + size / 2 + 14, gy + size / 2 - 14)
      ctx.lineTo(x + size / 2 - 14, gy + size / 2 + 14)
      ctx.stroke()
      ctx.lineCap = 'butt'
    } else {
      rr(ctx, x + size / 2 - 16, gy + size / 2 - 5, 32, 10, 5)
      ctx.fill()
    }
  }

  /* result line + streak */
  ctx.fillStyle = o.won ? C.gold : C.soft
  ctx.font = "800 44px 'Baloo 2', sans-serif"
  ctx.fillText(o.won ? 'GOAL!' : 'FULL TIME', W / 2, 532)
  if (o.mode === 'daily' && o.streak > 0) {
    ctx.fillStyle = C.coral
    ctx.font = "700 30px 'Baloo 2', sans-serif"
    ctx.fillText('STREAK ' + o.streak, W / 2, 576)
  }

  /* where to play */
  ctx.fillStyle = C.mut
  ctx.font = "700 26px 'Nunito', sans-serif"
  ctx.textAlign = 'right'
  ctx.fillText(o.host ? 'play at ' + o.host + '/anthem' : '', W - 56, H - 52)
}

export async function renderShareCard(o: ShareCardOpts): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  /* make sure the display fonts are actually loaded before drawing text */
  try {
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
    }
  } catch {
    /* draw with fallback fonts */
  }
  const canvas = document.createElement('canvas')
  drawShareCard(canvas, o)
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export function gameToCardOpts(
  state: GameState,
  mode: Mode,
  matchNo: number,
  host: string,
): ShareCardOpts {
  return {
    results: state.results.map((r) => r.type),
    won: state.won,
    tries: state.won ? String(state.attempt) : 'X',
    mode,
    matchNo,
    streak: state.streak || 0,
    host,
  }
}
