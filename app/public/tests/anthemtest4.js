/* Suite 4 — playback controller: play/pause/resume, playhead + label,
   clip limits per stage, auto-replay after a miss, full-anthem reveal at game
   end. Media is stubbed by the bootstrap, so everything runs on the synth
   path (England has a hand-transcribed melody). Port of /tmp/anthemtest4. */
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
    A.setMode('practice'); A.loadPuzzle(A.PUZZLES.findIndex((p) => p.name === 'England')); await sleep(80);
    const pb = A.pb;
    A.playClip(); await sleep(150);
    ok(pb.playing && !pb.paused, 'play starts playback');
    ok(pb.src === 'synth', 'fell back to synth (media stubbed)');
    ok(document.getElementById('playhead').classList.contains('show'), 'playhead visible while playing');
    ok(document.getElementById('clipLabel').textContent.startsWith('▶'), 'label shows ▶ time / total');
    ok(document.getElementById('playBtn').classList.contains('playing'), 'button shows pause state');
    A.playClip(); await sleep(120);
    ok(pb.paused && !pb.playing, 'second press pauses');
    ok(document.getElementById('clipLabel').textContent.startsWith('⏸'), 'label shows ⏸ while paused');
    ok(!document.getElementById('playBtn').classList.contains('playing'), 'button back to play icon when paused');
    A.playClip(); await sleep(120);
    ok(pb.playing && !pb.paused, 'third press resumes');
    ok(pb.limit === 2, 'clip limited to 2s on first guess');
    A.stopPlayback(); await sleep(50);
    ok(!pb.playing && !pb.paused, 'stop clears playback');
    ok(document.getElementById('clipLabel').textContent.includes('unlocked'), 'label back to idle');
    ok(!document.getElementById('playhead').classList.contains('show'), 'playhead hidden when idle');
    setVal('France'); A.submitGuess(); await sleep(150);
    ok(A.state.attempt === 1, 'wrong guess registered');
    ok(pb.playing && pb.limit === 3, 'auto-replay after miss, new 3s limit');
    setVal('England'); A.submitGuess(); await sleep(150);
    ok(A.state.finished && A.state.won, 'win registered');
    ok(A.confetti.parts.length > 0, 'confetti launched (' + A.confetti.parts.length + ' pieces)');
    ok(!pb.playing, 'playback stopped at the win moment');
    await sleep(1100);
    ok(pb.playing && pb.full, 'full anthem auto-plays after the result');
    ok(!isFinite(pb.limit), 'no clip limit on the reveal');
    ok(document.getElementById('clipLabel').textContent.startsWith('▶'), 'reveal shows progress label');
    A.playClip(); await sleep(100);
    ok(pb.paused, 'reveal can be paused too');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
