/* Client error sink — browser errors funnel into Workers Logs via
   console.error, so server and client failures live in one searchable place
   (dashboard → Workers → wc26minigames → Logs). First-party on purpose
   (ADR-0003); Sentry is the documented upgrade path if triage outgrows this.
   The client caps itself to a few reports per page load; the server truncates
   hard so a hostile client can't bloat logs. */
import { createFileRoute } from '@tanstack/react-router'
import '@tanstack/react-start'

const cut = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

export const Route = createFileRoute('/api/error')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: Record<string, unknown>
        try {
          body = await request.json()
        } catch {
          return new Response(null, { status: 400 })
        }
        const message = cut(body.message, 300)
        if (!message) return new Response(null, { status: 400 })
        console.error(
          '[client-error]',
          JSON.stringify({
            message,
            stack: cut(body.stack, 1500),
            url: cut(body.url, 200),
            ua: cut(request.headers.get('user-agent'), 150),
          }),
        )
        return new Response(null, { status: 204 })
      },
    },
  },
})
