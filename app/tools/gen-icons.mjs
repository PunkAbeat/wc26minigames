#!/usr/bin/env node
/* Render tools/icon.html into the PWA/home-screen icon set. No server needed
   (file:// URL). Re-run after editing icon.html. */
import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const src = 'file://' + join(here, 'icon.html')
const CHROME = process.env.CHROME_BIN || 'google-chrome'

const targets = [
  ['../public/icon-512.png', 512],
  ['../public/icon-192.png', 192],
  ['../public/apple-touch-icon.png', 180],
]
for (const [rel, size] of targets) {
  const out = join(here, rel)
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      `--window-size=${size},${size}`,
      '--force-device-scale-factor=1',
      `--screenshot=${out}`,
      src,
    ],
    { stdio: 'pipe', timeout: 60000 },
  )
  console.log(`wrote ${out} (${Math.round(statSync(out).size / 1024)}kB)`)
}
