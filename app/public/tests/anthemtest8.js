/* Suite 8 — lifetime stats: a daily finish writes anthem_stats, the panel
   shows the numbers, practice games never touch them. */
(async () => {
  const pre = document.createElement('pre'); pre.id = 'testout'; document.body.appendChild(pre);
  const R = []; const ok = (c, m) => { R.push((c ? 'PASS' : 'FAIL') + ' ' + m); pre.textContent = R.join('\n'); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    const t0 = Date.now();
    while (!(window.__anthem && window.__anthem.current)) {
      if (Date.now() - t0 > 8000) throw new Error('timeout waiting for app');
      await sleep(40);
    }
    const A = window.__anthem;
    const gInput = document.getElementById('guessInput');
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.bind(gInput);
    localStorage.clear(); A.hideHowto(); A.startDaily(); await sleep(80);
    const wrong = A.current.name === 'France' ? 'Brazil' : 'France';
    setVal(wrong); A.submitGuess(); await sleep(60);
    setVal(A.current.name); A.submitGuess(); await sleep(120);
    ok(A.state.finished && A.state.won, 'daily won in 2');
    const st = JSON.parse(localStorage.getItem('anthem_stats'));
    ok(!!st, 'anthem_stats written');
    ok(st.played === 1 && st.wins === 1, 'played=1 wins=1');
    ok(JSON.stringify(st.dist) === JSON.stringify([0, 1, 0, 0, 0, 0]), 'win counted in slot 2 (' + JSON.stringify(st.dist) + ')');
    ok(st.maxStreak === 1, 'max streak seeded');
    document.getElementById('statsBtn').click(); await sleep(60);
    const modal = document.getElementById('statsModal');
    ok(modal.classList.contains('show'), 'stats modal opens from header');
    const nums = Array.from(modal.querySelectorAll('.statnum b')).map((b) => b.textContent);
    ok(JSON.stringify(nums) === JSON.stringify(['1', '100', '1', '1']), 'played/win%/streak/best = 1/100/1/1 (' + nums + ')');
    const bars = Array.from(modal.querySelectorAll('.distbar')).map((b) => b.textContent);
    ok(bars.length === 6 && bars[1] === '1', 'distribution rendered, slot 2 = 1');
    ok(modal.querySelector('.distbar.today'), "today's win highlighted");
    document.getElementById('statsClose').click(); await sleep(40);
    ok(!modal.classList.contains('show'), 'modal closes');
    /* practice must not touch lifetime stats */
    A.startPractice(); await sleep(80);
    for (let i = 0; i < 6; i++) { A.skip(); await sleep(30); }
    const st2 = JSON.parse(localStorage.getItem('anthem_stats'));
    ok(st2.played === 1 && st2.wins === 1, "practice loss didn't touch stats");
    ok(document.getElementById('endStatsBtn'), 'stats reachable from the end screen');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
