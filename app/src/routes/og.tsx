/* /og — internal brand-asset page (not linked anywhere): renders the generic
   share-card art full-bleed so tools/gen-og.mjs can screenshot it into
   public/og/*.png (the link-unfurl images). Keeping it a route means the
   OG images and the in-chat share cards share one drawing function and can
   never drift apart.
   /og          → ANTHEM result card  (public/og/anthem.png)
   /og?card=matchday → MATCHDAY hub card (public/og/matchday.png) */
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { drawMatchdayCard, drawShareCard } from '../lib/anthem/sharecard'

export const Route = createFileRoute('/og')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: OgPage,
})

function OgPage() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const draw = () => {
      if (!ref.current) return
      if (new URLSearchParams(location.search).get('card') === 'matchday') {
        drawMatchdayCard(ref.current)
      } else {
        drawShareCard(ref.current, {
          results: ['wrong', 'skip', 'correct'], // an inviting mid-story grid, no spoiler
          won: true,
          tries: '3',
          mode: 'daily',
          matchNo: 1,
          streak: 0,
          host: '',
        })
      }
      document.title = 'og-ready' // gen-og.mjs waits for this
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw)
      // belt and braces: redraw once more in case fonts landed late
      setTimeout(draw, 1200)
    } else draw()
  }, [])
  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', display: 'block' }}
    />
  )
}
