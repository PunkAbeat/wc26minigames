/* First-party event beacon — sendBeacon so events survive tab closes (the
   share → close-tab path is exactly the one we care about). Fire-and-forget,
   client-only, no identifiers. */

export function track(name: string, props: Record<string, string> = {}): void {
  if (typeof window === 'undefined') return
  try {
    const payload = JSON.stringify({ name, props })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }))
      return
    }
    fetch('/api/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never let analytics break the game */
  }
}

/* page_view with the share-loop attribution (?ref=share) */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined') return
  const ref = new URLSearchParams(location.search).get('ref') || ''
  track('page_view', { path, ref })
}
