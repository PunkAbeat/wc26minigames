// @ts-nocheck
/* HOIST stencils — the "pour the simplified flag" model, ported VERBATIM (same
   geometry math) from the approved feel mock public/mock/stencil.html.

   A stencil decomposes a flag into pour GROUPS (one colour each, in fill order);
   each group is a set of simple SHAPES that fill in sync. Painterly crests that
   can't be poured (e.g. Mexico's eagle) are declared as a `stamp` and fade in.
   The engine fills these shapes with SOLID colour (liquid surface + wobble from
   the existing FR spring sim) and cross-fades to the real official flag on win.

   Shapes are authored in a per-flag pixel viewbox (W=300, H=300/ratio — exactly
   the mock) then normalised to fractional coords; the engine scales them back
   into the frame uniformly (frame aspect === flag ratio), so stars stay round
   and diagonal bands keep a uniform width. */

const W = 300
const rect = (x, y, w, h) => ['rect', x, y, w, h]
const poly = pts => ['poly', pts]
// 5/7-point star centred at (cx,cy), outer radius r (px)
function star(cx, cy, r, pts = 5) {
  const ri = r * 0.44, a = []
  for (let i = 0; i < pts * 2; i++) {
    const rr = i % 2 ? ri : r, an = -Math.PI / 2 + i * Math.PI / pts
    a.push([cx + rr * Math.cos(an), cy + rr * Math.sin(an)])
  }
  return poly(a)
}
// uniform-width band from (x1,y1) to (x2,y2), half-width hw (px) — for saltires
function band(x1, y1, x2, y2, hw) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), px = -dy / L * hw, py = dx / L * hw
  return poly([[x1 + px, y1 + py], [x2 + px, y2 + py], [x2 - px, y2 - py], [x1 - px, y1 - py]])
}

function usStripes(H) {
  const sh = H / 13, cw = 120, ch = sh * 7, red = [], white = []
  for (let i = 0; i < 13; i++) {
    const y = i * sh, beside = i < 7, x = beside ? cw : 0, w = beside ? W - cw : W
    ;(i % 2 === 0 ? red : white).push(rect(x, y, w, sh))
  }
  return { red, white, canton: [rect(0, 0, cw, ch)] }
}
function unionJack(cw, ch) {
  const white = [band(0, 0, cw, ch, 9), band(cw, 0, 0, ch, 9),
                 rect(cw / 2 - 12, 0, 24, ch), rect(0, ch / 2 - 12, cw, 24)]
  const red = [band(0, 0, cw, ch, 4), band(cw, 0, 0, ch, 4),
               rect(cw / 2 - 6, 0, 12, ch), rect(0, ch / 2 - 6, cw, 12)]
  return { white, red }
}

// each entry: ratio, groups [{ color,label,units, shapes }], optional stamp { after, clip }
const RAW = {
  'UNITED STATES': { ratio: 1.9, build(H) {
    const s = usStripes(H)
    return { groups: [
      { color: '#b31942', label: 'RED',   units: 4, shapes: s.red },
      { color: '#f4f4f4', label: 'WHITE', units: 3, shapes: s.white },
      { color: '#0a3161', label: 'NAVY',  units: 3, shapes: s.canton }, // 50 stars via cross-fade
    ] }
  } },
  'BOSNIA & H.': { ratio: 2, build(H) {
    const sx = W / 16, sy = H / 8, stars = []
    for (let i = 0; i < 9; i++) stars.push(star((2.8 + i) * sx, i * sy, sx * 0.46, 5))
    return { groups: [
      { color: '#002395', label: 'NAVY',  units: 4, shapes: [rect(0, 0, W, H)] },
      { color: '#fecb00', label: 'GOLD',  units: 3, shapes: [poly([[.265 * W, 0], [.765 * W, 0], [.765 * W, H]])] },
      { color: '#f4f4f4', label: 'STARS', units: 2, shapes: stars },
    ] }
  } },
  'MEXICO': { ratio: 1.75, build() {
    return { groups: [
      { color: '#006847', label: 'GREEN', units: 4, shapes: [rect(0, 0, W / 3, 'H')] },
      { color: '#f4f4f4', label: 'WHITE', units: 4, shapes: [rect(W / 3, 0, W / 3, 'H')] },
      { color: '#ce1126', label: 'RED',   units: 4, shapes: [rect(2 * W / 3, 0, W / 3, 'H')] },
    ], stamp: { after: 1, shape: { type: 'rect', x: 1 / 3, y: 0, w: 1 / 3, h: 1 } } }
  } },
  'AUSTRALIA': { ratio: 2, build(H) {
    const cw = W / 2, ch = H / 2, uj = unionJack(cw, ch)
    const stars = [star(W / 4, H * 0.75, 12, 7),
      star(W * 0.75, H * 0.833, 9, 7), star(W * 0.625, H * 0.4375, 9, 7),
      star(W * 0.75, H * 0.1667, 9, 7), star(W * 0.861, H * 0.371, 9, 7), star(W * 0.8, H * 0.5417, 5, 5)]
    return { groups: [
      { color: '#012169', label: 'NAVY',  units: 4, shapes: [rect(0, 0, W, H)] },
      { color: '#f4f4f4', label: 'WHITE', units: 4, shapes: [...uj.white, ...stars] },
      { color: '#e4002b', label: 'RED',   units: 3, shapes: uj.red },
    ] }
  } },
}

// normalise a pixel shape (in W × H viewbox) to a fractional engine shape
function norm(s, H) {
  if (s[0] === 'rect') return { type: 'rect', x: s[1] / W, y: (s[2] === 'H' ? 0 : s[2]) / H,
                                w: s[3] / W, h: (s[4] === 'H' ? H : s[4]) / H }
  return { type: 'poly', pts: s[1].map(p => [p[0] / W, p[1] / H]) }
}

/* Engine-ready stencils keyed by flag name. Each is:
   { ratio, regions:[{color,label,units,shapes,solid:true}], stamp? } where the
   regions array drops straight into a flag's puzzle/fill pipeline. */
export const STENCILS = Object.fromEntries(Object.entries(RAW).map(([name, def]) => {
  const H = W / def.ratio
  const out = def.build(H)
  return [name, {
    ratio: def.ratio,
    stamp: out.stamp || null,
    regions: out.groups.map(g => ({
      color: g.color, label: g.label, units: g.units, solid: true,
      shapes: g.shapes.map(s => norm(s, H)),
    })),
  }]
}))
