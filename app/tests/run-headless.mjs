#!/usr/bin/env node
/* Headless-Chrome runner for the ANTHEM behavioral suites.
   Same pattern as the original prototype's harness: load the game with a
   media stub (installed by the app when ?anthemtest=N is present), let
   virtual time fast-forward the timers, --dump-dom, then grep the
   <pre id="testout"> report for PASS/FAIL/DONE.

   Usage: node tests/run-headless.mjs [baseUrl] [suite...]
     baseUrl defaults to http://localhost:4173 (vite preview)
     suites default to 1..6 */
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const baseUrl = args.find((a) => a.startsWith('http')) || 'http://localhost:4173'
const suites = args.filter((a) => /^[1-9]$/.test(a)).map(Number)
const toRun = suites.length ? suites : [1, 2, 3, 4, 5, 6, 7, 8, 9]

const CHROME =
  process.env.CHROME_BIN ||
  ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].find((c) => {
    try {
      execFileSync('which', [c], { stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  })
if (!CHROME) {
  console.error('No Chrome/Chromium binary found (set CHROME_BIN)')
  process.exit(2)
}

const unescapeHtml = (s) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')

/* warm the target first: a freshly (re)started preview loads the worker into
   workerd lazily, and a cold first hit can eat suite 1's startup budget */
try {
  execFileSync('curl', ['-fs', '-o', '/dev/null', '--retry', '10', '--retry-delay', '1', '--retry-all-errors', `${baseUrl}/anthem`], { timeout: 60000 })
  execFileSync('curl', ['-fs', '-o', '/dev/null', `${baseUrl}/api/anthem-stats?day=0`], { timeout: 30000 })
} catch {
  console.error(`target ${baseUrl} not reachable`)
  process.exit(2)
}

let failed = false
for (const n of toRun) {
  const url = `${baseUrl}/anthem?anthemtest=${n}`
  process.stdout.write(`\n=== suite ${n}  ${url}\n`)
  let dom = ''
  try {
    dom = execFileSync(
      CHROME,
      [
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--autoplay-policy=no-user-gesture-required',
        '--window-size=390,844', // iPhone-ish viewport: the layout suite checks positions
        '--virtual-time-budget=20000',
        '--dump-dom',
        url,
      ],
      { encoding: 'utf-8', timeout: 90000, maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] },
    )
  } catch (e) {
    console.error(`chrome failed: ${e.message}`)
    failed = true
    continue
  }
  const m = dom.match(/<pre id="testout">([\s\S]*?)<\/pre>/)
  if (!m) {
    console.error('FAIL no testout block (page error or suite never ran)')
    failed = true
    continue
  }
  const report = unescapeHtml(m[1]).trim()
  console.log(report)
  if (/(^|\n)FAIL/.test(report) || !report.includes('DONE')) failed = true
}

console.log(failed ? '\nHEADLESS: FAILURES' : '\nHEADLESS: ALL GREEN')
process.exit(failed ? 1 : 0)
