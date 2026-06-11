/* Global daily stats — the "38% solved it in 3" social proof.
   Anonymous by design: the only thing stored is a counter per (day, tries)
   bucket. POST once per finished daily game (client fire-and-forget), GET the
   distribution for the end screen. D1-backed; local dev/preview run against
   miniflare's local D1, production needs `wrangler d1 create` + the real
   database_id in wrangler.jsonc. */
import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start' // loads the `server` route-option type augmentation
import { dayNumber } from '../lib/anthem/daily'

const TRIES = ['1', '2', '3', '4', '5', '6', 'X'] as const

/* minimal local typing instead of @cloudflare/workers-types — those globals
   collide with lib.dom in a mixed client/server tsconfig */
interface D1Like {
  exec(q: string): Promise<unknown>
  prepare(q: string): {
    bind(...v: unknown[]): {
      all<T>(): Promise<{ results: T[] }>
      run(): Promise<unknown>
    }
  }
}

let tableReady = false
async function db(): Promise<D1Like> {
  // dynamic import: 'cloudflare:workers' must never reach the client bundle
  const { env } = await import('cloudflare:workers')
  const d1 = (env as { DB?: D1Like }).DB
  if (!d1) throw new Error('D1 binding DB missing')
  if (!tableReady) {
    // mirrors migrations/0001 — keeps fresh local state dirs working without
    // a manual migration step
    await d1.exec(
      'CREATE TABLE IF NOT EXISTS anthem_results (day INTEGER NOT NULL, tries TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, tries));',
    )
    tableReady = true
  }
  return d1
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })

export const Route = createFileRoute('/api/anthem-stats')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url)
        const day = Number.parseInt(url.searchParams.get('day') ?? '', 10)
        if (!Number.isInteger(day) || day < 0) return json({ error: 'bad day' }, 400)
        try {
          const d1 = await db()
          const { results } = await d1
            .prepare('SELECT tries, n FROM anthem_results WHERE day = ?')
            .bind(day)
            .all<{ tries: string; n: number }>()
          const dist: Record<string, number> = {}
          for (const t of TRIES) dist[t] = 0
          let total = 0
          for (const r of results) {
            if (dist[r.tries] !== undefined) dist[r.tries] = r.n
            total += r.n
          }
          return json({ day, total, dist })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
      POST: async ({ request }: { request: Request }) => {
        let body: { day?: unknown; tries?: unknown }
        try {
          body = await request.json()
        } catch {
          return json({ error: 'bad json' }, 400)
        }
        const day = body.day
        const tries = body.tries
        if (
          !Number.isInteger(day) ||
          typeof tries !== 'string' ||
          !(TRIES as readonly string[]).includes(tries)
        )
          return json({ error: 'bad result' }, 400)
        /* only accept results for the server's current day (±1 for midnight
           clock skew) — keeps drive-by junk out of past/future buckets */
        if (Math.abs((day as number) - dayNumber()) > 1)
          return json({ error: 'wrong day' }, 400)
        try {
          const d1 = await db()
          await d1
            .prepare(
              'INSERT INTO anthem_results (day, tries, n) VALUES (?, ?, 1) ON CONFLICT(day, tries) DO UPDATE SET n = n + 1',
            )
            .bind(day, tries)
            .run()
          return new Response(null, { status: 204 })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
    },
  },
})
