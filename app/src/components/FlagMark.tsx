import { useId } from 'react'

/* HOIST emblem — a waving national flag on its pole, in three bands of brand
   gold (so it reads unambiguously as a *flag*, the point of the game). One
   source of truth so the MATCHDAY hub card and the in-game header never drift.
   Emoji flags render differently per platform (🎌 looked like two Japanese
   flags, 💧 like a blue drop), so the mark is hand-drawn. */
export function FlagMark({ size = 32 }: { size?: number }) {
  // unique per instance (hub + header both render it) and SSR-stable
  const clip = 'hoistflag-' + useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* pole + finial */}
      <circle cx="5.85" cy="2.8" r="1.9" fill="#caa02a" />
      <rect x="4.7" y="2.4" width="2.3" height="23.4" rx="1.15" fill="#a8761a" />
      {/* waving banner, filled with three gold bands */}
      <clipPath id={clip}>
        <path d="M7 3.9C10.6 2.4 13.2 5 16.4 4 19.6 3 22.4 3.5 24.6 4.4L24.6 12.7C22.4 13.6 19.6 13.1 16.4 12.1 13.2 11.1 10.6 13.6 7 12.2Z" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x="6" y="2" width="20" height="3.8" fill="#ffe482" />
        <rect x="6" y="5.8" width="20" height="3.8" fill="#f2b21d" />
        <rect x="6" y="9.6" width="20" height="4.6" fill="#d68d0b" />
      </g>
      {/* soft sheen so the cloth catches light */}
      <path
        d="M7.4 5.6C10.7 4.2 13.2 6.4 16.2 5.5"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
