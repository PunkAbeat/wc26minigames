#!/usr/bin/env node
/* Screenshot the /og route into public/og/anthem.png (1200×630 link-unfurl
   image). Run with the dev or preview server up:
     npm run preview -- --port 4173   (or npm run dev)
     node tools/gen-og.mjs [baseUrl]
   Then rebuild so the asset ships. */
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.argv[2] || 'http://localhost:4173'
const out = join(dirname(fileURLToPath(import.meta.url)), '../public/og/anthem.png')
mkdirSync(dirname(out), { recursive: true })

const CHROME = process.env.CHROME_BIN || 'google-chrome'
execFileSync(
  CHROME,
  [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1200,630',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=6000',
    `--screenshot=${out}`,
    `${base}/og`,
  ],
  { stdio: 'pipe', timeout: 60000 },
)
const size = statSync(out).size
if (size < 20000) {
  console.error(`og image suspiciously small (${size}B) — fonts may not have loaded`)
  process.exit(1)
}
console.log(`wrote ${out} (${Math.round(size / 1024)}kB)`)
