/* Suite 13 — KEEPIES: state machine, per-flag courses, tier ladder, best-height
   persistence, course picker, end-screen share, sound mute. Drives the canvas
   engine through window.__kp / __kpSet — the hooks mutate state synchronously,
   so the suite never depends on the rAF loop advancing under virtual time. */
(async () => {
  const pre = document.createElement('pre'); pre.id = 'testout'; document.body.appendChild(pre);
  const R = []; const ok = (c, m) => { R.push((c ? 'PASS' : 'FAIL') + ' ' + m); pre.textContent = R.join('\n'); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = () => JSON.parse(localStorage.getItem('wc26_keepies_best') || '{}');
  try {
    localStorage.removeItem('wc26_keepies_best');
    localStorage.removeItem('wc26_keepies_muted');
    const t0 = Date.now();
    while (!(window.__kp && window.__kpSet)) {
      if (Date.now() - t0 > 8000) throw new Error('timeout waiting for engine');
      await sleep(40);
    }
    const get = () => window.__kp();
    const set = window.__kpSet;
    ok(get().state === 'ready', 'boots in ready state');

    // each nation maps to its own course archetype (layout traces the flag, not difficulty)
    set({ flag: 'jp' }); ok(get().flag === 'jp' && get().arch === 'disc', 'Japan → disc course');
    set({ flag: 'de' }); ok(get().arch === 'bands', 'Germany → bands course');
    set({ flag: 'fr' }); ok(get().arch === 'lanes', 'France → lanes course');
    set({ flag: 'us' }); ok(get().arch === 'canton', 'USA → canton course');

    // tier ladder tracks height
    set({ m: 0 }); ok(get().tier === 'PITCH', '0 m = PITCH');
    set({ m: 620 }); ok(get().tier === 'THE ROOF', '620 m = THE ROOF');
    set({ m: 1400 }); ok(get().tier === 'OPEN SKY', '1400 m = OPEN SKY');

    // course picker
    set({ pick: true }); await sleep(20);
    ok(get().pickerOpen, 'picker opens');
    ok(document.querySelectorAll('#pgrid .pc').length === 48, '48 courses in the grid');
    set({ pick: false }); await sleep(20);
    ok(!get().pickerOpen, 'picker closes');

    // best-height: per nation, monotonic, persisted (synchronous — no frame between set+die)
    set({ flag: 'br' }); set({ start: 1 }); set({ m: 300 }); set({ die: 1 });
    ok(get().dead, 'run ends on die()');
    ok(get().best === 300, 'session best = 300 after first run');
    ok(document.getElementById('ovshare').hidden === false, 'share button shows on the end screen');
    ok(document.getElementById('ov').querySelector('.big').textContent === 'NEW BEST!', 'NEW BEST! on a first climb');
    ok(store().br === 300, 'best persisted (br:300)');

    set({ start: 1 }); set({ m: 120 }); set({ die: 1 });
    ok(store().br === 300, 'a lower run does not lower the best');

    set({ start: 1 }); set({ m: 540 }); set({ die: 1 });
    ok(store().br === 540, 'a higher run raises the best (br:540)');

    // another nation keeps its own record (identity, not a shared ranking)
    set({ flag: 'jp' }); set({ start: 1 }); set({ m: 80 }); set({ die: 1 });
    ok(store().jp === 80 && store().br === 540, 'per-nation bests are independent');

    // restarting clears the height
    set({ start: 1 });
    ok(get().state === 'run' && get().m === 0, 'restart resets the climb to 0');

    // sound mute toggle persists
    const mb = document.getElementById('mutebtn');
    const wasMuted = mb.textContent === '🔇';
    mb.click(); await sleep(10);
    ok((localStorage.getItem('wc26_keepies_muted') === '1') !== wasMuted, 'mute toggle persists to storage');
    ok(mb.textContent === (wasMuted ? '🔊' : '🔇'), 'mute icon flips');

    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) {
    R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n');
  }
})();
