/* Suite 1 — daily flow, persistence, streak, practice.
   Port of the original /tmp/anthemtest harness; drives the React app through
   window.__anthem. Date-independent: the original asserted Mexico because it
   ran on launch day — here we assert against the seeded schedule itself. */
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
    ok(A.mode === 'daily', 'boots in daily mode');
    ok(A.PUZZLES[A.DAILY_ORDER[0]].name === 'Mexico', 'Mexico kicks off the rotation');
    ok(A.current === A.PUZZLES[A.dailyIndex], 'today = seeded daily pick (' + A.current.name + ')');
    const wrong = A.current.name === 'France' ? 'Brazil' : 'France';
    setVal(wrong); A.submitGuess(); await sleep(80);
    ok(A.state.attempt === 1, 'attempt advanced after miss');
    ok(document.querySelectorAll('.hint').length === 1, 'hint card revealed');
    const saved = JSON.parse(localStorage.getItem('anthem_daily'));
    ok(saved && saved.state.attempt === 1, 'mid-game persisted');
    A.startDaily(); await sleep(80);
    ok(A.state.attempt === 1 && A.state.results[0].label === wrong, 'mid-game restored after reload');
    setVal(A.current.name); A.submitGuess(); await sleep(80);
    ok(A.state.finished && A.state.won, 'win registered');
    ok(document.getElementById('nextIn').textContent.includes('Next anthem'), 'countdown ticking');
    ok(document.getElementById('streakLine').textContent.includes('Streak 1'), 'streak = 1');
    A.startDaily(); await sleep(80);
    ok(A.state.finished && A.state.won, 'finished daily restored — no replay');
    A.startPractice(); await sleep(80);
    ok(A.mode === 'practice', 'practice mode on');
    ok(A.current !== A.PUZZLES[A.dailyIndex], "practice never today's anthem (" + A.current.name + ')');
    const sb = JSON.parse(localStorage.getItem('anthem_streak')).count;
    for (let i = 0; i < 6; i++) { A.skip(); await sleep(40); }
    ok(A.state.finished && !A.state.won, 'practice finished via skips');
    ok(JSON.parse(localStorage.getItem('anthem_streak')).count === sb, "practice didn't touch streak");
    ok(document.getElementById('againBtn').style.display !== 'none', 'again button visible');
    document.getElementById('againBtn').click(); await sleep(80);
    ok(A.mode === 'practice' && !A.state.finished, 'again loads fresh practice anthem (' + A.current.name + ')');
    A.startDaily(); await sleep(80);
    ok(A.mode === 'daily' && A.state.finished && A.state.won, 'back to finished daily');
    A.startPractice(); await sleep(60);
    ok(A.mode === 'daily', 'third practice of the day blocked by the cap');
    ok(JSON.parse(localStorage.getItem('anthem_practice')).count === 2, 'practice plays counted');
    ok(A.POOL.length === 46, 'pool=46 (' + A.POOL.length + ')');
    ok(new Set(A.DAILY_ORDER).size === 46, 'daily order covers pool once');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
