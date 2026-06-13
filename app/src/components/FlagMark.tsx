import { useId } from 'react'

/* HOIST emblem — a billowing flag on its pole, in brand gold with a gloss
   highlight, so it reads at emoji quality next to the hub's 🎺/🏆 while staying
   on-brand (and identical on every platform, unlike a flag emoji). One source
   of truth: the MATCHDAY hub card and the in-game header both render it.
   The billowing cloth + pole geometry is derived from Twemoji's flag glyph
   (© Twitter, CC-BY 4.0), recoloured to gold — credited in README. */
export function FlagMark({ size = 32 }: { size?: number }) {
  // unique per instance (hub + header both render it) and SSR-stable
  const uid = useId().replace(/:/g, '')
  const cloth = 'hoistcloth-' + uid
  const pole = 'hoistpole-' + uid
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={cloth} x1="6" y1="2" x2="32" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe884" />
          <stop offset="0.5" stopColor="#f4b620" />
          <stop offset="1" stopColor="#d2880a" />
        </linearGradient>
        <linearGradient id={pole} x1="2.5" y1="0" x2="7.5" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8a5f12" />
          <stop offset="0.45" stopColor="#d2ab3e" />
          <stop offset="1" stopColor="#7c5310" />
        </linearGradient>
      </defs>
      {/* pole + finial */}
      <rect x="3" y="2.2" width="4" height="33" rx="2" fill={`url(#${pole})`} />
      <circle cx="5" cy="2.6" r="2.3" fill="#d2ab3e" />
      {/* billowing cloth */}
      <path
        d="M32.415 3.09c-1.752-.799-3.615-1.187-5.698-1.187-2.518 0-5.02.57-7.438 1.122-2.418.551-4.702 1.072-6.995 1.072-1.79 0-3.382-.329-4.868-1.006-.309-.142-.67-.115-.956.068C6.173 3.343 6 3.66 6 4v19c0 .392.229.747.585.91 1.752.799 3.616 1.187 5.698 1.187 2.518 0 5.02-.57 7.438-1.122 2.418-.551 4.702-1.071 6.995-1.071 1.79 0 3.383.329 4.868 1.007.311.14.67.115.956-.069.287-.185.46-.502.46-.842V4c0-.392-.229-.748-.585-.91z"
        fill={`url(#${cloth})`}
      />
      {/* gloss highlight along the top billow */}
      <path
        d="M6.6 4.2c1.4.6 3 .9 4.8.9 2.3 0 4.6-.5 7-1.05 2.4-.55 4.9-1.12 7.4-1.12 1.1 0 2.1.1 3.1.36-1.5-.45-3-.36-4.6-.36-2.5 0-5 .57-7.4 1.12-2.4.55-4.7 1.05-7 1.05-1.2 0-2.3-.14-3.3-.45z"
        fill="#fff"
        opacity="0.35"
      />
    </svg>
  )
}
