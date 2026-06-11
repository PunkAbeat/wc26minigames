/* Suite 11 — hub newsletter capture: valid email → success state + stored,
   invalid rejected by the API, resubscribe is a silent success. Runs on the
   hub route (the runner requests /?anthemtest=11). */
(async () => {
  const pre = document.createElement('pre'); pre.id = 'testout';
  /* hydration can wipe body children added too early — re-attach on every write */
  const flush = () => { if (!pre.isConnected) document.body.appendChild(pre); pre.textContent = R.join('\n'); };
  const R = []; const ok = (c, m) => { R.push((c ? 'PASS' : 'FAIL') + ' ' + m); flush(); };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    const t0 = Date.now();
    /* wait for the form AND for React to have hydrated it (pre-hydration
       clicks would trigger a native form submit and navigate away) */
    let input = null;
    while (true) {
      input = document.getElementById('signupEmail');
      if (input && Object.keys(input).some((k) => k.startsWith('__react'))) break;
      if (Date.now() - t0 > 8000) throw new Error('timeout waiting for hydrated hub form');
      await sleep(40);
    }
    const setVal = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.bind(input);
    const email = 'suite11+' + Date.now() + '@example.com';
    setVal(email); input.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(3000); // the bot time-check needs a human-plausible delay after mount
    document.getElementById('signupBtn').click();
    const t1 = Date.now();
    while (!document.getElementById('signupDone') && Date.now() - t1 < 5000) await sleep(80);
    ok(!!document.getElementById('signupDone'), 'success state after subscribing');
    /* API contract directly */
    const post = (body) => fetch('/api/subscribe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const dupe = await post({ email, elapsed: 5000 });
    ok(dupe.status === 200, 'resubscribing same email is a silent success (' + dupe.status + ')');
    const bad = await post({ email: 'not-an-email', elapsed: 5000 });
    ok(bad.status === 400, 'garbage email rejected (' + bad.status + ')');
    const huge = await post({ email: 'a'.repeat(250) + '@b.co', elapsed: 5000 });
    ok(huge.status === 400, 'oversized email rejected (' + huge.status + ')');
    const hp = await post({ email: 'bot+' + Date.now() + '@example.com', website: 'http://spam', elapsed: 5000 });
    ok(hp.status === 200, 'honeypot gets a FAKE success (' + hp.status + ')');
    const fast = await post({ email: 'fast@example.com', elapsed: 100 });
    ok(fast.status === 400, 'sub-human submit speed rejected (' + fast.status + ')');
    const noTs = await post({ email: 'nots@example.com' });
    ok(noTs.status === 400, 'missing time signal rejected (' + noTs.status + ')');
    R.push('DONE'); flush();
  } catch (e) { R.push('FAIL exception: ' + e.message); flush(); }
})();
