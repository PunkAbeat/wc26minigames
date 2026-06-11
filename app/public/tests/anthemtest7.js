/* Suite 7 — share card: a finished game renders a real PNG with actual pixels
   (spoiler-free canvas card attached to the share sheet on mobile). */
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
    setVal('France'); A.submitGuess(); await sleep(60);
    setVal('England'); A.submitGuess(); await sleep(120);
    ok(A.state.finished && A.state.won, 'game finished');
    const blob = await A.makeShareCard();
    ok(!!blob, 'share card rendered');
    ok(blob && blob.type === 'image/png', 'card is a PNG (' + (blob && blob.type) + ')');
    ok(blob && blob.size > 20000, 'card has real pixel content (' + (blob && blob.size) + ' bytes)');
    /* decode it back and sanity-check dimensions + that it is not a blank frame */
    const bmp = await createImageBitmap(blob);
    ok(bmp.width === 1200 && bmp.height === 630, 'card is 1200x630 (' + bmp.width + 'x' + bmp.height + ')');
    const cv = document.createElement('canvas');
    cv.width = bmp.width; cv.height = bmp.height;
    const ctx = cv.getContext('2d');
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const colors = new Set();
    for (let i = 0; i < d.length; i += 4 * 997) colors.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
    ok(colors.size > 8, 'card is not a flat frame (' + colors.size + ' sampled colours)');
    /* spoiler check: the card must never contain the answer — it is pure
       canvas, but assert the share *text* stays spoiler-free too */
    const txt = document.getElementById('gridShare').textContent;
    ok(!txt.includes('England'), 'share grid is spoiler-free');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
