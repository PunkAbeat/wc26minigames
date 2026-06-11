/* Funnel analytics sink — cookieless, anonymous, first-party.
   The client beacons {name, props} here; we write a data point to Workers
   Analytics Engine (dataset wc26_events). No user IDs, no IPs stored — the
   only dimensions are the event name and its props. Query later via the AE
   SQL API: share rate = share_clicked / game_finished, viral loop =
   page_view{ref=share} / share_clicked. Locally a silent no-op. */
import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'

export const EVENT_NAMES = [
  'page_view', // props: path, ref
  'game_finished', // props: mode, tries ('1'..'6'|'X')
  'share_clicked', // props: mode
  'practice_started',
] as const

interface AnalyticsEngineLike {
  writeDataPoint(p: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void
}

const str = (v: unknown, max = 64) => (typeof v === 'string' ? v.slice(0, max) : '')

export const Route = createFileRoute('/api/event')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: { name?: unknown; props?: Record<string, unknown> }
        try {
          body = await request.json()
        } catch {
          return new Response(null, { status: 400 })
        }
        const name = body.name
        if (typeof name !== 'string' || !(EVENT_NAMES as readonly string[]).includes(name))
          return new Response(null, { status: 400 })
        const p = body.props || {}
        try {
          const { env } = await import('cloudflare:workers')
          const sink = (env as { EVENTS?: AnalyticsEngineLike }).EVENTS
          sink?.writeDataPoint({
            indexes: [name],
            blobs: [name, str(p.path), str(p.ref), str(p.mode), str(p.tries, 2)],
            doubles: [1],
          })
        } catch {
          /* no binding locally / sink down — analytics must never 500 the app */
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
