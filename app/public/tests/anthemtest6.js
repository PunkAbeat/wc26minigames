/* Suite 6 — end-of-game layout: hints/guesses newest-first, hints vanish on
   finish, result panel visually above the history and below the player, win
   result visible high in the viewport. Port of /tmp/anthemtest6. */
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
    const eng = A.PUZZLES.findIndex((p) => p.name === 'England');
    A.setMode('practice'); A.loadPuzzle(eng); await sleep(80);
    setVal('France'); A.submitGuess(); await sleep(80);
    setVal('Brazil'); A.submitGuess(); await sleep(80);
    const hints = document.querySelectorAll('.hint');
    ok(hints.length === 2, 'two hints after two misses');
    ok(hints[0].textContent.includes(A.PUZZLES[eng].hints[1]), 'newest hint rendered first');
    const rowEls = document.querySelectorAll('.grow');
    ok(rowEls[0].textContent.includes('Brazil'), 'newest guess rendered first');
    for (let i = 0; i < 4; i++) { A.skip(); await sleep(40); }
    ok(A.state.finished && !A.state.won, 'lost after skips');
    ok(document.querySelectorAll('.hint').length === 0, 'hints removed once finished');
    const endTop = document.getElementById('end').getBoundingClientRect().top;
    const rowsTop = document.querySelector('.grow').getBoundingClientRect().top;
    const playerTop = document.querySelector('.player').getBoundingClientRect().top;
    ok(endTop < rowsTop, 'result panel sits above the guess history');
    ok(endTop > playerTop, 'result panel sits below the player');
    ok(document.getElementById('end').style.display === 'block', 'end visible');
    document.getElementById('againBtn').click(); await sleep(80);
    setVal(A.current.name); A.submitGuess(); await sleep(150);
    ok(A.state.won, 'won next practice');
    const endTop2 = document.getElementById('end').getBoundingClientRect().top;
    ok(endTop2 < innerHeight * 0.6, 'win result visible high in viewport (top=' + Math.round(endTop2) + ')');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
