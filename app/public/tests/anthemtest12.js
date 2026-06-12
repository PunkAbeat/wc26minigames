/* Suite 12 — GROUPS: daily flow, guessing, persistence, streak, share text.
   Runs on /groups (run-headless.mjs maps suite 12 there); drives the React
   app through window.__groups. Date-independent: assertions derive from the
   seeded daily puzzle itself. */
(async () => {
  const pre = document.createElement('pre'); pre.id = 'testout'; document.body.appendChild(pre);
  const R = []; const ok = (c, m) => { R.push((c ? 'PASS' : 'FAIL') + ' ' + m); pre.textContent = R.join('\n'); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    const t0 = Date.now();
    while (!(window.__groups && window.__groups.puzzle)) {
      if (Date.now() - t0 > 8000) throw new Error('timeout waiting for app');
      await sleep(40);
    }
    let G = window.__groups;
    localStorage.clear(); G.startDaily(); await sleep(80); G = window.__groups;
    G.hideHowto(); await sleep(40); G = window.__groups;

    const P = G.puzzle;
    const grp = (i) => P.groups[i].nations.slice();
    const pick = async (names) => {
      window.__groups.clearSel(); await sleep(30);
      for (const n of names) { window.__groups.toggleTile(n); await sleep(15); }
      window.__groups.submitGuess(); await sleep(80);
    };

    ok(P.groups.length === 4, 'daily puzzle loaded (4 groups)');
    ok(typeof G.gridNo === 'number' && G.gridNo === G.day + 1, 'grid # = day + 1 (' + G.gridNo + ')');
    const order = G.order.slice();
    ok(order.length === 16 && new Set(order).size === 16, 'board has 16 distinct tiles');
    ok(document.querySelectorAll('#board .tile').length === 16, '16 tiles rendered');
    ok(order.slice().sort().join('|') === P.groups.flatMap((g) => g.nations).sort().join('|'),
      'board tiles = puzzle nations');
    ok(document.getElementById('howto').className.indexOf('show') < 0, 'how-to dismissed');

    /* one away: 3 of group 0 + 1 of group 1 */
    await pick([...grp(0).slice(0, 3), grp(1)[0]]); G = window.__groups;
    ok(G.state.mistakes === 1, 'one-away costs a mistake');
    ok(document.getElementById('toast').textContent.length > 0, 'one-away toast shown');
    ok(document.querySelectorAll('#mistakes i.off').length === 1, 'mistake ball dimmed');

    /* duplicate of the same four (different order) must not cost */
    await pick([grp(1)[0], ...grp(0).slice(0, 3)]); G = window.__groups;
    ok(G.state.mistakes === 1 && G.state.guesses.length === 1, 'duplicate pick costs nothing');

    /* solve group 2 */
    await pick(grp(2)); G = window.__groups;
    ok(G.state.found.length === 1 && G.state.found[0] === 2, 'group solved');
    ok(document.querySelectorAll('#solved .banner').length === 1, 'solved banner rendered');
    ok(document.querySelectorAll('#board .tile').length === 12, 'solved tiles removed');

    /* mid-game persists and restores */
    const saved = JSON.parse(localStorage.getItem('groups_daily'));
    ok(saved && saved.state.mistakes === 1 && saved.state.found.length === 1, 'mid-game persisted');
    window.__groups.startDaily(); await sleep(80); G = window.__groups;
    ok(G.state.found.length === 1 && G.state.mistakes === 1, 'mid-game restored after reload');

    /* finish the win */
    await pick(grp(0)); await pick(grp(1)); await pick(grp(3)); G = window.__groups;
    ok(G.state.finished && G.state.won, 'win registered');
    ok(document.getElementById('endPanel') !== null, 'end panel shown');
    ok(document.getElementById('streakLine').textContent.indexOf('1') >= 0, 'streak = 1');
    ok(JSON.parse(localStorage.getItem('groups_streak')).count === 1, 'streak persisted');
    ok(document.getElementById('nextIn').textContent.length > 3, 'countdown ticking');
    const txt = G.shareText();
    const lines = txt.split('\n');
    ok(lines[0].indexOf('GROUPS') === 0 && lines[0].indexOf('#' + G.gridNo) > 0, 'share head has grid #');
    ok(lines.length === 1 + G.state.guesses.length + 1, 'share rows = guesses');
    ok(/^[🟨🟩🟦🟪]{4}$/u.test(lines[1]), 'share rows are tier emojis');
    ok(P.groups.every((g) => g.nations.every((n) => txt.indexOf(n) < 0)), 'share text is spoiler-free');

    /* restored finished game blocks replay */
    window.__groups.startDaily(); await sleep(80); G = window.__groups;
    ok(G.state.finished && G.state.won, 'finished daily restored — no replay');

    /* loss path on a fresh slate */
    localStorage.clear(); window.__groups.startDaily(); await sleep(80);
    window.__groups.hideHowto(); await sleep(30);
    const wrongs = [
      [...grp(0).slice(0, 3), grp(1)[0]],
      [...grp(0).slice(0, 3), grp(2)[0]],
      [...grp(0).slice(0, 3), grp(3)[0]],
      [...grp(1).slice(0, 3), grp(2)[0]],
    ];
    for (const w of wrongs) await pick(w);
    G = window.__groups;
    ok(G.state.finished && !G.state.won && G.state.mistakes === 4, '4 mistakes = full time');
    ok(document.querySelectorAll('#solved .banner.missed').length === 4, 'all groups revealed on loss');
    ok(JSON.parse(localStorage.getItem('groups_streak')).count === 0, 'loss zeroes the streak');
    ok(window.__groups.shareText().split('\n')[0].indexOf('X') > 0, 'loss share marked X');

    R.push('DONE'); pre.textContent = R.join('\n');
  } catch (e) { R.push('FAIL exception: ' + e.message); pre.textContent = R.join('\n'); }
})();
