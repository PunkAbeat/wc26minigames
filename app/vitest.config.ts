// Separate from vite.config.ts on purpose: the Cloudflare Workers plugin is
// incompatible with Vitest's node environment, and the unit suites only test
// pure modules — no Start/router plugins needed.
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
