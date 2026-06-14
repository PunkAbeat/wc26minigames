// @ts-nocheck
/* HOIST stencils — all 48 flags, ported from the approved feel mock
   (public/mock/stencil.html). Each flag decomposes into pour GROUPS (one colour,
   in fill order); each group is a set of simple SHAPES that fill in sync. Shapes
   are authored in a per-flag pixel viewbox (W=300, H=300/ratio) then normalised
   to fractional coords; the engine fills them with SOLID colour (liquid surface
   from the FR spring sim) and cross-fades to the real official flag on win.

   Traceable emblems (stars, crescents, the taegeuk, the maple leaf) are poured;
   painterly crests that can't be cleanly traced (eagles, suns, coats of arms,
   Brazil's globe) are left to the win cross-fade. */

const W = 300
const rect = (x, y, w, h) => ['rect', x, y, w, h]
const poly = pts => ['poly', pts]
function star(cx, cy, r, pts = 5, rot = -Math.PI / 2) {
  const ri = r * 0.44, a = []
  for (let i = 0; i < pts * 2; i++) { const rr = i % 2 ? ri : r, an = rot + i * Math.PI / pts; a.push([cx + rr * Math.cos(an), cy + rr * Math.sin(an)]) }
  return poly(a)
}
function band(x1, y1, x2, y2, hw) { const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), px = -dy / L * hw, py = dx / L * hw
  return poly([[x1 + px, y1 + py], [x2 + px, y2 + py], [x2 - px, y2 - py], [x1 - px, y1 - py]]) }
function disc(cx, cy, r, seg = 44) { const p = []; for (let i = 0; i < seg; i++) { const a = i / seg * 2 * Math.PI; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) } return poly(p) }
function crescent(cx, cy, ro, ri, off, seg = 40) {
  const xi = (off * off + ro * ro - ri * ri) / (2 * off), yi = Math.sqrt(Math.max(0, ro * ro - xi * xi))
  const aO = Math.atan2(yi, xi), aI = Math.atan2(yi, xi - off), p = []
  for (let i = 0; i <= seg; i++) { const a = aO + (2 * Math.PI - 2 * aO) * i / seg; p.push([cx + ro * Math.cos(a), cy + ro * Math.sin(a)]) }
  for (let i = 0; i <= seg; i++) { const a = (2 * Math.PI - aI) - ((2 * Math.PI - aI) - aI) * i / seg; p.push([cx + off + ri * Math.cos(a), cy + ri * Math.sin(a)]) }
  return poly(p)
}
function taegeuk(cx, cy, R, rot = 0, seg = 30) {
  const c = Math.cos(rot), s = Math.sin(rot), rp = (px, py) => [cx - (px * c - py * s), cy + px * s + py * c] // x mirrored: chiral
  const arc = (r, ox, a0, a1) => { const p = []; for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg; p.push(rp(ox + r * Math.cos(a), r * Math.sin(a))) } return p }
  const S = [...arc(R / 2, -R / 2, Math.PI, 2 * Math.PI), ...arc(R / 2, R / 2, Math.PI, 0).slice(1)]
  return { red: poly([...arc(R, 0, 0, -Math.PI), ...S]), blue: poly([...arc(R, 0, Math.PI, 0), ...S.slice().reverse()]) }
}
const ML = [[0.524,1],[0.512,0.786],[0.542,0.762],[0.773,0.799],[0.742,0.72],[0.747,0.701],[1,0.512],[0.943,0.488],[0.934,0.468],[0.984,0.326],[0.838,0.355],[0.819,0.345],[0.79,0.284],[0.677,0.397],[0.647,0.383],[0.702,0.122],[0.614,0.168],[0.589,0.162],[0.5,0],[0.411,0.162],[0.386,0.168],[0.298,0.122],[0.353,0.383],[0.323,0.397],[0.21,0.284],[0.181,0.345],[0.162,0.355],[0.016,0.326],[0.066,0.468],[0.057,0.488],[0,0.512],[0.253,0.701],[0.258,0.72],[0.227,0.799],[0.458,0.762],[0.488,0.786],[0.476,1]]
const mapleLeaf = (cx, cy, w, h) => poly(ML.map(p => [cx + (p[0] - .5) * w, cy + (p[1] - .5) * h]))
function usStripes(H) { const sh = H / 13, cw = 120, ch = sh * 7, red = [], white = []
  for (let i = 0; i < 13; i++) { const y = i * sh, b = i < 7, x = b ? cw : 0, w = b ? W - cw : W; (i % 2 === 0 ? red : white).push(rect(x, y, w, sh)) }
  return { red, white, canton: [rect(0, 0, cw, ch)] } }
