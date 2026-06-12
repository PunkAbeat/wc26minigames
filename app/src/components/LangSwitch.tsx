/* EN/ES/FR pills — phase-1 language switcher, shared by hub and game pages. */
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
    <div className={'langswitch' + (inline ? ' inline' : '')} role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={'lang' + (l.code === lang ? ' on' : '')}
          aria-pressed={l.code === lang}
          onClick={() => onChange(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
