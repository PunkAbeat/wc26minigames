// @ts-nocheck
/* KEEPIES engine — ported VERBATIM from public/mock/keepies.html (the feel
   reference). Imperative canvas Doodle-Jump climber; do NOT "Reactify" it — the
   bounce/steer feel was tuned over several on-device iterations. The route mounts
   it into a root element and injects { loadBest, saveBest, track }; React owns the
   page chrome (back / how-to) and pausing.

   Only the I/O scaffolding differs from the mock: DOM is written into `root` and
   queried with a root-scoped `gid`; window listeners and the rAF loop are tracked
   so `destroy()` can tear them down on route unmount; best-heights go through the
   injected storage; a `paused` flag freezes the sim while the how-to modal is open.
   @ts-nocheck: hand-tuned vanilla canvas code, not worth typing. */

export function mountKeepies(root, opts = {}) {
  const track = opts.track || (() => {})
  const loadBest = opts.loadBest || (() => ({}))
  const saveBest = opts.saveBest || (() => {})
  const gid = (id) => root.querySelector('#' + id)
  const L = []
  const on = (t, ty, fn, o) => { t.addEventListener(ty, fn, o); L.push([t, ty, fn, o]) }
  let raf = 0, paused = false

  root.innerHTML = `
    <canvas id="c"></canvas>
    <div class="bunting"></div>
    <div class="hud">
      <div class="tier" id="tier">PITCH</div>
      <div class="ht"><b id="ht">0</b><span>METRES UP</span></div>
    </div>
    <div class="ctrls">
      <button id="flagbtn"><img class="fimg" id="flagimg" alt="">NATION</button>
      <button id="ballbtn">⚽ STYLE</button>
    </div>
    <div id="picker">
      <div class="ph">CHOOSE YOUR COURSE<div style="font-size:10px;opacity:.7;font-weight:600;letter-spacing:1px;margin-top:3px">48 nations · 48 climbs · your best height each</div></div>
      <div class="pg" id="pgrid"></div>
      <button class="pclose" id="pclose">CLOSE</button>
    </div>
    <div class="milestone" id="ms"><div class="k">YOU REACHED THE</div><div class="v" id="msv"></div></div>
    <div class="overlay" id="ov">
      <div class="big">KEEPIES</div>
      <div class="sub">Keep it up! The ball bounces by itself — <b>drag left/right</b> (or use the
        <b>arrow keys</b>) to land each bounce on a header. Don't let it drop.</div>
      <div class="stat" id="ovstat"></div>
      <div class="cta" id="ovcta">TAP TO START</div>
    </div>
    <div class="note" id="seednote"></div>`

  const Q = new URLSearchParams(location.search)
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches && !Q.has("demo")
  const DEMO = Q.has("demo")
  const FLAGS = ["ar","at","au","ba","be","br","ca","cd","ch","ci","co","cv","cw","cz","de","dz",
    "ec","eg","es","fr","gb-eng","gb-sct","gh","hr","ht","iq","ir","jo","jp","kr","ma","mx","nl",
    "no","nz","pa","pt","py","qa","sa","se","sn","tn","tr","us","uy","uz","za"]
  let FLAG = (opts.flag || Q.get("flag") || "br").toLowerCase()
  let ballStyle = (Q.get("ball") === "crest") ? "crest" : "wrap" // owner kept the flag-wrap ball
  // each flag = a distinct ENDLESS course whose platform layout traces the flag's
  // geometry (not its difficulty). 8 archetypes cover all 48.
  let arch = "open", lastLane = 1, discPhase = 0
  const COURSE = {
    ar:"bands", at:"bands", co:"bands", cv:"bands", cw:"bands", de:"bands", ec:"bands",
    eg:"bands", es:"bands", gh:"bands", hr:"bands", ht:"bands", iq:"bands", ir:"bands",
    nl:"bands", py:"bands", uz:"bands",
    be:"lanes", ca:"lanes", ci:"lanes", dz:"lanes", fr:"lanes", mx:"lanes", pt:"lanes",
    qa:"lanes", sn:"lanes",
    br:"disc", jp:"disc", kr:"disc", ma:"disc", tn:"disc", tr:"disc",
    ch:"cross", "gb-eng":"cross", "gb-sct":"cross", no:"cross", se:"cross",
    ba:"triangle", cz:"triangle", jo:"triangle",
    cd:"diagonal", za:"diagonal",
    au:"canton", nz:"canton", pa:"canton", us:"canton", uy:"canton",
    sa:"open",
  }
  function courseFor(iso){ return COURSE[iso] || "open" }
  const BEST = loadBest() || {} // per-flag best height (injected storage)

  function mulberry32(a){ return function(){ a|=0; a=(a+0x6d2b79f5)|0;
    let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t;
    return ((t^(t>>>14))>>>0)/4294967296; } }
  const seedFixed = Q.has("seed")          // ?seed=N pins a course (testing only)
  let seed = seedFixed ? (parseInt(Q.get("seed"),10)|0) : ((Math.random()*0x100000000)>>>0)
  let rnd = mulberry32(seed)                // pure free-play: a fresh course every run

  const cv = gid("c"), ctx = cv.getContext("2d")
  let W=0, H=0, DPR=1
  function resize(){
    DPR = Math.min(devicePixelRatio||1, 2.5)
    W = innerWidth; H = innerHeight
    cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR)
    ctx.setTransform(DPR,0,0,DPR,0,0)
  }
  on(window, "resize", resize); resize()

  // flag ball texture (loaded as SVG <img>, then drawn onto the ball + shaded)
  let flagImg = new Image()
  let flagReady = false
  function loadFlag(iso){
    FLAG = iso; flagReady = false; arch = courseFor(iso)
    flagImg = new Image()
    flagImg.onload = () => { flagReady = true }
    flagImg.onerror = () => { flagReady = false }
    flagImg.src = `/flags/${iso}.svg`
    const fi = gid("flagimg")
    if (fi) fi.src = flagImg.src
    const fb = gid("flagbtn")
    if (fb) fb.lastChild.textContent = iso.toUpperCase()
    updateNote()
  }

  // stadium-ascent milestone bands (metres up)
  const TIERS = [
    { m:0,    name:"PITCH" }, { m:150, name:"LOWER TIER" }, { m:350, name:"UPPER TIER" },
    { m:600,  name:"THE ROOF" }, { m:900, name:"FLOODLIGHTS" }, { m:1300, name:"OPEN SKY" },
  ]
  const SKY = [ ["#2e8b46","#9fd6b0"], ["#3f7fae","#bfe2f5"], ["#3a6ea5","#8fb8de"],
               ["#2f4f86","#5f82b8"], ["#1f3566","#3c5896"], ["#0a1733","#1d2f5e"] ]

  // physics / state
  const G=2300, BOUNCE=940, SPRING=1.78, PUNT=2.9, R=24
  const FOLLOW=20      // follow-finger snap (per second)
  const KEY_ACC=2600, KEY_MAX=560, FRICTION=4.2 // desktop arrow feel
  let ball, plats, climbed, tierIdx, dead, best=0, spin, squash, particles=[], trail=[], celebrateT=0
  let state="ready"    // ready | run | dead
  let pointerX=null, keyDir=0, demoT=null, pickerOpen=false
  const TOPLINE = () => H*0.42  // ball is pinned around here; world scrolls instead

  function spawnAbove(y){
    // gap & width scale with height for a gentle difficulty ramp
    const up = climbed
    const gap = 78 + rnd()*40 + Math.min(up*0.015, 28) // max ~146 < bounce apex (~192)
    const w = Math.max(54, 92 - Math.min(up*0.01, 30))
    const ny = y - gap
    // ARCHETYPE decides x (the journey); the vertical gap above already guarantees
    // reachability, and any x is reachable within one bounce, so x-bias is always safe.
    let cx
    if (arch === "lanes"){               // vertical stripes: weave between 3 lanes
      const lanes = [W*0.24, W*0.5, W*0.76]
      let li = lastLane + (rnd()<.5 ? -1 : 1)
      if (li < 0 || li > 2) li = 1
      if (rnd() < 0.22) li = (rnd()*3)|0 // occasional lane jump
      lastLane = li; cx = lanes[li] + (rnd()-.5)*22
    } else if (arch === "disc"){         // central emblem/sun: curve around the centre
      discPhase += 0.5 + rnd()*0.4
      cx = W*0.5 + Math.sin(discPhase)*(W*0.28)
    } else if (arch === "cross"){        // cross/saltire: central column + horizontal arms
      cx = rnd() < 0.28 ? 12 + w/2 + rnd()*(W-24-w) : W*0.5 + (rnd()-.5)*W*0.20
    } else if (arch === "diagonal"){     // diagonal division: slow left<->right drift
      discPhase += 0.17; const t = discPhase % 2, f = t < 1 ? t : 2 - t
      cx = W*0.16 + f*(W*0.68)
    } else if (arch === "triangle"){     // hoist triangle / chevron: sharp zigzag
      lastLane = lastLane > 0 ? -1 : 1; cx = W*0.5 + lastLane*W*0.20
    } else {                             // bands / canton / open: free spread
      cx = 12 + w/2 + rnd()*(W - 24 - w)
    }
    const x = Math.max(8, Math.min(W - w - 8, cx - w/2))
    const r = rnd(); let type = "norm"
    if      (r < 0.05 && up > 250) type = "punt"   // keeper-punt jetpack (mega boost)
    else if (r < 0.17 && up > 100) type = "spring" // trampoline
    else if (r < 0.31 && up > 150) type = "break"  // crumbles after one bounce
    else if (r < 0.49 && up > 220) type = "move"   // slides side to side
    return { x, y:ny, w, h:14, type, dir: rnd()<.5?-1:1, vx: 40+rnd()*50, broken:false, sprung:false, fall:0 }
  }
  function reset(){
    if (!seedFixed) seed = (Math.random()*0x100000000)>>>0 // free-play: new course each run
    rnd = mulberry32(seed)
    // init state BEFORE spawning (spawnAbove reads `climbed` for its difficulty ramp)
    climbed = 0; tierIdx = 0; dead = false; spin = 0; squash = 0; particles = []; trail = []; celebrateT = 0
    pointerX = null; keyDir = 0; demoT = null
    arch = courseFor(FLAG); lastLane = 1; discPhase = 0
    plats = []
    // a guaranteed starter platform right under the ball
    plats.push({ x:W/2-46, y:H*0.72, w:92, h:14, type:"norm", dir:1, vx:0, broken:false })
    let y = H*0.72
    while (y > -40){ const p = spawnAbove(y); plats.push(p); y = p.y }
    ball = { x:W/2, y:H*0.72-R, vx:0, vy:-BOUNCE } // full launch so the 1st apex clears the gap
  }

  // input
  function startOrRetry(){
    if (state==="ready"){ state="run"; hide(); return true }
    if (state==="dead"){ state="run"; reset(); hide(); return true }
    return false
  }
  on(window, "pointerdown", e => {
    if (pickerOpen || e.target.closest(".ctrls") || e.target.closest("#picker") || e.target.closest(".kp-chrome")) return
    if (startOrRetry()) return
    pointerX = e.clientX
  })
  on(window, "pointermove", e => { if (pointerX!==null) pointerX = e.clientX })
  on(window, "pointerup", () => { pointerX = null })
  on(window, "keydown", e => {
    if (e.code==="Space"||e.code==="Enter"){ e.preventDefault(); startOrRetry() }
    if (e.code==="ArrowLeft"){ keyDir=-1; e.preventDefault() }
    if (e.code==="ArrowRight"){ keyDir=1; e.preventDefault() }
  })
  on(window, "keyup", e => {
    if ((e.code==="ArrowLeft"&&keyDir<0)||(e.code==="ArrowRight"&&keyDir>0)) keyDir=0
  })
  function hide(){ gid("ov").classList.add("hidden") }
  function show(big, sub, stat, cta){
    const o=gid("ov")
    o.querySelector(".big").textContent=big; o.querySelector(".sub").innerHTML=sub
    gid("ovstat").innerHTML=stat||""
    gid("ovcta").textContent=cta; o.classList.remove("hidden")
  }
  function updateNote(){ const el=gid("seednote"); if(!el) return
    const mode = seedFixed ? `seed ${seed>>>0}` : "free play"
    el.textContent = `${FLAG.toUpperCase()} · ${arch.toUpperCase()} course · ${mode} · drag or ←/→${RM?" · reduced-motion":""}` }

  loadFlag(FLAG)

  // flag-picker UI (course select) + ball-style toggle
  const picker = gid("picker"), pgrid = gid("pgrid")
  FLAGS.forEach(iso => {
    const cell = document.createElement("div"); cell.className = "pc"; cell.dataset.iso = iso
    const t = document.createElement("div"); t.className = "pt"; t.dataset.iso = iso
    const im = document.createElement("img"); im.src = `/flags/${iso}.svg`; im.alt = iso
    t.appendChild(im)
    const cap = document.createElement("div"); cap.className = "pcap"; cell.appendChild(t); cell.appendChild(cap)
    pgrid.appendChild(cell)
    cell.onclick = () => { loadFlag(iso); reset(); state="run"; markSel(); closePicker() }
  })
  function refreshBadge(iso){
    const cell = [...pgrid.children].find(c => c.dataset.iso === iso); if (!cell) return
    const cap = cell.querySelector(".pcap")
    cap.textContent = BEST[iso] ? `${BEST[iso]}m` : "—"; cap.classList.toggle("has", !!BEST[iso])
  }
  FLAGS.forEach(refreshBadge)
  function markSel(){ pgrid.querySelectorAll(".pt").forEach(t =>
    t.classList.toggle("sel", t.dataset.iso === FLAG)) }
  function openPicker(){ pickerOpen = true; markSel(); picker.classList.add("open") }
  function closePicker(){ pickerOpen = false; picker.classList.remove("open") }
  gid("flagbtn").onclick = openPicker
  gid("pclose").onclick = closePicker
  gid("ballbtn").onclick = () => { ballStyle = ballStyle==="crest" ? "wrap" : "crest" }

  reset()

  function step(dt){
    if (state!=="run" || pickerOpen || paused) return

    // horizontal steering
    if (pointerX!==null){                 // follow-finger (touch primary)
      const k = Math.min(1, FOLLOW*dt)
      ball.vx = (pointerX - ball.x) * 12  // velocity toward finger (for spin read)
      ball.x += (pointerX - ball.x) * k
    } else {                              // arrow keys (desktop)
      ball.vx += keyDir*KEY_ACC*dt
      if (!keyDir){ const f = FRICTION*dt; ball.vx -= ball.vx*Math.min(1,f) }
      ball.vx = Math.max(-KEY_MAX, Math.min(KEY_MAX, ball.vx))
      ball.x += ball.vx*dt
    }
    // wrap the screen edges (classic Doodle Jump)
    if (ball.x < -R) ball.x = W+R; else if (ball.x > W+R) ball.x = -R

    // gravity + vertical
    ball.vy += G*dt; ball.y += ball.vy*dt
    spin += Math.max(-700,Math.min(700, ball.vx))*dt*0.009 // gentler roll
    squash += (-Math.max(-1,Math.min(1, ball.vy/1400)) - squash) * Math.min(1,14*dt)
    trail.push({ x:ball.x, y:ball.y }); if (trail.length > 14) trail.shift()
    if (celebrateT > 0) celebrateT -= dt

    // moving platforms slide; broken ones tumble away
    for (const p of plats){
      if (p.type==="move" && !p.broken){ p.x += p.dir*p.vx*dt
        if (p.x<8){p.x=8;p.dir=1} else if (p.x>W-p.w-8){p.x=W-p.w-8;p.dir=-1} }
      if (p.broken){ p.fall += dt; p.y += 560*dt*Math.min(1,p.fall*4) }
    }
    plats = plats.filter(p => !(p.broken && p.y > H + 50))

    // landing: only while descending, ball bottom crossing the platform top
    let bounced = false
    if (ball.vy > 0){
      for (const p of plats){
        if (p.broken) continue
        const bx = ball.x, by = ball.y + R
        if (bx > p.x-2 && bx < p.x+p.w+2 && by > p.y && by < p.y + p.h + Math.max(14, ball.vy*dt)){
          if (p.type==="punt"){ ball.vy = -BOUNCE*PUNT; puff(bx,p.y,"#7be0ff",18) }
          else if (p.type==="spring"){ ball.vy = -BOUNCE*SPRING; p.sprung=true; puff(bx,p.y,"#ffd34d",10) }
          else { ball.vy = -BOUNCE; puff(bx,p.y,"#ffffff",5) }
          ball.y = p.y - R; squash = 0.5; bounced = true
          if (p.type==="break"){ p.broken = true; p.fall = 0 } // crumbles after one use
          break
        }
      }
    }

    // scroll the world when the ball climbs past the top line
    const tl = TOPLINE()
    if (ball.y < tl){
      const shift = tl - ball.y; ball.y = tl; climbed += shift
      for (const p of plats) p.y += shift
      for (const pt of particles) pt.y += shift
      for (const t of trail) t.y += shift
      // recycle: drop platforms that fell below, top up above
      plats = plats.filter(p => p.y < H + 30)
      let top = Math.min(...plats.map(p=>p.y))
      while (top > -40){ const np = spawnAbove(top); plats.push(np); top = np.y }
    }

    // tier milestones
    const m = Math.floor(climbed/10)
    while (tierIdx < TIERS.length-1 && m >= TIERS[tierIdx+1].m){
      tierIdx++
      if (TIERS[tierIdx].name === "OPEN SKY") celebrate() // lift the trophy at the summit
      else fireMs(TIERS[tierIdx].name)
    }

    // death: dropped off the bottom
    if (ball.y - R > H){ die() }

    for (const pt of particles){ pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.vy+=1400*dt; pt.life-=dt }
    particles = particles.filter(p=>p.life>0)

    // demo auto-steer: commit to the nearest platform above and HOLD the aim
    // through the whole arc; only re-pick right after a bounce.
    if (DEMO){
      if (!demoT || demoT.broken || bounced){
        const cand = plats.filter(p=>!p.broken && p.y < ball.y - 2).sort((a,b)=>b.y-a.y)
        if (cand[0]) demoT = cand[0]
      }
      if (demoT) pointerX = demoT.x + demoT.w/2 + (demoT.type==="move"? demoT.dir*25 : 0)
    }
  }
  function puff(x,y,c,n){ if (RM) return; for(let i=0;i<n;i++) particles.push({
    x, y, vx:(Math.random()-.5)*220, vy:-Math.random()*160, life:.3+Math.random()*.25, c }) }
  function fireMs(name){ gid("msv").textContent=name
    const el=gid("ms"); el.classList.remove("show"); void el.offsetWidth; el.classList.add("show") }
  function celebrate(){ celebrateT = 2.8; confettiBurst() }
  function confettiBurst(){ if (RM) return; const cols=["#ffd34d","#ffffff","#d40e14","#3aa564","#7be0ff"]
    for (let i=0;i<60;i++) particles.push({ x:W*0.5+(Math.random()-.5)*W*0.7, y:-10,
      vx:(Math.random()-.5)*260, vy:Math.random()*140, life:1.4+Math.random()*1.3, c:cols[i%5] }) }
  function die(){
    if (dead) return; dead=true; state="dead"
    const m = Math.floor(climbed/10); best = Math.max(best, m)
    const pb = BEST[FLAG] || 0, isPB = m > pb
    if (isPB){ BEST[FLAG] = m; saveBest(BEST); refreshBadge(FLAG) }
    track('keepies_run', { flag: FLAG, m: String(m), tier: TIERS[tierIdx].name, pb: isPB ? '1' : '0' })
    show(isPB ? "NEW BEST!" : "DROPPED!",
      `Lost it at the <b>${TIERS[tierIdx].name}</b> on the <b>${FLAG.toUpperCase()}</b> course.`,
      `Height: <b>${m} m</b> &nbsp;·&nbsp; ${FLAG.toUpperCase()} best: <b>${Math.max(pb,m)} m</b>`,
      "TAP TO PLAY AGAIN")
  }

  // ---- render -----------------------------------------------------------------
  function lerp(a,b,t){return a+(b-a)*t}
  function mix(c1,c2,t){ const a=parseInt(c1.slice(1),16),b=parseInt(c2.slice(1),16)
    return `rgb(${Math.round(lerp((a>>16)&255,(b>>16)&255,t))},${Math.round(lerp((a>>8)&255,(b>>8)&255,t))},${Math.round(lerp(a&255,b&255,t))})` }
  function draw(){
    const m = climbed/10
    let t=0, lo=SKY[tierIdx], hi=SKY[Math.min(tierIdx+1,SKY.length-1)]
    if (tierIdx<TIERS.length-1){ const a=TIERS[tierIdx].m,b=TIERS[tierIdx+1].m; t=Math.max(0,Math.min(1,(m-a)/(b-a))) }
    const g = ctx.createLinearGradient(0,0,0,H)
    g.addColorStop(0, mix(lo[0],hi[0],t)); g.addColorStop(1, mix(lo[1],hi[1],t))
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H)
    drawBackdrop(m)
    // faint stars up high
    if (!RM && tierIdx>=3){ ctx.fillStyle="rgba(255,255,255,.5)"
      for(let i=0;i<40;i++){ const sx=((i*97.13)%W), sy=((i*53.7+climbed*0.1)%H)
        ctx.globalAlpha=.3+0.3*Math.sin(i+climbed*0.002); ctx.fillRect(sx,sy,2,2)} ctx.globalAlpha=1 }

    drawPlatforms()
    drawTrail()
    drawBall()

    for (const pt of particles){ ctx.globalAlpha=Math.max(0,Math.min(1,pt.life*3))
      ctx.fillStyle=pt.c; ctx.fillRect(pt.x,pt.y,3,3) } ctx.globalAlpha=1

    if (celebrateT > 0){                       // trophy-at-the-top payoff
      ctx.save(); ctx.globalAlpha = Math.min(1, celebrateT/0.7)
      drawTrophy(W/2, H*0.30, 1.2)
      ctx.textAlign="center"; ctx.fillStyle="#ffd34d"
      ctx.font="800 24px -apple-system,Segoe UI,Roboto,sans-serif"
      ctx.fillText("TROPHY LIFTED!", W/2, H*0.30+86)
      ctx.font="600 12px -apple-system,Segoe UI,Roboto,sans-serif"; ctx.fillStyle="rgba(255,255,255,.92)"
      ctx.fillText("CHAMPION OF THE WORLD — keep climbing", W/2, H*0.30+106)
      ctx.textAlign="start"; ctx.restore()
    }
  }
  function drawTrail(){
    const inten = Math.max(0, Math.min(1, (-ball.vy - 1000)/1600)) // shows on punt/spring
    if (inten <= 0.02 || trail.length < 2) return
    for (let i=0;i<trail.length;i++){ const t=trail[i], f=i/trail.length
      ctx.fillStyle = `rgba(123,224,255,${(f*inten*0.6).toFixed(3)})`
      ctx.beginPath(); ctx.arc(t.x, t.y, R*(0.35+0.55*f), 0, 7); ctx.fill() }
  }
  function drawTrophy(cx,cy,s){
    ctx.save(); ctx.translate(cx,cy); ctx.scale(s,s)
    const gl=ctx.createRadialGradient(0,-8,2,0,-8,95)
    gl.addColorStop(0,"rgba(255,211,77,.5)"); gl.addColorStop(1,"rgba(255,211,77,0)")
    ctx.fillStyle=gl; ctx.fillRect(-95,-95,190,190)
    ctx.strokeStyle="#ffd34d"; ctx.lineWidth=5        // handles
    ctx.beginPath(); ctx.arc(-26,-20,13, Math.PI*0.5, Math.PI*1.5, true); ctx.stroke()
    ctx.beginPath(); ctx.arc(26,-20,13, Math.PI*1.5, Math.PI*0.5, true); ctx.stroke()
    ctx.fillStyle="#ffd34d"; ctx.strokeStyle="#c9a01f"; ctx.lineWidth=2   // bowl
    ctx.beginPath(); ctx.moveTo(-27,-34); ctx.lineTo(27,-34); ctx.lineTo(20,4)
    ctx.quadraticCurveTo(0,20,-20,4); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.fillRect(-5,4,10,12); ctx.fillRect(-17,16,34,6); ctx.fillRect(-13,22,26,7) // stem + base
    ctx.restore()
  }
  function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r)
    ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath() }
  // the REAL flag fills the lower climb and slides down as you ascend, so you rise out
  // of your nation's flag into the shared sky. Layout = journey, flag image = identity.
  function drawBackdrop(m){
    if (!flagReady) return
    const a = Math.max(0, 1 - m/360) * 0.5
    if (a <= 0.01) return
    const fh = H*1.15, fw = fh*1.5          // cover-fit to the width (3:2 flag)
    const yBottom = H + climbed*0.35        // slides down as you climb
    ctx.save(); ctx.globalAlpha = a
    ctx.drawImage(flagImg, (W-fw)/2, yBottom - fh, fw, fh)
    ctx.restore()
  }
  function pent(cx,cy,r){ ctx.beginPath(); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2-Math.PI/2
    const px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r; i?ctx.lineTo(px,py):ctx.moveTo(px,py)} ctx.closePath(); ctx.fill() }
  function drawPlatforms(){
    for (const p of plats){
      if (p.y < -30 || p.y > H+30) continue
      ctx.save()
      ctx.globalAlpha = p.broken ? Math.max(0, 1 - p.fall*1.6) : 1
      // shadow
      ctx.fillStyle="rgba(0,0,0,.18)"; rr(p.x+2,p.y+4,p.w,p.h,7); ctx.fill()
      if (p.type==="punt"){               // keeper-punt jetpack: cyan pad + gloves + big arrows
        ctx.fillStyle="#1f9fc6"; rr(p.x,p.y,p.w,p.h,7); ctx.fill()
        ctx.fillStyle="#7be0ff"; rr(p.x,p.y,p.w,4,4); ctx.fill()
        ctx.fillStyle="#fff"             // two keeper gloves
        ctx.beginPath(); ctx.arc(p.x+p.w/2-12,p.y-5,6,0,7); ctx.arc(p.x+p.w/2+12,p.y-5,6,0,7); ctx.fill()
        ctx.strokeStyle="#fff"; ctx.lineWidth=2.5
        for(let i=0;i<2;i++){ const cy=p.y+8-i*4; ctx.beginPath()
          ctx.moveTo(p.x+p.w/2-8,cy); ctx.lineTo(p.x+p.w/2,cy-5); ctx.lineTo(p.x+p.w/2+8,cy); ctx.stroke() }
      }
      else if (p.type==="spring"){        // trampoline: gold + chevrons
        ctx.fillStyle = p.sprung? "#ffe08a":"#ffd34d"; rr(p.x,p.y,p.w,p.h,7); ctx.fill()
        ctx.strokeStyle="#14324f"; ctx.lineWidth=2
        for(let i=0;i<3;i++){ const cx=p.x+p.w/2+(i-1)*14; ctx.beginPath()
          ctx.moveTo(cx-5,p.y+9); ctx.lineTo(cx,p.y+4); ctx.lineTo(cx+5,p.y+9); ctx.stroke() }
      }
      else if (p.type==="break"){         // crumbling: cracked brown bar
        ctx.fillStyle="#9c7a52"; rr(p.x,p.y,p.w,p.h,7); ctx.fill()
        ctx.fillStyle="#7c5e3c"; rr(p.x,p.y,p.w,4,4); ctx.fill()
        ctx.strokeStyle="rgba(40,24,10,.6)"; ctx.lineWidth=1.5 // crack lines
        ctx.beginPath(); ctx.moveTo(p.x+p.w*0.4,p.y); ctx.lineTo(p.x+p.w*0.5,p.y+p.h)
        ctx.moveTo(p.x+p.w*0.66,p.y+p.h); ctx.lineTo(p.x+p.w*0.6,p.y); ctx.stroke()
      }
      else {                              // norm / move: turf bar + header silhouette
        ctx.fillStyle = p.type==="move" ? "#cfe6f6" : "#eef6ee"; rr(p.x,p.y,p.w,p.h,7); ctx.fill()
        ctx.fillStyle = "#2e8b46"; rr(p.x,p.y,p.w,4,4); ctx.fill()
        ctx.fillStyle="#14324f"; ctx.beginPath(); ctx.arc(p.x+p.w/2, p.y-4, 5, 0, 7); ctx.fill()
        ctx.fillStyle="rgba(20,50,79,.6)"; rr(p.x+p.w/2-7, p.y-1, 14, 5, 2); ctx.fill()
      }
      ctx.restore()
    }
  }
  function drawBall(){
    const x=ball.x, y=ball.y
    const sy = 1 + squash*0.16, sx = 1 - squash*0.10
    // soft drop shadow
    ctx.fillStyle="rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(x, y+R+2, R*0.85, R*0.32, 0,0,7); ctx.fill()
    ctx.save(); ctx.translate(x,y); ctx.scale(sx,sy)
    // base circle
    ctx.beginPath(); ctx.arc(0,0,R,0,7); ctx.closePath()
    ctx.save(); ctx.clip()
    if (ballStyle==="wrap" && flagReady){
      // flag wrapped, but only a GENTLE tilt (±~14°) so it never reads upside-down
      ctx.save(); ctx.rotate(Math.sin(spin)*0.25)
      const s = R*2.3; ctx.drawImage(flagImg, -s/2, -s/2, s, s)
      ctx.restore()
      ctx.save(); ctx.rotate(spin*0.5); ctx.strokeStyle="rgba(0,0,0,.16)"; ctx.lineWidth=1.2
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.ellipse(0,0,R*0.9,R*(0.32+i*0.27),0,0,7); ctx.stroke() }
      ctx.restore()
    } else {
      // CREST style: a real white football — pentagons spin, flag sits in an upright crest
      ctx.fillStyle="#f6f8fb"; ctx.fillRect(-R,-R,2*R,2*R)
      ctx.save(); ctx.rotate(spin); ctx.fillStyle="#1a2433"
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2 - Math.PI/2  // ring of panel pentagons
        pent(Math.cos(a)*R*0.78, Math.sin(a)*R*0.78, R*0.20) }
      ctx.strokeStyle="rgba(26,36,51,.5)"; ctx.lineWidth=1.4   // seams between them
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2 - Math.PI/2
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*R, Math.sin(a)*R); ctx.stroke() }
      ctx.restore()
      if (flagReady){                  // upright flag crest in the centre
        const cr = R*0.52
        ctx.save(); ctx.beginPath(); ctx.arc(0,0,cr,0,7); ctx.clip()
        ctx.drawImage(flagImg, -cr*1.5, -cr, cr*3, cr*2); ctx.restore()
        ctx.strokeStyle="#ffd34d"; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(0,0,cr,0,7); ctx.stroke()
        ctx.strokeStyle="rgba(255,255,255,.75)"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,cr-2,0,7); ctx.stroke()
      }
    }
    // spherical shading: vignette edge + glossy highlight (NOT rotated → fixed light)
    const vg = ctx.createRadialGradient(0,0,R*0.55, 0,0,R)
    vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.42)")
    ctx.fillStyle=vg; ctx.fillRect(-R,-R,2*R,2*R)
    const hl = ctx.createRadialGradient(-R*0.35,-R*0.4,1, -R*0.35,-R*0.4,R*1.1)
    hl.addColorStop(0,"rgba(255,255,255,.55)"); hl.addColorStop(.4,"rgba(255,255,255,.08)"); hl.addColorStop(1,"rgba(255,255,255,0)")
    ctx.fillStyle=hl; ctx.fillRect(-R,-R,2*R,2*R)
    ctx.restore() // clip
    // crisp specular dot + rim
    ctx.fillStyle="rgba(255,255,255,.9)"; ctx.beginPath(); ctx.arc(-R*0.34,-R*0.42,R*0.12,0,7); ctx.fill()
    ctx.strokeStyle="rgba(0,0,0,.25)"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,0,R,0,7); ctx.stroke()
    ctx.restore() // transform
  }

  function hud(){ gid("ht").textContent = Math.floor(climbed/10).toLocaleString()
    gid("tier").textContent = TIERS[tierIdx].name }

  let last=performance.now(), acc=0; const FIXED=1/120
  function loop(now){ let f=(now-last)/1000; last=now; if(f>0.1)f=0.1; acc+=f
    while(acc>=FIXED){ step(FIXED); acc-=FIXED } draw(); hud(); raf=requestAnimationFrame(loop) }
  raf = requestAnimationFrame(loop)
  if (DEMO){ state="run"; hide() }

  window.__kp = () => ({ state, dead, m:Math.floor(climbed/10), tier:TIERS[tierIdx].name,
    tierIdx, vy:Math.round(ball.vy), x:Math.round(ball.x), plats:plats.length,
    types:[...new Set(plats.map(p=>p.type))], best, seed:seed>>>0, flag:FLAG, flagReady,
    ballStyle, pickerOpen, arch, seedFixed, celebrateT:Math.round(celebrateT*100)/100 })
  window.__kpSet = (o={}) => { if(o.flag) loadFlag(o.flag); if(o.ball) ballStyle=o.ball
    if(o.pick!==undefined) (o.pick?openPicker():closePicker())
    if(o.m!==undefined) climbed=o.m*10; if(o.celebrate) celebrate()
    if(o.vy!==undefined) ball.vy=o.vy } // headless hooks

  return {
    destroy(){
      cancelAnimationFrame(raf)
      for (const [t,ty,fn,o] of L) t.removeEventListener(ty,fn,o)
      try { delete window.__kp; delete window.__kpSet } catch { /* ignore */ }
      root.innerHTML = ''
    },
    setPaused(p){ paused = !!p },
  }
}
