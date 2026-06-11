/* Suite 5 — confetti actually renders: particles spawn on a win and pixels
   land on the visible canvas. Port of /tmp/anthemtest5. */
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
    R.push('RM=' + A.RM);
    A.setMode('practice'); A.loadPuzzle(A.PUZZLES.findIndex((p) => p.name === 'England')); await sleep(80);
    setVal('England'); A.submitGuess(); await sleep(250);
    ok(A.state.won, 'won');
    ok(A.confetti.parts.length > 0, 'particles spawned: ' + A.confetti.parts.length);
    await sleep(150); // a few frames
    const cv = document.getElementById('confetti');
    ok(cv.width > 0 && cv.height > 0, 'canvas sized ' + cv.width + 'x' + cv.height);
    const img = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let painted = 0;
    for (let i = 3; i < img.length; i += 4) if (img[i] > 0) painted++;
    ok(painted > 50, 'pixels actually painted on canvas: ' + painted);
    const cs = getComputedStyle(cv);
    ok(cs.display !== 'none' && cs.visibility !== 'hidden', 'canvas visible (display=' + cs.display + ', z=' + cs.zIndex + ')');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
