#!/usr/bin/env node
/* Screenshot the /og route into public/og/*.png (1200×630 link-unfurl
   images). Run with the dev or preview server up:
     npm run preview -- --port 4173   (or npm run dev)
     node tools/gen-og.mjs [baseUrl]
   Then rebuild so the assets ship. */
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = process.argv[2] || 'http://localhost:4173'
const outDir = join(dirname(fileURLToPath(import.meta.url)), '../public/og')
mkdirSync(outDir, { recursive: true })

const CHROME = process.env.CHROME_BIN || 'google-chrome'
const SHOTS = [
  ['anthem.png', '/og'],
  ['matchday.png', '/og?card=matchday'],
  ['hoist.png', '/og?card=hoist'],
  ['keepies.png', '/og?card=keepies'],
]

for (const [file, path] of SHOTS) {
  const out = join(outDir, file)
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
      `${base}${path}`,
    ],
    { stdio: 'pipe', timeout: 60000 },
  )
  const size = statSync(out).size
  if (size < 20000) {
    console.error(`${file} suspiciously small (${size}B) — fonts may not have loaded`)
    process.exit(1)
  }
  console.log(`wrote ${out} (${Math.round(size / 1024)}kB)`)
}
