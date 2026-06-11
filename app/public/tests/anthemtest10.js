/* Suite 10 — archive mode: replaying a past match never touches streak,
   lifetime stats or the daily save; results are remembered per day. Drives
   startArchive(0) directly (the UI button only appears once past days exist). */
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
    /* finish today's daily first so we can verify the archive doesn't disturb it */
    setVal(A.current.name); A.submitGuess(); await sleep(100);
    ok(A.state.finished && A.state.won, 'daily finished');
    const streakBefore = localStorage.getItem('anthem_streak');
    const statsBefore = localStorage.getItem('anthem_stats');
    const dailyBefore = localStorage.getItem('anthem_daily');
    A.startArchive(0); await sleep(100);
    ok(A.mode === 'archive', 'archive mode on');
    ok(A.current === A.PUZZLES[A.DAILY_ORDER[0]], 'archive day 0 = Match #1 anthem (' + A.current.name + ')');
    ok(document.getElementById('matchLabel').textContent.includes('#1'), 'label shows the archived match number');
    const wrong = A.current.name === 'France' ? 'Brazil' : 'France';
    setVal(wrong); A.submitGuess(); await sleep(60);
    setVal(A.current.name); A.submitGuess(); await sleep(120);
    ok(A.state.finished && A.state.won, 'archive match won');
    ok(document.getElementById('streakLine').textContent.includes('Archive'), 'end screen marks it as archive');
    const arch = JSON.parse(localStorage.getItem('anthem_archive'));
    ok(arch && arch['0'] === '2', 'archive result recorded (' + JSON.stringify(arch) + ')');
    ok(localStorage.getItem('anthem_streak') === streakBefore, 'streak untouched by archive play');
    ok(localStorage.getItem('anthem_stats') === statsBefore, 'lifetime stats untouched by archive play');
    ok(localStorage.getItem('anthem_daily') === dailyBefore, "today's saved daily untouched");
    A.startDaily(); await sleep(80);
    ok(A.mode === 'daily' && A.state.finished && A.state.won, 'back to the finished daily');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
