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
import { drawHoistOg } from '../lib/flagsort/sharecard'
import { drawKeepiesOg } from '../lib/keepies/sharecard'

export const Route = createFileRoute('/og')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: OgPage,
})

function OgPage() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const draw = async () => {
      if (!ref.current) return
      const card = new URLSearchParams(location.search).get('card')
      if (card === 'matchday') {
        drawMatchdayCard(ref.current)
      } else if (card === 'hoist') {
        await drawHoistOg(ref.current) // async: rasterises the 48 flag SVGs
      } else if (card === 'keepies') {
        await drawKeepiesOg(ref.current) // async: loads the gold-ball raster
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
