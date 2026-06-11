/* Suite 3 — picker mouse/clear flow: click-select, friction-free re-pick
   (selection doesn't filter, refocus reopens + selects text), the ✕ clear
   button, tried-tagging. Port of /tmp/anthemtest3; practice mode pinned to
   England so the Brazil/Croatia interactions are never today's answer. */
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
    const clearBtn = document.getElementById('clearBtn');
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.bind(gInput);
    const type = (t) => { setVal(t); gInput.dispatchEvent(new Event('input', { bubbles: true })); };
    const focus = () => { gInput.focus(); gInput.dispatchEvent(new FocusEvent('focusin', { bubbles: true })); };
    const rows = () => Array.from(suggBox.querySelectorAll('.srow'));
    const key = (k) => gInput.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const click = (el) => {
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    };
    localStorage.clear(); A.hideHowto(); A.startDaily(); await sleep(80);
    A.setMode('practice'); A.loadPuzzle(A.PUZZLES.findIndex((p) => p.name === 'England')); await sleep(80);
    type('bra'); await sleep(30);
    ok(clearBtn.classList.contains('show'), "clear × appears once there's text");
    click(rows()[0]); await sleep(30);
    ok(gInput.value === 'Brazil', 'Brazil selected via click');
    ok(!suggBox.classList.contains('open'), 'list closed after select');
    focus(); await sleep(30);
    ok(suggBox.classList.contains('open'), 'refocus reopens list');
    ok(rows().length === 48, 'selected value does NOT filter — full list shown (' + rows().length + ')');
    const hi = rows().findIndex((r) => r.classList.contains('hi'));
    ok(hi >= 0 && rows()[hi].textContent.includes('Brazil'), 'current selection highlighted in list');
    ok(gInput.selectionEnd - gInput.selectionStart === gInput.value.length, 'text auto-selected on focus (typing replaces)');
    click(rows().find((r) => r.textContent.includes('Croatia'))); await sleep(30);
    ok(gInput.value === 'Croatia', 're-picked Croatia directly from full list');
    click(clearBtn); await sleep(30);
    ok(gInput.value === '' && suggBox.classList.contains('open'), 'clear × empties input and reopens list');
    ok(rows().length === 48, 'cleared input shows all nations');
    ok(!clearBtn.classList.contains('show'), 'clear × hidden when input empty');
    type('croatia'); await sleep(30);
    key('Enter'); await sleep(60);
    ok(A.state.attempt === 1 && A.state.results[0].label === 'croatia', 'Enter with exact text submits (no double-fill)');
    type('cro'); await sleep(30);
    ok(rows()[0].classList.contains('used'), 'Croatia marked tried after wrong guess');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
