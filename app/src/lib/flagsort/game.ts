// @ts-nocheck
/* FLAG SORT engine — ported VERBATIM from public/mock/flagsort.html (the feel
   reference). Imperative canvas liquid sim; do NOT "Reactify" it — the feel was
   tuned over several iterations. The route mounts it into a root element and
   passes { onSolve, solved } so React owns campaign progress.
   @ts-nocheck: hand-tuned vanilla canvas code, not worth typing. */
export function mountFlagSort(root, opts = {}) {

  const $ = s => root.querySelector(s);
  // A flag is a list of REGIONS in fill order; each region is a liquid tank
  // shaped as a band / column / disc / cross / triangle / diagonal / diamond.
  // shape coords are fractions of the frame. Contiguous-surface shapes are
  // POURED (their colour is part of the puzzle); fiddly emblems (stars,
  // crescents, eagles, crests) are EMOJI STAMPS shown on completion —
  // stylised, not the official arms. junk colours never enter the flag.
  const U = 3;                            // default units per region
  const reg = (p, units, shape) => ({ color: p[0], label: p[1], units, shape });
  // colours given in FILL ORDER: H = bottom-to-top, V = left-to-right
  const H = (cols, u = U) => cols.map((c, i) => reg(c, u,
    { type: "rect", x: 0, y: (cols.length - 1 - i) / cols.length, w: 1, h: 1 / cols.length }));
  const V = (cols, u = U) => cols.map((c, i) => reg(c, u,
    { type: "rect", x: i / cols.length, y: 0, w: 1 / cols.length, h: 1 }));
  const FIELD = (c, u = 4) => reg(c, u, { type: "rect", x: 0, y: 0, w: 1, h: 1 });
  const BAND  = (c, y, h, u = U) => reg(c, u, { type: "rect", x: 0, y, w: 1, h });
  const BOX   = (c, x, y, w, h, u = U) => reg(c, u, { type: "rect", x, y, w, h });
  const DISC  = (c, u = U, cx = .5, cy = .5, r = .3) => reg(c, u, { type: "circle", cx, cy, r });
  const POLY  = (c, pts, u = U) => reg(c, u, { type: "poly", pts });
  const plusPts = (vx, hy, tx, ty) => { const a = vx - tx / 2, b = vx + tx / 2, c = hy - ty / 2, d = hy + ty / 2;
    return [[a,0],[b,0],[b,c],[1,c],[1,d],[b,d],[b,1],[a,1],[a,d],[0,d],[0,c],[a,c]]; };
  const CROSS = (c, vx = .5, u = U) => POLY(c, plusPts(vx, .5, .18, .28), u);   // centred / Nordic plus
  const TRI   = (c, pts, u = U) => POLY(c, pts, u);
  // colour pairs [hex, label]
  const r=["#d7141a","RED"], w=["#f4f4f4","WHITE"], k=["#222222","BLACK"], g=["#0a8a3e","GREEN"],
        y=["#f5c518","GOLD"], b=["#1d4ed8","BLUE"], s=["#5aa6e0","SKY"], n=["#0a2f6b","NAVY"],
        o=["#ff7a00","ORANGE"], m=["#7a1533","MAROON"];
  const saltA = [[0,0],[.18,0],[1,.82],[1,1],[.82,1],[0,.18]];   // ╲ bar
  const saltB = [[1,0],[1,.18],[.18,1],[0,1],[0,.82],[.82,0]];   // ╱ bar
  const triH  = [[0,0],[.5,.5],[0,1]];                            // hoist triangle
  const diamond = [[.5,.08],[.92,.5],[.5,.92],[.08,.5]];
  const diagBand = [[0,1],[.34,1],[1,.34],[1,0],[.66,0],[0,.66]]; // corner-to-corner stripe

  // ISO codes → local official SVG (flagcdn, public domain) under /flags/.
  // Used for grid thumbnails + the completion reveal; the geometric region
  // model below stays the puzzle/liquid logic. England/Scotland = GB subdivs.
  const CODE = {
    "MEXICO":"mx","SOUTH AFRICA":"za","SOUTH KOREA":"kr","CZECHIA":"cz","CANADA":"ca",
    "BOSNIA & H.":"ba","QATAR":"qa","SWITZERLAND":"ch","BRAZIL":"br","MOROCCO":"ma",
    "HAITI":"ht","SCOTLAND":"gb-sct","UNITED STATES":"us","PARAGUAY":"py","AUSTRALIA":"au",
    "TÜRKIYE":"tr","GERMANY":"de","CURAÇAO":"cw","IVORY COAST":"ci","ECUADOR":"ec",
    "NETHERLANDS":"nl","JAPAN":"jp","SWEDEN":"se","TUNISIA":"tn","BELGIUM":"be","EGYPT":"eg",
    "IRAN":"ir","NEW ZEALAND":"nz","SPAIN":"es","CAPE VERDE":"cv","SAUDI ARABIA":"sa",
    "URUGUAY":"uy","FRANCE":"fr","SENEGAL":"sn","IRAQ":"iq","NORWAY":"no","ARGENTINA":"ar",
    "ALGERIA":"dz","AUSTRIA":"at","JORDAN":"jo","PORTUGAL":"pt","DR CONGO":"cd",
    "UZBEKISTAN":"uz","COLOMBIA":"co","ENGLAND":"gb-eng","CROATIA":"hr","GHANA":"gh","PANAMA":"pa",
  };
  const flagSrc = name => `/flags/${CODE[name]}.svg`;

  // all 48 qualified nations (groups A–L), sorted into a difficulty ladder below.
  // emb = [emblemKey, fill, pos?] — a crisp inline-SVG emblem drawn ON the flag
  // (see EMBLEMS below). pos {x,y} (fractions) places + shrinks it; default is
  // centred + large. Emblems are deliberate stylisations, not the official arms.
  const FLAGS = [
    /* A */
    { name:"MEXICO", emo:"🇲🇽", tier:2, emb:["eagle","#4f3a1e"], regions: V([g,w,r], 4) },
    { name:"SOUTH AFRICA", emo:"🇿🇦", tier:4, regions: [...H([b,g,r]), TRI(k, triH)] },
    { name:"SOUTH KOREA", emo:"🇰🇷", tier:2, emb:["taegeuk"], regions: [FIELD(w, 5)] },
    { name:"CZECHIA", emo:"🇨🇿", tier:3, regions: [...H([r,w]), TRI(b, triH)] },
    /* B */
    { name:"CANADA", emo:"🇨🇦", tier:2, emb:["maple","#d52b1e"], regions: V([r,w,r], 4) },
    { name:"BOSNIA & H.", emo:"🇧🇦", tier:3, emb:["star","#fff",{x:.54,y:.5}], regions: [FIELD(n), TRI(y, [[.3,0],[.78,0],[.3,1]])] },
    { name:"QATAR", emo:"🇶🇦", tier:2, regions: [BOX(w,0,0,.3,1), BOX(m,.3,0,.7,1,4)] },
    { name:"SWITZERLAND", emo:"🇨🇭", tier:2, regions: [FIELD(r), CROSS(w)] },
    /* C */
    { name:"BRAZIL", emo:"🇧🇷", tier:3, regions: [FIELD(g), POLY(y, diamond), DISC(b, U, .5, .5, .17)] },
    { name:"MOROCCO", emo:"🇲🇦", tier:2, emb:["star5o","#0a6b35"], regions: [FIELD(r)] },
    { name:"HAITI", emo:"🇭🇹", tier:2, emb:["shield","#d21034"], regions: H([r,n]) },
    { name:"SCOTLAND", emo:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", tier:3, regions: [FIELD(b), POLY(w, saltA), POLY(w, saltB)] },
    /* D */
    { name:"UNITED STATES", emo:"🇺🇸", tier:4, emb:["starsGrid","#fff",{x:.2,y:.25}],
      regions: [FIELD(r), BAND(w,.42,.16), BOX(n,0,0,.4,.5)] },
    { name:"PARAGUAY", emo:"🇵🇾", tier:3, emb:["wreathStar","#1d8a3a"], regions: H([n,w,r]) },
    { name:"AUSTRALIA", emo:"🇦🇺", tier:4, emb:["southernCross","#fff"], regions: [FIELD(n, 5)] },
    { name:"TÜRKIYE", emo:"🇹🇷", tier:2, emb:["crescent","#fff"], regions: [FIELD(r)] },
    /* E */
    { name:"GERMANY", emo:"🇩🇪", tier:1, regions: H([y,r,k]) },
    { name:"CURAÇAO", emo:"🇨🇼", tier:3, emb:["star","#fff",{x:.27,y:.34}], regions: [FIELD(n), BAND(y,.62,.18)] },
    { name:"IVORY COAST", emo:"🇨🇮", tier:1, regions: V([o,w,g], 4) },
    { name:"ECUADOR", emo:"🇪🇨", tier:3, emb:["eagle","#6e5320"], regions: [BAND(r,.75,.25), BAND(b,.5,.25), BAND(y,0,.5,4)] },
    /* F */
    { name:"NETHERLANDS", emo:"🇳🇱", tier:1, regions: H([b,w,r], 4) },
    { name:"JAPAN", emo:"🇯🇵", tier:2, regions: [FIELD(w, 6), DISC(r, 4, .5, .5, .3)] },
    { name:"SWEDEN", emo:"🇸🇪", tier:2, regions: [FIELD(b), CROSS(y, .36)] },
    { name:"TUNISIA", emo:"🇹🇳", tier:3, emb:["crescent","#e70013"], regions: [FIELD(r), DISC(w, U, .5, .5, .26)] },
    /* G */
    { name:"BELGIUM", emo:"🇧🇪", tier:1, regions: V([k,y,r], 4) },
    { name:"EGYPT", emo:"🇪🇬", tier:2, emb:["eagle","#c8a13a"], regions: H([k,w,r]) },
    { name:"IRAN", emo:"🇮🇷", tier:2, regions: H([r,w,g]) },
    { name:"NEW ZEALAND", emo:"🇳🇿", tier:4, emb:["southernCross","#e4002b"], regions: [FIELD(n, 5)] },
    /* H */
    { name:"SPAIN", emo:"🇪🇸", tier:2, emb:["shield","#ad1519",{x:.33,y:.5}], regions: H([r,y,r], 4) },
    { name:"CAPE VERDE", emo:"🇨🇻", tier:3, emb:["ringStars","#fff"], regions: [FIELD(n), BAND(r,.6,.12)] },
    { name:"SAUDI ARABIA", emo:"🇸🇦", tier:2, emb:["sword","#fff"], regions: [FIELD(g, 5)] },
    { name:"URUGUAY", emo:"🇺🇾", tier:4, emb:["sun","#d8a93b",{x:.2,y:.2}],
      regions: [FIELD(w, 5), BAND(s,.22,.12), BAND(s,.55,.12), BOX(w,0,0,.4,.4)] },
    /* I */
    { name:"FRANCE", emo:"🇫🇷", tier:1, regions: V([b,w,r], 4) },
    { name:"SENEGAL", emo:"🇸🇳", tier:2, emb:["star","#0a8a3e"], regions: V([g,y,r], 4) },
    { name:"IRAQ", emo:"🇮🇶", tier:2, regions: H([k,w,r]) },
    { name:"NORWAY", emo:"🇳🇴", tier:3, regions: [FIELD(r), CROSS(w, .36), CROSS(b, .36)] },
    /* J */
    { name:"ARGENTINA", emo:"🇦🇷", tier:2, emb:["sun","#d8a93b"], regions: H([s,w,s], 4) },
    { name:"ALGERIA", emo:"🇩🇿", tier:2, emb:["crescent","#d21034",{x:.5,y:.5}], regions: V([g,w]) },
    { name:"AUSTRIA", emo:"🇦🇹", tier:1, regions: H([r,w,r], 4) },
    { name:"JORDAN", emo:"🇯🇴", tier:3, emb:["star7","#fff",{x:.16,y:.5}], regions: [...H([g,w,k]), TRI(r, triH)] },
    /* K */
    { name:"PORTUGAL", emo:"🇵🇹", tier:3, emb:["shield","#fff",{x:.4,y:.5}], regions: [BOX(g,0,0,.4,1,4), BOX(r,.4,0,.6,1,4)] },
    { name:"DR CONGO", emo:"🇨🇩", tier:3, emb:["star","#f7d618",{x:.18,y:.22}], regions: [FIELD(s), POLY(r, diagBand)] },
    { name:"UZBEKISTAN", emo:"🇺🇿", tier:3, emb:["crescent","#fff",{x:.26,y:.3}], regions: H([g,w,s]) },
    { name:"COLOMBIA", emo:"🇨🇴", tier:2, regions: [BAND(r,.75,.25), BAND(b,.5,.25), BAND(y,0,.5,4)] },
    /* L */
    { name:"ENGLAND", emo:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier:2, regions: [FIELD(w, 5), CROSS(r)] },
    { name:"CROATIA", emo:"🇭🇷", tier:3, emb:["shield","#d52b1e"], regions: H([b,w,r]) },
    { name:"GHANA", emo:"🇬🇭", tier:2, emb:["star","#111"], regions: H([g,y,r]) },
    { name:"PANAMA", emo:"🇵🇦", tier:4, emb:["star","#1c4fb0",{x:.25,y:.25}], regions: [BOX(w,0,0,.5,.5), BOX(r,.5,0,.5,.5), BOX(n,0,.5,.5,.5), BOX(w,.5,.5,.5,.5)] },
  ];
  // SAUDI ARABIA: the shahada and sword are intentionally NOT depicted — the
  // creed is sacred script, inappropriate to render as pourable liquid. The
  // tile is the plain green field with a stylised sword emblem only.

  // ---------- emblem library (crisp inline SVG, identical on every device) ----
  // every emblem draws inside a 0 0 100 100 viewBox; `c` is the requested fill.
  const PI = Math.PI;
  const pts = a => a.map(p => p.map(n => +n.toFixed(2)).join(",")).join(" ");
  // n-point star, outer radius ro, inner ratio k, rotated so a point faces up
  const starPolyPts = (cx, cy, ro, n = 5, k = .382, rot = -PI / 2) => {
    const out = [];
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ro : ro * 1, rr = i % 2 ? ro * k : ro;
      const a = rot + i * PI / n;
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    return pts(out);
  };
  const starPoly = (cx, cy, ro, c, n = 5, k = .382, rot = -PI / 2) =>
    `<polygon points="${starPolyPts(cx, cy, ro, n, k, rot)}" fill="${c}"/>`;
  // sun-of-may: core disc + alternating straight/wavy triangular rays + a face
  function sunSVG(c) {
    const cx = 50, cy = 50, ri = 22, ro = 47, n = 16; let rays = "";
    for (let i = 0; i < n; i++) {
      const a = i / n * 2 * PI;
      const p1 = [cx + ri * Math.cos(a - .085), cy + ri * Math.sin(a - .085)];
      const p2 = [cx + ro * Math.cos(a), cy + ro * Math.sin(a)];
      const p3 = [cx + ri * Math.cos(a + .085), cy + ri * Math.sin(a + .085)];
      rays += `<polygon points="${pts([p1, p2, p3])}" fill="${c}"/>`;
    }
    const ink = "rgba(0,0,0,.42)";
    const face = `<circle cx="43" cy="46" r="2.6" fill="${ink}"/>` +
      `<circle cx="57" cy="46" r="2.6" fill="${ink}"/>` +
      `<path d="M42 56 Q50 63 58 56" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    return `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="${c}"/>${rays}${face}`;
  }
  // crescent (opening to the fly) + a small five-point star in the opening
  const crescentSVG = c =>
    `<path d="M63 14 A36 36 0 1 0 63 86 A28 28 0 1 1 63 14 Z" fill="${c}"/>` +
    starPoly(76, 50, 15, c);
  // taegeuk (Korean) — red over blue with the S-divider + four black trigrams
  function taegeukSVG() {
    const red = "#cd2e3a", blue = "#0047a0", cx = 50, cy = 50, R = 30;
    const yy = `<path d="M${cx - R} ${cy} A${R / 2} ${R / 2} 0 0 1 ${cx} ${cy} ` +
      `A${R / 2} ${R / 2} 0 0 0 ${cx + R} ${cy} A${R} ${R} 0 0 0 ${cx - R} ${cy} Z" fill="${red}"/>` +
      `<path d="M${cx - R} ${cy} A${R / 2} ${R / 2} 0 0 0 ${cx} ${cy} ` +
      `A${R / 2} ${R / 2} 0 0 1 ${cx + R} ${cy} A${R} ${R} 0 0 1 ${cx - R} ${cy} Z" fill="${blue}"/>`;
    // four trigrams on the diagonals; tri = [solid?,solid?,solid?] outer→inner
    const tri = (ang, bars) => {
      const ux = Math.cos(ang), uy = Math.sin(ang);       // pointing outward
      const px = -uy, py = ux;                            // bar long-axis
      let g = "";
      bars.forEach((solid, b) => {
        const d = 40 + b * 7, hl = 11;                    // distance, half-length
        const mx = cx + ux * d, my = cy + uy * d;
        const seg = (s, e) => `<line x1="${mx + px * s}" y1="${my + py * s}" ` +
          `x2="${mx + px * e}" y2="${my + py * e}" stroke="#111" stroke-width="3.4" stroke-linecap="round"/>`;
        g += solid ? seg(-hl, hl) : seg(-hl, -3) + seg(3, hl);
      });
      return g;
    };
    return `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none"/>${yy}` +
      tri(-3 * PI / 4, [1, 1, 1]) + tri(3 * PI / 4, [1, 0, 1]) +
      tri(-PI / 4, [1, 0, 1]) + tri(PI / 4, [0, 0, 0]);
  }
  // bold maple leaf (Canada) — single symmetric path
  const mapleSVG = c => `<path fill="${c}" d="M50 6 L54.5 30 L67 24 L63 41 L82 39 L72 52 ` +
    `L92 60 L68 64 L72 74 L55 70 L57 94 L50 84 L43 94 L45 70 L28 74 L32 64 L8 60 ` +
    `L28 52 L18 39 L37 41 L33 24 L45.5 30 Z"/>`;
  // generic heraldic shield with a soft inner highlight
  const shieldSVG = c =>
    `<path fill="${c}" d="M50 10 L80 18 L80 48 Q80 78 50 92 Q20 78 20 48 L20 18 Z"/>` +
    `<path fill="rgba(255,255,255,.18)" d="M50 16 L74 22 L74 47 Q74 72 50 84 Z"/>`;
  // single sabre, hilt to the fly (Saudi) — blade + guard + grip + pommel
  const swordSVG = c =>
    `<path fill="${c}" d="M10 51 L70 47.5 L70 54.5 L10 53 Z"/>` +
    `<rect x="70" y="40" width="5" height="22" rx="2" fill="${c}"/>` +
    `<rect x="76" y="47" width="13" height="8" rx="3" fill="${c}"/>` +
    `<circle cx="92" cy="51" r="4.5" fill="${c}"/>`;
  // Southern Cross constellation (AU/NZ) — four big stars + one small
  const southernCrossSVG = c =>
    starPoly(50, 20, 11, c) + starPoly(50, 80, 13, c) +
    starPoly(24, 52, 11, c) + starPoly(74, 48, 11, c) + starPoly(56, 60, 6, c);
  // canton star grid (USA)
  function starsGridSVG(c) {
    let g = "";
    for (let r = 0; r < 4; r++) for (let col = 0; col < 5; col++)
      g += starPoly(14 + col * 18 + (r % 2 ? 9 : 0), 16 + r * 22, 6.5, c);
    return g;
  }
  // ring of small stars (Cape Verde)
  function ringStarsSVG(c) {
    let g = ""; const N = 10;
    for (let i = 0; i < N; i++) {
      const a = -PI / 2 + i / N * 2 * PI;
      g += starPoly(50 + 34 * Math.cos(a), 50 + 34 * Math.sin(a), 7, c);
    }
    return g;
  }
  // star inside an open laurel-style ring (Paraguay)
  const wreathStarSVG = c =>
    `<circle cx="50" cy="50" r="40" fill="none" stroke="${c}" stroke-width="7"/>` +
    `<circle cx="50" cy="50" r="40" fill="none" stroke="${c}" stroke-width="13" ` +
    `stroke-dasharray="9 7" stroke-linecap="round" opacity=".85"/>` + starPoly(50, 51, 20, "#d62828");
  // stylised heraldic spread-eagle, built from mirrored geometric parts
  function eagleSVG(c) {
    const mir = a => a.map(([x, y]) => [100 - x, y]);
    const poly = a => `<polygon points="${pts(a)}" fill="${c}"/>`;
    const wing = [[52, 36], [70, 30], [88, 30], [80, 38], [92, 44], [78, 48],
                  [90, 56], [70, 56], [54, 54]];
    return poly(wing) + poly(mir(wing)) +
      poly([[46, 33], [54, 33], [52.5, 64], [47.5, 64]]) +          // body
      poly([[47, 60], [53, 60], [62, 82], [50, 74], [38, 82]]) +    // fanned tail
      `<circle cx="50" cy="27" r="6.4" fill="${c}"/>` +
      poly([[55, 24], [66, 28], [55, 31]]);                          // beak
  }
  const EMBLEMS = {
    star:          c => starPoly(50, 52, 46, c),
    star5o:        c => starPoly(50, 52, 46, c, 5, .382) +
                        `<polygon points="${starPolyPts(50, 52, 26, 5, .382)}" fill="#e2241a"/>`,
    star7:         c => starPoly(50, 52, 46, c, 7, .55),
    sun:           sunSVG,
    crescent:      crescentSVG,
    taegeuk:       () => taegeukSVG(),
    maple:         mapleSVG,
    shield:        shieldSVG,
    sword:         swordSVG,
    southernCross: southernCrossSVG,
    starsGrid:     starsGridSVG,
    ringStars:     ringStarsSVG,
    wreathStar:    wreathStarSVG,
    eagle:         eagleSVG,
  };
  const embSVG = (key, c) =>
    `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">${(EMBLEMS[key] || EMBLEMS.star)(c)}</svg>`;

  // difficulty normalisation: every flag aims at the same total colour count
  // per tier, so a 1-colour flag (Morocco) gets more junk than a 3-colour one.
  const JUNKPOOL = ["#2563eb","#16a34a","#9333ea","#f59e0b","#0d9488","#ec4899","#7c3aed","#a16207"];
  const hex2rgb = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
  const cdist = (a,b) => { const x=hex2rgb(a), z=hex2rgb(b); return Math.hypot(x[0]-z[0],x[1]-z[1],x[2]-z[2]); };
  function deriveLevel(flag) {
    const cols = [...new Set(flag.regions.map(rg => rg.color))];
    const target = [, 4, 5, 6, 7][flag.tier];
    const junk = JUNKPOOL.filter(j => cols.every(c => cdist(c, j) > 80))
      .slice(0, Math.max(0, Math.min(4, target - cols.length)));
    return { ...flag, junk, spares: flag.tier <= 2 ? 1 : 2 };
  }
  const LEVELS = FLAGS.map((f, i) => ({ ...f, ord: i }))
    .sort((a, b) => a.tier - b.tier || a.ord - b.ord).map(deriveLevel);

  const CAP = 4, NSPRING = 6;
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let li = 0, L, seq, label, tubes, f, hist, sel = -1, busy = false, deal0;
  let T = [], anim = null, parts = [], paused = false;
  let rafId = 0, killed = false;
  const DEBUG = false;
  const solved = opts.solved || new Set();        // campaign progress (owned by the route)

  const sm = t => t * t * (3 - 2 * t);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---------- solver (unchanged from v1): every deal is winnable ----------
  function solvable(t0, sq) {
    const seen = new Set();
    const key = (t, g) => t.map(x => x.join(",")).sort().join("|") + "#" + g;
    function dfs(t, g) {
      if (g === sq.length) return true;
      const k = key(t, g);
      if (seen.has(k) || seen.size > 200000) return false;
      seen.add(k);
      for (let i = 0; i < t.length; i++) {
        const a = t[i]; if (!a.length) continue;
        const c = a[a.length - 1];
        if (c !== sq[g]) continue;
        let run = 0; for (let j = a.length - 1; j >= 0 && a[j] === c; j--) run++;
        let acc = 0; while (acc < run && sq[g + acc] === c) acc++;
        const nt = t.map(x => x.slice()); nt[i] = a.slice(0, a.length - acc);
        if (dfs(nt, g + acc)) return true;
      }
      for (let i = 0; i < t.length; i++) {
        const a = t[i]; if (!a.length) continue;
        const c = a[a.length - 1];
        let run = 0; for (let j = a.length - 1; j >= 0 && a[j] === c; j--) run++;
        let usedEmpty = false;
        for (let d = 0; d < t.length; d++) {
          if (d === i) continue;
          const b = t[d];
          if (b.length && b[b.length - 1] !== c) continue;
          if (!b.length) {
            if (usedEmpty || run === a.length) continue; // empties are symmetric
            usedEmpty = true;
          }
          const space = CAP - b.length; if (!space) continue;
          const m = Math.min(run, space);
          const nt = t.map(x => x.slice());
          nt[d] = b.concat(Array(m).fill(c)); nt[i] = a.slice(0, a.length - m);
          if (dfs(nt, g)) return true;
        }
      }
      return false;
    }
    return dfs(t0.map(x => x.slice()), 0);
  }
  function freshDeal() {
    const pool0 = seq.concat(L.junk.flatMap(c => Array(CAP).fill(c)));
    const nFull = Math.ceil(pool0.length / CAP);
    const sizes = []; let left = pool0.length;
    for (let i = nFull; i > 0; i--) { const s = Math.ceil(left / i); sizes.push(s); left -= s; }
    const chunk = pool => {
      const t = []; let p = 0;
      for (const s of sizes) { t.push(pool.slice(p, p + s)); p += s; }
      for (let i = 0; i < L.spares; i++) t.push([]);
      return t;
    };
    for (let n = 0; n < 200; n++) {
      const t = chunk(shuffle(pool0.slice()));
      if (solvable(t, seq)) return t;
    }
    return chunk(pool0); // layered fallback = trivially solvable
  }

  // ---------- canvas setup ----------
  const liqc = $("#liqc"), fxc = $("#fxc");
  const lctx = liqc.getContext("2d"), fctx = fxc.getContext("2d");
  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const c of [liqc, fxc]) {
      c.width = innerWidth * dpr; c.height = innerHeight * dpr;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
      c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  // ---------- liquid geometry: half-plane volume solve in a tilted tube ----------
  function localPoly(iw, ih, r = 12) {
    const hw = iw / 2, hh = ih / 2;
    return [
      { x: -hw, y: -hh }, { x: hw, y: -hh },
      { x: hw, y: hh - r }, { x: hw - .29 * r, y: hh - .29 * r }, { x: hw - r, y: hh },
      { x: -hw + r, y: hh }, { x: -hw + .29 * r, y: hh - .29 * r }, { x: -hw, y: hh - r },
    ];
  }
  function polyArea(p) {
    let a = 0;
    for (let i = 0; i < p.length; i++) {
      const q = p[(i + 1) % p.length]; a += p[i].x * q.y - q.x * p[i].y;
    }
    return Math.abs(a) / 2;
  }
  function clipBelow(poly, Y) {           // keep screen-space y >= Y
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ain = a.y >= Y, bin = b.y >= Y;
      if (ain) out.push(a);
      if (ain !== bin) {
        const t = (Y - a.y) / (b.y - a.y);
        out.push({ x: a.x + (b.x - a.x) * t, y: Y });
      }
    }
    return out;
  }
  function surfaceFor(poly, target) {     // Y where area below == target
    let lo = Infinity, hi = -Infinity;
    for (const p of poly) { lo = Math.min(lo, p.y); hi = Math.max(hi, p.y); }
    for (let i = 0; i < 22; i++) {
      const mid = (lo + hi) / 2;
      if (polyArea(clipBelow(poly, mid)) > target) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // ---------- per-tube runtime ----------
  function bandsOf(arr) {
    const b = [];
    for (const c of arr) {
      if (b.length && b[b.length - 1].color === c) b[b.length - 1].vol++;
      else b.push({ color: c, vol: 1 });
    }
    return b;
  }
  function rebuildT() {
    T = [];
    root.querySelectorAll(".slot").forEach((slot, i) => {
      const el = slot.firstElementChild;
      el.style.transform = "";
      const r = slot.getBoundingClientRect();
      const iw = r.width - 10, ih = r.height - 10;
      T.push({
        el, slot, cx: r.left + r.width / 2, cy: r.top + r.height / 2, iw, ih,
        poly: localPoly(iw, ih), unitA: polyArea(localPoly(iw, ih)) / CAP,
        pose: { dx: 0, dy: 0, ang: 0 },
        offs: new Array(NSPRING).fill(0), vels: new Array(NSPRING).fill(0),
        bands: bandsOf(tubes[i]), topY: r.top + r.height / 2,
      });
    });
  }
  function remeasure() {                   // slots never carry transforms, so this
    for (const t of T) {                   // is always the true resting position
      const r = t.slot.getBoundingClientRect();
      t.cx = r.left + r.width / 2; t.cy = r.top + r.height / 2;
    }
    if (FR.length && FRrect) {
      const r = $("#frame").getBoundingClientRect();
      if (Math.abs(r.width - FRrect.width) > .5) { rebuildFR(); return; }
      const dx = r.left - FRrect.left, dy = r.top - FRrect.top;
      if (dx || dy) for (const v of FR) { v.cx += dx; v.cy += dy; }
      FRrect = r;
    }
  }
  // each flag REGION is its own vessel (band, column, or disc) rendered by the
  // same liquid system as the tubes; regions fill in L.regions order
  let FR = [], FRrect = null;
  function shapePts(s, W, H) {
    if (s.type === "circle") {
      const pts = [];
      for (let i = 0; i < 20; i++) {
        const a = i / 20 * 2 * Math.PI;
        pts.push({ x: s.cx * W + Math.cos(a) * s.r * H, y: s.cy * H + Math.sin(a) * s.r * H });
      }
      return pts;
    }
    if (s.type === "poly") return s.pts.map(p => ({ x: p[0] * W, y: p[1] * H }));
    return [{ x: s.x * W, y: s.y * H }, { x: (s.x + s.w) * W, y: s.y * H },
            { x: (s.x + s.w) * W, y: (s.y + s.h) * H }, { x: s.x * W, y: (s.y + s.h) * H }];
  }
  // inline CSS to position+clip a region div over the frame (DOM ghost + thumbs)
  function regionCSS(s) {
    if (s.type === "circle")
      return `left:${(s.cx - s.r * 2 / 3) * 100}%;top:${(s.cy - s.r) * 100}%;` +
             `width:${s.r * 4 / 3 * 100}%;height:${s.r * 200}%;border-radius:50%`;
    if (s.type === "poly")
      return `left:0;top:0;width:100%;height:100%;clip-path:polygon(${
        s.pts.map(p => `${p[0] * 100}% ${p[1] * 100}%`).join(",")})`;
    return `left:${s.x * 100}%;top:${s.y * 100}%;width:${s.w * 100}%;height:${s.h * 100}%`;
  }
  // emblem positioning: emb[2] = {x,y} fractions → point-placed + smaller; else
  // centred + large. `--es` is the emblem size as a fraction of the frame.
  const embStyle = fl => {
    const p = fl.emb && fl.emb[2];
    const x = p ? p.x * 100 : 50, y = p ? p.y * 100 : 50, w = p ? 30 : 46;
    return `left:${x}%;top:${y}%;width:${w}%;transform:translate(-50%,-50%)`;
  };
  const embSpan = (fl, cls, id) => fl.emb
    ? `<span class="${cls}"${id ? ` id="${id}"` : ""} style="${embStyle(fl)}">` +
      embSVG(fl.emb[0], fl.emb[1] || "#fff") + `</span>` : "";
  function rebuildFR() {
    const el = $("#frame");
    const r = el.getBoundingClientRect();
    FRrect = r;
    const W = r.width - 8, H = r.height - 8, ox = r.left + 4, oy = r.top + 4;
    let before = 0;
    FR = L.regions.map(reg => {
      const pts = shapePts(reg.shape, W, H);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
                             y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
      const cx = ox + (x0 + x1) / 2, cy = oy + (y0 + y1) / 2;
      const poly = pts.map(p => ({ x: ox + p.x - cx, y: oy + p.y - cy }));
      const v = {
        el, cx, cy, iw: x1 - x0, ih: y1 - y0, poly, unitA: polyArea(poly) / reg.units,
        pose: { dx: 0, dy: 0, ang: 0 },
        offs: new Array(8).fill(0), vels: new Array(8).fill(0),
        bands: [], topY: cy + (y1 - y0) / 2, units: reg.units, color: reg.color, before,
      };
      before += reg.units;
      return v;
    });
    syncFR();
  }
  function syncFR() {
    for (const v of FR) {
      const vol = Math.max(0, Math.min(v.units, f - v.before));
      v.bands = vol > 0 ? [{ color: v.color, vol }] : [];
    }
  }
  function activeIdx() {
    let acc = 0;
    for (let i = 0; i < L.regions.length; i++) {
      if (f < acc + L.regions[i].units) return i;
      acc += L.regions[i].units;
    }
    return -1;
  }
  function worldPoly(t) {
    const c = Math.cos(t.pose.ang), s = Math.sin(t.pose.ang);
    return t.poly.map(p => ({
      x: t.cx + t.pose.dx + p.x * c - p.y * s,
      y: t.cy + t.pose.dy + p.x * s + p.y * c,
    }));
  }
  function excite(t, amt) {
    const i = 1 + Math.floor(Math.random() * (t.offs.length - 2));
    t.vels[i] -= amt * (0.7 + Math.random() * 0.6);
  }

  // ---------- DOM render (game chrome; liquid itself lives on canvas) ----------
  function render() {
    $("#lvl").textContent = `FLAG ${li + 1} / ${LEVELS.length} · ${tubes.length} TUBES`;
    $("#flagname").textContent = `${L.emo} ${L.name}`;
    const fr = $("#frame");
    fr.classList.remove("done", "wave");
    const ai = activeIdx();
    fr.innerHTML = L.regions.map((rg, ri) =>
      `<div class="region${ri === ai ? " need" : ""}" style="${regionCSS(rg.shape)}">
        <div class="ghost" style="background:${rg.color}"></div>
      </div>`).join("") + embSpan(L, "stamp ghost", "stamp");
    const hint = $("#hint");
    if (f < seq.length) {
      hint.style.visibility = "visible";
      hint.innerHTML = `POUR NEXT <span class="sw" style="background:${seq[f]}"></span> ${label[seq[f]]}`;
    } else hint.style.visibility = "hidden";
    const row = $("#row");
    if (!row.children.length)
      row.innerHTML = tubes.map((_, i) =>
        `<div class="slot"><div class="tube" data-i="${i}"></div></div>`).join("");
    root.querySelectorAll(".tube").forEach((el, i) =>
      el.classList.toggle("sel", i === sel));
    $("#undo").disabled = !hist.length;
  }
  const snapshot = () => hist.push({ t: tubes.map(x => x.slice()), f });

  function newLevel(i) {
    paused = false; $("#select").hidden = true;
    li = i; L = LEVELS[i];
    seq = []; label = {};
    for (const reg of L.regions) {
      label[reg.color] = reg.label;
      for (let k = 0; k < reg.units; k++) seq.push(reg.color);
    }
    tubes = freshDeal();
    deal0 = tubes.map(x => x.slice());
    f = 0; hist = []; sel = -1; busy = false; anim = null; parts = [];
    render(); rebuildT(); rebuildFR();
  }
  function resync() {
    T.forEach((t, i) => { t.bands = bandsOf(tubes[i]); });
    syncFR();
  }

  // ---------- pour animation machine ----------
  function startPour(si, dst) {
    const a = tubes[si], c = a[a.length - 1];
    let run = 0; for (let j = a.length - 1; j >= 0 && a[j] === c; j--) run++;
    let m;
    if (dst.type === "tube") m = Math.min(run, CAP - tubes[dst.i].length);
    else { m = 0; while (m < run && seq[f + m] === c) m++; }
    snapshot(); busy = true; sel = -1; render();

    const commit = () => {
      if (dst.type === "tube")
        for (let k = 0; k < m; k++) { a.pop(); tubes[dst.i].push(c); }
      else { for (let k = 0; k < m; k++) a.pop(); f += m; }
      resync(); anim = null; busy = false; render();
      if (f === seq.length) win();
      else if (!movesExist()) stuck();
    };
    // NOTE: the mock animates even under prefers-reduced-motion — its whole
    // purpose is judging the pour. The real game would honor the setting.

    const S = T[si];
    const R = dst.type === "tube" ? T[dst.i] : FR[activeIdx()];  // destination vessel
    // pour over the open top of the frame, not over the region itself
    const landX = R.cx;
    const landTop = dst.type === "tube" ? R.cy - R.ih / 2 : FRrect.top;
    const dir = S.cx <= landX ? 1 : -1;
    const px = landX - dir * S.ih * .42;
    const py = landTop - S.iw * 1.05;
    const baseAng = dir * 97 * Math.PI / 180;
    const srcBand = S.bands[S.bands.length - 1];
    const srcVol0 = srcBand.vol;
    let dstBand, dstVol0 = 0;
    if (R.bands.length && R.bands[R.bands.length - 1].color === c) {
      dstBand = R.bands[R.bands.length - 1]; dstVol0 = dstBand.vol;
    } else { dstBand = { color: c, vol: 0 }; R.bands.push(dstBand); }
    S.el.classList.add("pouring");
    anim = {
      step(now) {
        if (this.t0 === null) this.t0 = now;
        const t = now - this.t0;
        const T1 = 300, T2 = 380 + m * 240, T3 = 280;
        if (t < T1) {
          const k = sm(t / T1);
          S.pose = { dx: (px - S.cx) * k, dy: (py - S.cy) * k, ang: baseAng * k };
        } else if (t < T1 + T2) {
          const pf = (t - T1) / T2;
          this.pouring = true;
          const delivered = m * pf;
          srcBand.vol = Math.max(srcVol0 - delivered, 0.001);
          dstBand.vol = dstVol0 + delivered; excite(R, .5);
          S.pose.ang = baseAng + dir * .22 * pf;
          this.streamEnd = { x: R.cx, y: R.topY - 2 };
          if (Math.random() < .5) parts.push({ type: "drop", x: this.streamEnd.x + (Math.random() - .5) * 8,
            y: this.streamEnd.y, vx: (Math.random() - .5) * 2.4, vy: -(.8 + Math.random() * 1.6),
            life: 26, color: c, r: 1.5 + Math.random() * 1.5 });
          if (Math.random() < .12) parts.push({ type: "ring", x: this.streamEnd.x, y: this.streamEnd.y,
            r: 2, life: 22, color: "rgba(255,255,255,.5)" });
          if (Math.random() < .18) {
            const wp = worldPoly(S); let bx = 0, by = -Infinity;
            for (const p of wp) { bx += p.x / wp.length; by = Math.max(by, p.y); }
            parts.push({ type: "bub", x: bx + (Math.random() - .5) * S.iw * .5, y: by - 6,
              vy: -(.5 + Math.random() * .7), life: 50, tube: si, r: 1.2 + Math.random() * 1.6 });
          }
        } else if (t < T1 + T2 + T3) {
          this.pouring = false;
          srcBand.vol = Math.max(srcVol0 - m, 0.001);
          if (dstBand) dstBand.vol = dstVol0 + m;
          const k = 1 - sm((t - T1 - T2) / T3);
          S.pose = { dx: (px - S.cx) * k, dy: (py - S.cy) * k, ang: (baseAng + dir * .22) * k };
          if (!this.sloshed && k < .4) { this.sloshed = true; excite(S, 2.2); excite(S, 1.4); }
        } else {
          S.pose = { dx: 0, dy: 0, ang: 0 };
          S.el.classList.remove("pouring");
          commit();
        }
      },
      t0: null, si, c, pouring: false, streamEnd: null,
    };
  }

  // ---------- draw loop ----------
  function drawTube(t) {
    const wp = worldPoly(t);
    const total = t.bands.reduce((s, b) => s + b.vol, 0);
    if (total <= 0.002) { t.topY = t.cy + t.ih / 2; return; }
    // cumulative volumes from the top band down — each fill covers the lower part
    const cums = []; let acc = total;
    for (let k = t.bands.length - 1; k >= 0; k--) { cums.push({ color: t.bands[k].color, vol: acc }); acc -= t.bands[k].vol; }
    let topSpan = null, topYline = 0;
    cums.forEach((cv, idx) => {
      const Y = surfaceFor(wp, cv.vol * t.unitA);
      const region = clipBelow(wp, Y);
      if (region.length < 3) return;
      lctx.beginPath();
      region.forEach((p, i) => i ? lctx.lineTo(p.x, p.y) : lctx.moveTo(p.x, p.y));
      lctx.closePath(); lctx.fillStyle = cv.color; lctx.fill();
      if (idx === 0) {
        topYline = Y; t.topY = Y;
        let x0 = Infinity, x1 = -Infinity;
        for (const p of region) if (Math.abs(p.y - Y) < .75) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); }
        if (x1 > x0) topSpan = { x0, x1, color: cv.color };
      }
    });
    // springy surface: bumps in liquid colour, dips erased to show "less"
    if (topSpan) {
      const { x0, x1, color } = topSpan;
      const n = t.offs.length;
      const off = u => {
        const s = u * (n - 1), i = Math.min(Math.floor(s), n - 2), fr = s - i;
        return Math.max(-6, Math.min(6, t.offs[i] * (1 - fr) + t.offs[i + 1] * fr));
      };
      for (const mode of ["up", "down"]) {
        lctx.save();
        if (mode === "down") lctx.globalCompositeOperation = "destination-out";
        lctx.beginPath(); lctx.moveTo(x0, topYline);
        for (let s = 0; s <= 10; s++) {
          const u = s / 10, o = off(u);
          const y = mode === "up" ? topYline - Math.max(o, 0) : topYline + Math.max(-o, 0);
          lctx.lineTo(x0 + (x1 - x0) * u, y);
        }
        lctx.lineTo(x1, topYline); lctx.closePath();
        lctx.fillStyle = color; lctx.fill(); lctx.restore();
      }
      lctx.beginPath();
      for (let s = 0; s <= 10; s++) {
        const u = s / 10, y = topYline - off(u);
        s ? lctx.lineTo(x0 + (x1 - x0) * u, y) : lctx.moveTo(x0, y);
      }
      lctx.strokeStyle = "rgba(255,255,255,.4)"; lctx.lineWidth = 1.5; lctx.stroke();
    }
  }

  function drawStream() {
    if (!anim || !anim.pouring || !anim.streamEnd) return;
    const S = T[anim.si], wp = worldPoly(S);
    let lip = wp[0];
    for (const p of [wp[0], wp[1]]) if (p.y > lip.y) lip = p;
    const e = anim.streamEnd;
    const wob = Math.sin(performance.now() / 55) * .9;
    fctx.beginPath();
    fctx.moveTo(lip.x, lip.y);
    fctx.quadraticCurveTo(lip.x + (e.x - lip.x) * .12, lip.y + (e.y - lip.y) * .5, e.x, e.y);
    fctx.strokeStyle = anim.c; fctx.lineCap = "round"; fctx.lineWidth = 5.5 + wob; fctx.stroke();
    fctx.strokeStyle = "rgba(255,255,255,.35)"; fctx.lineWidth = 1.8; fctx.stroke();
  }

  function stepParts() {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life--;
      if (p.type === "drop") { p.x += p.vx; p.y += p.vy; p.vy += .18; }
      if (p.type === "bub") { p.y += p.vy; if (T[p.tube] && p.y < T[p.tube].topY + 3) p.life = 0; }
      if (p.type === "ring") p.r += 1.1;
      if (p.life <= 0) parts.splice(i, 1);
    }
  }
  function drawParts() {
    for (const p of parts) {
      fctx.globalAlpha = Math.min(1, p.life / 12);
      if (p.type === "ring") {
        fctx.beginPath(); fctx.ellipse(p.x, p.y, p.r, p.r * .35, 0, 0, 7);
        fctx.strokeStyle = p.color; fctx.lineWidth = 1.4; fctx.stroke();
      } else if (p.type === "bub") {
        const t = T[p.tube];
        if (!t) continue;
        fctx.save();
        const wp = worldPoly(t);
        fctx.beginPath(); wp.forEach((q, i) => i ? fctx.lineTo(q.x, q.y) : fctx.moveTo(q.x, q.y));
        fctx.closePath(); fctx.clip();
        fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 7);
        fctx.strokeStyle = "rgba(255,255,255,.55)"; fctx.lineWidth = 1; fctx.stroke();
        fctx.restore();
      } else {
        fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, 7);
        fctx.fillStyle = p.color; fctx.fill();
      }
      fctx.globalAlpha = 1;
    }
  }

  function loop(now) {
    if (killed) return;
    if (paused) {
      lctx.clearRect(0, 0, innerWidth, innerHeight);
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      rafId = requestAnimationFrame(loop); return;
    }
    if (!anim) remeasure();                // self-heal on any layout shift
    if (anim) anim.step(now);
    for (const t of [...T, ...FR]) {
      // surface springs with neighbour spread
      for (let i = 0; i < t.offs.length; i++) {
        const l = t.offs[i - 1] || 0, r = t.offs[i + 1] || 0;
        t.vels[i] += -.055 * t.offs[i] + .16 * (l + r - 2 * t.offs[i]);
        t.vels[i] *= .9;
      }
      for (let i = 0; i < t.offs.length; i++) t.offs[i] += t.vels[i];
    }
    for (const t of T) {
      // selection lift (only when this tube isn't mid-pour)
      if (!anim || anim.si !== T.indexOf(t)) {
        const target = T.indexOf(t) === sel ? -12 : 0;
        t.pose.dy += (target - t.pose.dy) * .3;
        t.pose.dx *= .7; t.pose.ang *= .7;
      }
      const { dx, dy, ang } = t.pose;
      t.el.style.transform = (Math.abs(dx) + Math.abs(dy) + Math.abs(ang) > .01)
        ? `translate(${dx}px,${dy}px) rotate(${ang}rad)` : "";
    }
    stepParts();
    lctx.clearRect(0, 0, innerWidth, innerHeight);
    fctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const t of T) drawTube(t);
    for (const v of FR) drawTube(v);
    if (DEBUG)
      for (const t of T) {
        fctx.fillStyle = "#f0f";
        fctx.fillRect(t.cx - 2, t.cy - 2, 4, 4);
        fctx.strokeStyle = "#f0f";
        fctx.strokeRect(t.cx - t.iw / 2, t.cy - t.ih / 2, t.iw, t.ih);
      }
    drawStream();
    drawParts();
    rafId = requestAnimationFrame(loop);
  }

  // ---------- win / stuck / input ----------
  function movesExist() {
    for (let i = 0; i < tubes.length; i++) {
      const a = tubes[i]; if (!a.length) continue;
      const c = a[a.length - 1];
      if (f < seq.length && c === seq[f]) return true;
      let run = 0; for (let j = a.length - 1; j >= 0 && a[j] === c; j--) run++;
      for (let d = 0; d < tubes.length; d++) {
        if (d === i) continue;
        const b = tubes[d];
        if (b.length >= CAP) continue;
        if (b.length && b[b.length - 1] !== c) continue;
        if (!b.length && run === a.length) continue;   // shuffling a monochrome tube isn't progress
        return true;
      }
    }
    return false;
  }
  function stuck() {
    const b = document.createElement("div");
    b.className = "banner";
    b.innerHTML = `<div class="card"><div class="big">🚫</div>
      <h2>DEAD END</h2><p>No useful moves left.</p>
      <button data-a="u">↩ UNDO</button>
      <button data-a="r" style="background:#14324f;color:#fff;margin-left:8px">↻ RESTART</button></div>`;
    root.appendChild(b);
    b.querySelectorAll("button").forEach(btn => btn.onclick = () => {
      b.remove();
      if (btn.dataset.a === "u" && hist.length) { const h = hist.pop(); tubes = h.t; f = h.f; }
      else { tubes = deal0.map(x => x.slice()); f = 0; hist = []; }
      sel = -1; render(); resync();
    });
  }
  function confetti() {
    const set = [L.emo, "🎉", "⚽", "✨"];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.className = "confetti";
      s.textContent = set[i % set.length];
      s.style.left = Math.random() * 100 + "vw";
      root.appendChild(s);
      s.animate([
        { transform: "translateY(0) rotate(0)", opacity: 1 },
        { transform: `translateY(105vh) rotate(${(Math.random() - .5) * 720}deg)`, opacity: .8 }
      ], { duration: 1400 + Math.random() * 1200, easing: "ease-in", delay: Math.random() * 350 });
      setTimeout(() => s.remove(), 3200);
    }
  }
  function win() {
    busy = true;
    solved.add(L.name);
    opts.onSolve && opts.onSolve(L.name);   // route persists campaign progress
    $("#hint").style.visibility = "hidden";
    const fr = $("#frame");
    fr.querySelectorAll(".region").forEach(s => s.classList.remove("need"));
    // hand the finished flag over to the DOM (solid regions) so the win wave
    // can transform the frame without leaving the canvas liquid behind
    fr.querySelectorAll(".ghost").forEach(g => { g.style.opacity = 1; });
    for (const v of FR) v.bands = [];
    fr.classList.add("done");
    const stamp = $("#stamp");
    if (stamp) {
      stamp.classList.remove("ghost");
      stamp.animate([
        { transform: "translate(-50%,-50%) scale(3) rotate(-20deg)", opacity: 0 },
        { transform: "translate(-50%,-50%) scale(1) rotate(0)", opacity: 1 }
      ], { duration: 420, easing: "cubic-bezier(.2,1.6,.4,1)" });
    }
    if (!RM) fr.classList.add("wave");
    confetti();
    setTimeout(() => {
      const last = li === LEVELS.length - 1;
      const nx = LEVELS[li + 1];
      const tease = last
        ? "You've reached the last flag in the ladder. Back to all 48."
        : `Next: ${nx.emo} ${nx.name} — ${
            new Set(nx.regions.map(rg => rg.color)).size + nx.junk.length} colours, ${
            Math.ceil((nx.regions.reduce((a, rg) => a + rg.units, 0) + nx.junk.length * CAP) / CAP)
            + nx.spares} tubes.`;
      const b = document.createElement("div");
      b.className = "banner";
      b.innerHTML = `<div class="card"><div class="big">${L.emo}</div>
        <h2>${L.name}!</h2><p>${tease}</p>
        <button data-n="1">${last ? "ALL FLAGS" : "NEXT FLAG →"}</button>
        <button data-n="0" style="background:#14324f;color:#fff;margin-left:8px">≡ FLAGS</button></div>`;
      root.appendChild(b);
      b.querySelector('[data-n="1"]').onclick = () => {
        b.remove(); $("#row").innerHTML = "";
        if (last) showSelect(); else newLevel(li + 1);
      };
      b.querySelector('[data-n="0"]').onclick = () => { b.remove(); showSelect(); };
    }, 1100);
  }

  // ---------- flag-select grid (campaign map + "play any nation") ----------
  function buildSelect() {
    const tiles = LEVELS.map((fl, i) => {
      const done = solved.has(fl.name);
      const thumb = `<img class="thumbimg" src="${flagSrc(fl.name)}" alt="${fl.name}" loading="lazy" draggable="false">`
        + (done ? `<div class="tick">✅</div>` : "");
      return `<div class="tile" data-i="${i}">
        <div class="thumb${done ? " solved" : ""}">${thumb}</div>
        <div class="nm">${fl.name}</div>
        <div class="dots">${"●".repeat(fl.tier)}</div>
      </div>`;
    }).join("");
    const n = LEVELS.filter(fl => solved.has(fl.name)).length;
    $("#select").innerHTML =
      `<div class="shead"><div class="t">ROAD TO THE FINAL</div>
       <div class="sub">${n} / 48 flags built · pick any nation · difficulty ● → ●●●●</div></div>
       <div class="grid">${tiles}</div>`;
    $("#select").querySelectorAll(".tile").forEach(t =>
      t.onclick = () => { $("#row").innerHTML = ""; newLevel(+t.dataset.i); });
  }
  function showSelect() {
    paused = true; busy = false; sel = -1;
    root.querySelectorAll(".banner").forEach(b => b.remove());
    buildSelect();                        // rebuild so solved ticks stay current
    $("#select").hidden = false; $("#select").scrollTop = 0;
  }
  $("#menu").onclick = showSelect;

  root.addEventListener("click", e => {
    if (busy || paused) return;
    const tube = e.target.closest(".tube");
    if (tube) {
      const i = +tube.dataset.i;
      if (sel < 0) { if (tubes[i].length) { sel = i; excite(T[i], 1); render(); } return; }
      if (sel === i) { sel = -1; render(); return; }
      const a = tubes[sel], b = tubes[i];
      const ok = b.length < CAP && (!b.length || b[b.length - 1] === a[a.length - 1]);
      if (ok) startPour(sel, { type: "tube", i });
      else { sel = tubes[i].length ? i : -1; render(); }
      return;
    }
    if (e.target.closest("#frame")) {
      if (sel < 0 || f >= seq.length) return;
      const a = tubes[sel];
      if (a[a.length - 1] === seq[f]) {
        startPour(sel, { type: "frame" });
      } else {
        $("#frame").animate([
          { transform: "translateX(0)" }, { transform: "translateX(-7px)" },
          { transform: "translateX(7px)" }, { transform: "translateX(-5px)" },
          { transform: "translateX(0)" }], { duration: 320 });
        sel = -1; render();
      }
      return;
    }
    if (sel >= 0) { sel = -1; render(); }
  });
  $("#undo").onclick = () => {
    if (busy || !hist.length) return;
    const h = hist.pop(); tubes = h.t; f = h.f; sel = -1; render(); resync();
  };
  $("#restart").onclick = () => {
    if (busy) return;
    tubes = deal0.map(x => x.slice()); f = 0; hist = []; sel = -1; render(); resync();
  };
  const onResize = () => sizeCanvas();
  window.addEventListener("resize", onResize);

  // read-only state snapshot for headless test drivers
  window.__fs = () => ({ tubes: tubes.map(x => x.slice()), f, seq: seq.slice(), busy });

  sizeCanvas();
  newLevel(0); showSelect();            // start on the ROAD TO THE FINAL grid
  rafId = requestAnimationFrame(loop);

  return {
    destroy() {
      killed = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      // banners/confetti live under root and go with it when React unmounts
    },
  };
}