function unionJack(cw, ch) { return {
  white: [band(0, 0, cw, ch, 9), band(cw, 0, 0, ch, 9), rect(cw / 2 - 12, 0, 24, ch), rect(0, ch / 2 - 12, cw, 24)],
  red: [band(0, 0, cw, ch, 4), band(cw, 0, 0, ch, 4), rect(cw / 2 - 6, 0, 12, ch), rect(0, ch / 2 - 6, cw, 12)] } }

// each group: g(color, label, units, ...shapes). order = fill order.
const g = (color, label, units, ...shapes) => ({ color, label, units, shapes })
const FLAGS = {
  'UNITED STATES': { ratio: 1.9, build(H) { const s = usStripes(H), sh = H / 13, cw = 120, ch = sh * 7, st = []
    for (let i = 0; i < 9; i++) { const cols = i % 2 === 0 ? 6 : 5, yy = ch * (2 * i + 1) / 18
      for (let j = 0; j < cols; j++) st.push(star(cw * ((i % 2 === 0 ? 2 * j + 1 : 2 * j + 2)) / 12, yy, sh * 0.34, 5)) }
    return [g('#b31942', 'RED', 4, ...s.red), g('#f4f4f4', 'WHITE', 3, ...s.white), g('#0a3161', 'NAVY', 3, ...s.canton), g('#f4f4f4', 'STARS', 2, ...st)] } },
  'BOSNIA & H.': { ratio: 2, build(H) { const sx = W / 16, sy = H / 8, st = []
    for (let i = 0; i < 9; i++) st.push(star((2.8 + i) * sx, i * sy, sx * 0.46, 5))
    return [g('#002395', 'NAVY', 4, poly([[0, 0], [.265 * W, 0], [.765 * W, H], [0, H]]), poly([[.765 * W, 0], [W, 0], [W, H], [.765 * W, H]])),
      g('#fecb00', 'GOLD', 3, poly([[.265 * W, 0], [.765 * W, 0], [.765 * W, H]])), g('#f4f4f4', 'STARS', 2, ...st)] } },
  'MEXICO': { ratio: 1.75, build(H) { return [g('#006847', 'GREEN', 4, rect(0, 0, W / 3, H)), g('#f4f4f4', 'WHITE', 4, rect(W / 3, 0, W / 3, H)), g('#ce1126', 'RED', 4, rect(2 * W / 3, 0, W / 3, H))] } },
  'AUSTRALIA': { ratio: 2, build(H) { const cw = W / 2, ch = H / 2, uj = unionJack(cw, ch)
    const st = [star(W / 4, H * .75, 12, 7), star(W * .75, H * .833, 9, 7), star(W * .625, H * .4375, 9, 7), star(W * .75, H * .1667, 9, 7), star(W * .861, H * .371, 9, 7), star(W * .8, H * .5417, 5, 5)]
    return [g('#012169', 'NAVY', 4, rect(0, 0, W, H)), g('#f4f4f4', 'WHITE', 4, ...uj.white, ...st), g('#e4002b', 'RED', 3, ...uj.red)] } },
  'GERMANY': { ratio: 1.667, build(H) { return [g('#ffce00', 'GOLD', 3, rect(0, 2 * H / 3, W, H / 3)), g('#dd0000', 'RED', 3, rect(0, H / 3, W, H / 3)), g('#000000', 'BLACK', 3, rect(0, 0, W, H / 3))] } },
  'NETHERLANDS': { ratio: 1.5, build(H) { return [g('#21468b', 'BLUE', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#ae1c28', 'RED', 3, rect(0, 0, W, H / 3))] } },
  'FRANCE': { ratio: 1.5, build(H) { return [g('#002654', 'BLUE', 4, rect(0, 0, W / 3, H)), g('#ffffff', 'WHITE', 4, rect(W / 3, 0, W / 3, H)), g('#ce1126', 'RED', 4, rect(2 * W / 3, 0, W / 3, H))] } },
  'BELGIUM': { ratio: 1.154, build(H) { return [g('#000000', 'BLACK', 4, rect(0, 0, W / 3, H)), g('#fdda25', 'YELLOW', 4, rect(W / 3, 0, W / 3, H)), g('#ef3340', 'RED', 4, rect(2 * W / 3, 0, W / 3, H))] } },
  'IVORY COAST': { ratio: 1.5, build(H) { return [g('#f77f00', 'ORANGE', 4, rect(0, 0, W / 3, H)), g('#ffffff', 'WHITE', 4, rect(W / 3, 0, W / 3, H)), g('#009e60', 'GREEN', 4, rect(2 * W / 3, 0, W / 3, H))] } },
  'AUSTRIA': { ratio: 1.5, build(H) { return [g('#c8102e', 'RED', 4, rect(0, 0, W, H / 3), rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 4, rect(0, H / 3, W, H / 3))] } },
  'SPAIN': { ratio: 1.5, build(H) { return [g('#ad1519', 'RED', 4, rect(0, 0, W, H / 4), rect(0, 3 * H / 4, W, H / 4)), g('#fabd00', 'GOLD', 4, rect(0, H / 4, W, H / 2))] } },
  'COLOMBIA': { ratio: 1.5, build(H) { return [g('#c8102e', 'RED', 3, rect(0, 3 * H / 4, W, H / 4)), g('#003087', 'BLUE', 3, rect(0, H / 2, W, H / 4)), g('#ffcd00', 'GOLD', 4, rect(0, 0, W, H / 2))] } },
  'ECUADOR': { ratio: 1.5, build(H) { return [g('#ed1c24', 'RED', 3, rect(0, 3 * H / 4, W, H / 4)), g('#034ea2', 'BLUE', 3, rect(0, H / 2, W, H / 4)), g('#ffdd00', 'GOLD', 4, rect(0, 0, W, H / 2))] } },
  'GHANA': { ratio: 1.5, build(H) { return [g('#006b3f', 'GREEN', 3, rect(0, 2 * H / 3, W, H / 3)), g('#fcd116', 'GOLD', 3, rect(0, H / 3, W, H / 3)), g('#ce1126', 'RED', 3, rect(0, 0, W, H / 3)), g('#000000', 'STAR', 2, star(W / 2, H / 2, H * 0.14, 5))] } },
  'SENEGAL': { ratio: 1.5, build(H) { return [g('#00853f', 'GREEN', 4, rect(0, 0, W / 3, H)), g('#fdef42', 'YELLOW', 4, rect(W / 3, 0, W / 3, H)), g('#e31b23', 'RED', 4, rect(2 * W / 3, 0, W / 3, H)), g('#00853f', 'STAR', 2, star(W / 2, H / 2, H * 0.14, 5))] } },
  'PARAGUAY': { ratio: 1.818, build(H) { return [g('#0038a8', 'BLUE', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#d52b1e', 'RED', 3, rect(0, 0, W, H / 3))] } },
  'HAITI': { ratio: 1.667, build(H) { return [g('#d21034', 'RED', 3, rect(0, H / 2, W, H / 2)), g('#00209f', 'BLUE', 3, rect(0, 0, W, H / 2))] } },
  'EGYPT': { ratio: 1.5, build(H) { return [g('#000000', 'BLACK', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#ce1126', 'RED', 3, rect(0, 0, W, H / 3))] } },
  'IRAN': { ratio: 1.75, build(H) { return [g('#da0000', 'RED', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#239f40', 'GREEN', 3, rect(0, 0, W, H / 3))] } },
  'IRAQ': { ratio: 1.5, build(H) { return [g('#000000', 'BLACK', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#cd1125', 'RED', 3, rect(0, 0, W, H / 3))] } },
  'UZBEKISTAN': { ratio: 2.0, build(H) { const st = [], rows = [3, 4, 5]
    for (let r = 0; r < 3; r++) for (let c = 0; c < rows[r]; c++) st.push(star(W * 0.17 + c * W * 0.045, H * 0.085 + r * H * 0.075, H * 0.03, 5))
    return [g('#308738', 'GREEN', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#3081f7', 'SKY', 3, rect(0, 0, W, H / 3)),
      g('#ffffff', 'EMBLEM', 2, crescent(W * 0.13, H * 0.165, H * 0.13, H * 0.105, H * 0.06), ...st)] } },
  'ALGERIA': { ratio: 1.5, build(H) { return [g('#006233', 'GREEN', 3, rect(0, 0, W / 2, H)), g('#ffffff', 'WHITE', 3, rect(W / 2, 0, W / 2, H)), g('#d21034', 'EMBLEM', 2, crescent(W / 2, H / 2, H * 0.2, H * 0.16, H * 0.09), star(W * 0.6, H / 2, H * 0.085, 5))] } },
  'CURAÇAO': { ratio: 1.5, build(H) { return [g('#002b7f', 'BLUE', 4, rect(0, 0, W, H)), g('#f9e814', 'YELLOW', 3, rect(0, .625 * H, W, .125 * H)), g('#ffffff', 'STARS', 2, star(W * 0.18, H * 0.30, H * 0.10, 5), star(W * 0.10, H * 0.47, H * 0.066, 5))] } },
  'CAPE VERDE': { ratio: 1.7, build(H) { const cx = W * 0.375, cy = H * 0.5, rr = H * 0.34, st = []
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 10; st.push(star(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, H * 0.05, 5)) }
    return [g('#003893', 'BLUE', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, rect(0, .5 * H, W, .25 * H)), g('#cf2027', 'RED', 2, rect(0, .583 * H, W, .084 * H)), g('#f7d116', 'STARS', 2, ...st)] } },
  'SWITZERLAND': { ratio: 1.0, build(H) { return [g('#d52b1e', 'RED', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, rect(W * .4, H * .18, W * .2, H * .64), rect(W * .18, H * .4, W * .64, H * .2))] } },
  'SWEDEN': { ratio: 1.6, build(H) { return [g('#006aa7', 'BLUE', 4, rect(0, 0, W, H)), g('#fecc00', 'GOLD', 3, rect(W * .3125 - H * .1, 0, H * .2, H), rect(0, H / 2 - H * .1, W, H * .2))] } },
  'NORWAY': { ratio: 1.375, build(H) { const nc = (aw) => [rect(W * .3125 - aw / 2, 0, aw, H), rect(0, H / 2 - aw / 2, W, aw)]
    return [g('#ba0c2f', 'RED', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, ...nc(H * .28)), g('#00205b', 'BLUE', 2, ...nc(H * .12))] } },
  'ENGLAND': { ratio: 1.667, build(H) { return [g('#ffffff', 'WHITE', 4, rect(0, 0, W, H)), g('#ce1124', 'RED', 3, rect(W / 2 - H * .1, 0, H * .2, H), rect(0, H / 2 - H * .1, W, H * .2))] } },
  'SCOTLAND': { ratio: 1.667, build(H) { return [g('#0065bd', 'BLUE', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, band(0, 0, W, H, H * .13), band(W, 0, 0, H, H * .13))] } },
  'CZECHIA': { ratio: 1.5, build(H) { return [g('#ffffff', 'WHITE', 3, rect(0, 0, W, H / 2)), g('#d7141a', 'RED', 3, rect(0, H / 2, W, H / 2)), g('#11457e', 'BLUE', 3, poly([[0, 0], [W * .5, H / 2], [0, H]]))] } },
  'QATAR': { ratio: 2.545, build(H) { const N = 18, base = .27 * W, tip = .33 * W, p = [[0, 0]]
    for (let i = 0; i <= N; i++) p.push([(i % 2 ? tip : base), i / N * H]); p.push([0, H])
    return [g('#8a1538', 'MAROON', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, poly(p))] } },
  'JAPAN': { ratio: 1.5, build(H) { return [g('#ffffff', 'WHITE', 4, rect(0, 0, W, H)), g('#bc002d', 'RED', 3, disc(W / 2, H / 2, H * .3))] } },
  'TUNISIA': { ratio: 1.5, build(H) { return [g('#e70013', 'RED', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, disc(W / 2, H / 2, H * .3)), g('#e70013', 'EMBLEM', 2, crescent(W * 0.52, H / 2, H * 0.17, H * 0.135, H * 0.085), star(W * 0.55, H / 2, H * 0.08, 5))] } },
  'MOROCCO': { ratio: 1.5, build(H) { return [g('#c1272d', 'RED', 4, rect(0, 0, W, H)), g('#006233', 'STAR', 2, star(W / 2, H / 2, H * 0.22, 5))] } },
  'TÜRKIYE': { ratio: 1.5, build(H) { return [g('#e30a17', 'RED', 4, rect(0, 0, W, H)), g('#ffffff', 'EMBLEM', 2, crescent(W * 0.38, H / 2, H * 0.22, H * 0.175, H * 0.11), star(W * 0.55, H / 2, H * 0.105, 5))] } },
  'JORDAN': { ratio: 2.0, build(H) { return [g('#000000', 'BLACK', 3, rect(0, 0, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#007a3d', 'GREEN', 3, rect(0, 2 * H / 3, W, H / 3)), g('#ce1126', 'RED', 3, poly([[0, 0], [W * .4, H / 2], [0, H]])), g('#ffffff', 'STAR', 2, star(W * .16, H * .5, H * .1, 7))] } },
  'PANAMA': { ratio: 1.5, build(H) { return [g('#ffffff', 'WHITE', 4, rect(0, 0, W / 2, H / 2), rect(W / 2, H / 2, W / 2, H / 2)), g('#d21034', 'RED', 3, rect(W / 2, 0, W / 2, H / 2), star(W * .75, H * .75, H * .16, 5)), g('#005293', 'BLUE', 3, rect(0, H / 2, W / 2, H / 2), star(W * .25, H * .25, H * .16, 5))] } },
  'DR CONGO': { ratio: 1.333, build(H) { return [g('#007fff', 'SKY', 4, rect(0, 0, W, H)), g('#f7d618', 'GOLD', 3, band(0, H, W, 0, H * .12)), g('#ce1021', 'RED', 2, band(0, H, W, 0, H * .06)), g('#f7d618', 'STAR', 2, star(W * .16, H * .16, H * .1, 5))] } },
  'NEW ZEALAND': { ratio: 2.0, build(H) { const cw = W / 2, ch = H / 2, uj = unionJack(cw, ch)
    const st = [star(W * .75, H * .32, H * .07, 5), star(W * .83, H * .5, H * .09, 5), star(W * .73, H * .62, H * .06, 5), star(W * .66, H * .78, H * .08, 5)]
    return [g('#012169', 'NAVY', 4, rect(0, 0, W, H)), g('#ffffff', 'WHITE', 3, ...uj.white), g('#c8102e', 'RED', 3, ...uj.red, ...st)] } },
  'SOUTH AFRICA': { ratio: 1.5, build(H) { return [g('#e03c31', 'RED', 3, rect(0, 0, W, H / 2)), g('#001489', 'BLUE', 3, rect(0, H / 2, W, H / 2)),
    g('#007749', 'GREEN', 3, band(0, H * .18, W * .5, H * .5, H * .1), band(0, H * .82, W * .5, H * .5, H * .1), rect(W * .4, H * .4, W * .6, H * .2)), g('#000000', 'BLACK', 2, poly([[0, 0], [W * .32, H / 2], [0, H]]))] } },
  'BRAZIL': { ratio: 1.4286, build(H) { return [g('#009b3a', 'GREEN', 4, rect(0, 0, W, H)), g('#ffdf00', 'GOLD', 3, poly([[W / 2, H * .08], [W * .92, H / 2], [W / 2, H * .92], [W * .08, H / 2]])), g('#002776', 'BLUE', 2, disc(W / 2, H / 2, H * .2))] } },
  'ARGENTINA': { ratio: 1.6, build(H) { return [g('#74acdf', 'SKY', 4, rect(0, 0, W, H / 3), rect(0, 2 * H / 3, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3))] } },
  'URUGUAY': { ratio: 1.5, build(H) { const sh = H / 9, white = [], blue = []
    for (let i = 0; i < 9; i++) { const y = i * sh; (i % 2 === 0 ? white : blue).push(rect(0, y, W, sh)) }
    return [g('#ffffff', 'WHITE', 4, ...white, rect(0, 0, W / 3, sh * 4)), g('#0038a8', 'BLUE', 3, ...blue)] } },
  'PORTUGAL': { ratio: 1.5, build(H) { return [g('#006600', 'GREEN', 3, rect(0, 0, W * .4, H)), g('#ff0000', 'RED', 4, rect(W * .4, 0, W * .6, H))] } },
  'CROATIA': { ratio: 2.0, build(H) { return [g('#ff0000', 'RED', 3, rect(0, 0, W, H / 3)), g('#ffffff', 'WHITE', 3, rect(0, H / 3, W, H / 3)), g('#171796', 'BLUE', 3, rect(0, 2 * H / 3, W, H / 3))] } },
  'SOUTH KOREA': { ratio: 1.5, build(H) { const tg = taegeuk(W / 2, H / 2, H * 0.25, -Math.atan2(13.313, 19.97))
    return [g('#ffffff', 'WHITE', 4, rect(0, 0, W, H)), g('#cd2e3a', 'RED', 2, tg.red), g('#0047a0', 'BLUE', 2, tg.blue)] } },
  'CANADA': { ratio: 2.0, build(H) { return [g('#ff0000', 'RED', 4, rect(0, 0, W / 4, H), rect(3 * W / 4, 0, W / 4, H)), g('#ffffff', 'WHITE', 3, rect(W / 4, 0, W / 2, H)), g('#ff0000', 'LEAF', 2, mapleLeaf(W / 2, H / 2, H * 0.86 * 0.923, H * 0.86))] } },
  'SAUDI ARABIA': { ratio: 1.5, build(H) { return [g('#006c35', 'GREEN', 5, rect(0, 0, W, H))] } },
}

// normalise a pixel shape (W × H viewbox) to a fractional engine shape
function norm(s, H) {
  return s[0] === 'rect'
    ? { type: 'rect', x: s[1] / W, y: s[2] / H, w: s[3] / W, h: s[4] / H }
    : { type: 'poly', pts: s[1].map(p => [p[0] / W, p[1] / H]) }
}

export const STENCILS = Object.fromEntries(Object.entries(FLAGS).map(([name, def]) => {
  const H = W / def.ratio
  return [name, {
    ratio: def.ratio,
    regions: def.build(H).map(grp => ({
      color: grp.color, label: grp.label, units: grp.units, solid: true,
      shapes: grp.shapes.map(s => norm(s, H)),
    })),
  }]
}))
