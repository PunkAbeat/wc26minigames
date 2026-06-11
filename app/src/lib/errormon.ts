/* Client-side error reporter: window errors + unhandled rejections beacon to
   /api/error (→ Workers Logs). Self-limiting: max 5 reports per page load,
   deduped by message, never throws. Client-only — call from a mount effect. */

let installed = false
let sent = 0
const seen = new Set<string>()
const MAX_PER_LOAD = 5

function report(message: string, stack?: string): void {
  if (sent >= MAX_PER_LOAD || seen.has(message)) return
  // browsers report opaque cross-origin failures as bare "Script error." —
  // nothing actionable in them
  if (message === 'Script error.') return
  seen.add(message)
  sent++
  try {
    const payload = JSON.stringify({
      message: message.slice(0, 300),
      stack: (stack || '').slice(0, 1500),
      url: location.pathname + location.search,
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/error', new Blob([payload], { type: 'application/json' }))
    } else {
      fetch('/api/error', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* the error reporter must never be a source of errors */
  }
}

export function installErrorMonitor(): void {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('error', (e) => {
    report(e.message || 'unknown error', e.error?.stack)
  })
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason
    report(
      r instanceof Error ? r.message : 'unhandledrejection: ' + String(r).slice(0, 200),
      r instanceof Error ? r.stack : undefined,
    )
  })
}
