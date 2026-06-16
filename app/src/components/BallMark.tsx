/* KEEPIES emblem — a classic football with a gold rim, rendered next to the hub's
   🎺 (ANTHEM) and the HOIST flag. Inline SVG (emoji balls render inconsistently
   across platforms); mirrors the in-game crest ball: white panels, navy seams,
   gold ring. Shared by the hub card and the in-game wordmark. */
export function BallMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <circle cx="24" cy="24" r="20" fill="#f6f8fb" stroke="#ffd34d" strokeWidth="3" />
      {/* centre pentagon */}
      <polygon points="24,17 30.7,21.8 28.1,29.7 19.9,29.7 17.3,21.8" fill="#14324f" />
      {/* seams from each vertex to the rim */}
      <g stroke="#14324f" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="17" x2="24" y2="6" />
        <line x1="30.7" y1="21.8" x2="40" y2="18.5" />
        <line x1="28.1" y1="29.7" x2="34" y2="39" />
        <line x1="19.9" y1="29.7" x2="14" y2="39" />
        <line x1="17.3" y1="21.8" x2="8" y2="18.5" />
      </g>
    </svg>
  )
}
