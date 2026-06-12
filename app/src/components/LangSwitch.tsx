/* Language picker — native <select> (best behavior on iOS), shown as a small
   pill. Native names only: nobody should need a foreign word to find their
   own language. */
import { LANGS } from '../lib/i18n'
import type { Lang } from '../lib/i18n'

export function LangSwitch({
  lang,
  onChange,
  inline,
}: {
  lang: Lang
  onChange: (l: Lang) => void
  inline?: boolean
}) {
  return (
    <div className={'langswitch' + (inline ? ' inline' : '')}>
      <span className="globe" aria-hidden="true">
        🌐
      </span>
      <select
        className="langsel"
        aria-label="Language"
        value={lang}
        onChange={(e) => onChange(e.target.value as Lang)}
      >
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </div>
  )
}
