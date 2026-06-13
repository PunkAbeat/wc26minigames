/* HOIST emblem — a 3D gold flag, rendered at emoji quality next to the hub's
   🎺/🏆. One source of truth: the MATCHDAY hub card and the in-game header both
   render it. The art is a raster icon (public/hoist-flag.png — a 3D gold flag
   keyed off its checkerboard background to real transparency); it ships at 256px
   so it stays crisp at the ≤64px display sizes (and on retina). */
export function FlagMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/hoist-flag.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      height={size}
      style={{ height: size, width: 'auto', display: 'block' }}
    />
  )
}
