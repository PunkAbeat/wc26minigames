/* Suite 9 — global stats: a live daily finish POSTs an anonymous counter and
   the end screen shows the "X% solved it" line from GET /api/anthem-stats. */
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
    setVal(A.current.name); A.submitGuess(); await sleep(80);
    ok(A.state.finished && A.state.won, 'daily won in 1');
    const savedDay = JSON.parse(localStorage.getItem('anthem_daily')).day;
    const before = Date.now();
    let line = '';
    while (Date.now() - before < 6000) {
      const el = document.getElementById('globalStats');
      if (el && el.textContent.includes('%')) { line = el.textContent; break; }
      await sleep(100);
    }
    ok(!!line, 'global stats line appears (' + line + ')');
    ok(/\d+% of today’s players solved it/.test(line), 'line has the solved % (' + line + ')');
    const d = await (await fetch('/api/anthem-stats?day=' + savedDay)).json();
    ok(d.total >= 1, 'API counted our result (total=' + d.total + ')');
    ok((d.dist['1'] || 0) >= 1, 'our 1-guess win is in the right bucket');
    const bad = await fetch('/api/anthem-stats', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ day: savedDay, tries: 'lol' }) });
    ok(bad.status === 400, 'junk results rejected (' + bad.status + ')');
    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
/* appendix: event sink contract (same suite to keep the runner at 9) */
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 100 && !document.getElementById('testout'); i++) await sleep(50);
  const pre = document.getElementById('testout');
  while (!/DONE|FAIL exception/.test(pre.textContent)) await sleep(100);
  const add = (c, m) => { pre.textContent = pre.textContent.replace(/\nDONE$/, '') + '\n' + (c ? 'PASS' : 'FAIL') + ' ' + m + '\nDONE'; };
  try {
    const okEv = await fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'page_view', props: { path: '/anthem', ref: 'share' } }) });
    add(okEv.status === 204, 'event sink accepts page_view (' + okEv.status + ')');
    const badEv = await fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'evil_event' }) });
    add(badEv.status === 400, 'unknown events rejected (' + badEv.status + ')');
  } catch (e) { add(false, 'event sink exception: ' + e.message); }
})();
