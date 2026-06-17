/* KEEPIES emblem — a glossy gold football, rendered at emoji quality next to the
   hub's 🎺 (ANTHEM) and the HOIST flag. One source of truth: the MATCHDAY hub card
   and the in-game wordmark both render it. The art is a raster icon
   (public/keepies-ball.png — a gold ball keyed off its checkerboard background to
   real transparency); it ships at 256px so it stays crisp at the ≤64px display
   sizes (and on retina). */
export function BallMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/keepies-ball.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      height={size}
      style={{ height: size, width: 'auto', display: 'block' }}
    />
  )
}
