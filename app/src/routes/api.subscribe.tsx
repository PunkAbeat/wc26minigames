/* Newsletter capture from the hub — "tell me when new games drop".
   Stores the email and nothing else (deduped by primary key); used only to
   announce new games, deletable on request. */
import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'

interface D1Like {
  exec(q: string): Promise<unknown>
  prepare(q: string): {
    bind(...v: unknown[]): { run(): Promise<unknown> }
  }
}

let tableReady = false
async function db(): Promise<D1Like> {
  const { env } = await import('cloudflare:workers')
  const d1 = (env as { DB?: D1Like }).DB
  if (!d1) throw new Error('D1 binding DB missing')
  if (!tableReady) {
    // mirrors migrations/0002 — fresh local state dirs work without migrating
    await d1.exec(
      "CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, created_at TEXT NOT NULL DEFAULT (datetime('now')));",
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

export const Route = createFileRoute('/api/subscribe')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: { email?: unknown }
        try {
          body = await request.json()
        } catch {
          return json({ error: 'bad json' }, 400)
        }
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
        if (!email || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email))
          return json({ error: 'bad email' }, 400)
        try {
          const d1 = await db()
          // INSERT OR IGNORE: re-subscribing is a silent success, not an error
          await d1
            .prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)')
            .bind(email)
            .run()
          return json({ ok: true })
        } catch {
          return json({ error: 'unavailable' }, 503)
        }
      },
    },
  },
})
