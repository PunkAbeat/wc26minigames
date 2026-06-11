/* Suite 2 — autocomplete picker, keyboard flow (aliases, accent folding,
   Enter fills then shoots, tried nations disabled, arrows, Escape).
   Port of /tmp/anthemtest2; runs in practice mode on a pinned puzzle (Mexico)
   so the original's France-miss / Mexico-win assertions stay date-independent. */
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
    const suggBox = document.getElementById('suggList');
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.bind(gInput);
    const key = (k) => gInput.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const type = (t) => { setVal(t); gInput.dispatchEvent(new Event('input', { bubbles: true })); };
    const rows = () => Array.from(suggBox.querySelectorAll('.srow'));
    localStorage.clear(); A.hideHowto(); A.startDaily(); await sleep(80);
    A.setMode('practice'); A.loadPuzzle(A.PUZZLES.findIndex((p) => p.name === 'Mexico')); await sleep(80);
    gInput.focus(); gInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); await sleep(30);
    ok(suggBox.classList.contains('open'), 'dropdown opens on focus');
    ok(rows().length === 48, 'all 48 nations listed (got ' + rows().length + ')');
    ok(rows()[0].querySelector('img').src.includes('flagcdn.com'), 'flag images per row');
    type('fra'); await sleep(30);
    ok(rows().length === 1 && rows()[0].textContent.includes('France'), "'fra' filters to France");
    ok(rows()[0].classList.contains('hi'), 'best match pre-highlighted');
    key('Enter'); await sleep(30);
    ok(gInput.value === 'France', 'Enter fills the input (no submit yet)');
    ok(!suggBox.classList.contains('open'), 'dropdown closes after pick');
    key('Enter'); await sleep(60);
    ok(A.state.attempt === 1 && A.state.results[0].label === 'France', 'second Enter shoots the guess');
    type('fra'); await sleep(30);
    ok(rows()[0].classList.contains('used') && rows()[0].textContent.includes('tried'), 'already-guessed nation disabled + tagged');
    key('Enter'); await sleep(30);
    ok(A.state.attempt === 1, 'Enter cannot re-submit a tried nation via pick');
    type('holland'); await sleep(30);
    ok(rows().length && rows()[0].textContent.includes('Netherlands'), "alias: 'holland' → Netherlands");
    type('usa'); await sleep(30);
    ok(rows().length && rows()[0].textContent.includes('United States'), "alias: 'usa' → United States");
    type('turk'); await sleep(30);
    ok(rows().some((r) => r.textContent.includes('Türkiye')), "accent-folding: 'turk' → Türkiye");
    type('curacao'); await sleep(30);
    ok(rows().some((r) => r.textContent.includes('Curaçao')), "accent-folding: 'curacao' → Curaçao");
    type('xyz'); await sleep(30);
    ok(suggBox.querySelector('.snone'), 'no-match message for garbage input');
    type(''); await sleep(30);
    key('ArrowDown'); await sleep(20);
    const hi1 = rows().findIndex((r) => r.classList.contains('hi'));
    key('ArrowDown'); await sleep(20);
    const hi2 = rows().findIndex((r) => r.classList.contains('hi'));
    ok(hi2 === hi1 + 1, 'arrow keys move highlight (' + hi1 + '→' + hi2 + ')');
    key('Escape'); await sleep(20);
    ok(!suggBox.classList.contains('open'), 'Escape closes dropdown');
    type('mex'); await sleep(30); key('Enter'); await sleep(30); key('Enter'); await sleep(80);
    ok(A.state.finished && A.state.won, 'won via picker flow');
    ok(document.getElementById('end').style.display === 'block', 'end screen shown');
    type('anything'); await sleep(30); A.submitGuess(); await sleep(30);
    ok(A.state.finished && A.state.attempt === 2, 'no input accepted after finish');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
