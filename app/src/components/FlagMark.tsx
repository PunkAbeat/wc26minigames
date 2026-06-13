/* HOIST emblem — a national flag waving on its pole, in brand gold.
   One source of truth so the MATCHDAY hub card and the in-game header
   never drift. Emoji flags render differently per platform (and 🎌 read
   as two Japanese flags, 💧 as a blue drop), so the mark is hand-drawn. */
export function FlagMark({ size = 32 }: { size?: number }) {
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
      <circle cx="6" cy="3.2" r="2.1" fill="#cf9a1e" />
      <rect x="4.7" y="2.8" width="2.5" height="22.7" rx="1.25" fill="#cf9a1e" />
      {/* waving banner */}
      <path
        d="M7.2 3.9C11 2 14 5.4 18 3.9c3-1.2 6-.4 7 0v9.2c-1 .4-4 1.2-7 0-4-1.6-7 1.8-10.8 0V3.9Z"
        fill="#ffd23f"
      />
      {/* sheen so the banner reads as cloth, not a flat blob */}
      <path
        d="M7.2 6.4C11 4.6 14 7.9 18 6.4c1-.4 2-.5 2.9-.4"
        stroke="#fff0b0"
        strokeOpacity=".6"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}
