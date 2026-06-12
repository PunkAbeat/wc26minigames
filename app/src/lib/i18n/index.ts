/* i18n: typed string tables, one file per language (en.ts is the source of
   truth — every other table is a complete Record<StringKey, string>, so a
   missing translation is a compile error). Deliberately NOT a library — a
   lookup and a {var} substituter cover everything this site says.

   Phase status: all 11 shipped — en/es/fr/pt/de/nl/tr (Latin) + ar/fa
   (RTL; <html dir> from LANGS, the audio player is pinned LTR in CSS) +
   ja/ko (CJK glyphs come from system-font fallback — Baloo 2/Nunito only
   ship Latin subsets). ar/fa/ja/ko are machine-written and flagged for
   native review. Per-nation editorial content (hints, verdicts) stays EN.

   SSR note: the server always renders EN ('en' is the useState initial
   value); the detected/saved language is applied in the first client effect —
   same placeholder-then-fill pattern as the hub countdown, so hydration can
   never mismatch. */

import { createElement, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { en } from './en'
import type { StringKey } from './en'
import { es } from './es'
import { fr } from './fr'
import { pt } from './pt'
import { de } from './de'
import { nl } from './nl-lang'
import { tr } from './tr'
import { ar } from './ar'
import { fa } from './fa'
import { ja } from './ja'
import { ko } from './ko'

export type { StringKey }

const TABLES = { en, es, fr, pt, de, nl, tr, ar, fa, ja, ko }
export type Lang = keyof typeof TABLES

/* native names — a language picker should never make you read a foreign word
   to find your own language. dir feeds <html dir> when rtl langs ship. */
export const LANGS: { code: Lang; native: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', native: 'English', dir: 'ltr' },
  { code: 'es', native: 'Español', dir: 'ltr' },
  { code: 'fr', native: 'Français', dir: 'ltr' },
  { code: 'pt', native: 'Português', dir: 'ltr' },
  { code: 'de', native: 'Deutsch', dir: 'ltr' },
  { code: 'nl', native: 'Nederlands', dir: 'ltr' },
  { code: 'tr', native: 'Türkçe', dir: 'ltr' },
  { code: 'ar', native: 'العربية', dir: 'rtl' },
  { code: 'fa', native: 'فارسی', dir: 'rtl' },
  { code: 'ja', native: '日本語', dir: 'ltr' },
  { code: 'ko', native: '한국어', dir: 'ltr' },
]

const LS_KEY = 'wc26_lang'

function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && v in TABLES
}

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (isLang(saved)) return saved
  } catch {
    /* storage blocked */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || ''
  const prefix = nav.slice(0, 2).toLowerCase()
  return isLang(prefix) ? prefix : 'en'
}

export function saveLang(l: Lang): void {
  try {
    localStorage.setItem(LS_KEY, l)
  } catch {
    /* storage blocked */
  }
}

export function t(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  let s: string = TABLES[lang][key] ?? en[key]
  if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', String(vars[k]))
  return s
}

/* like t(), but renders **spans** as <b> — for the how-to steps */
export function tb(
  lang: Lang,
  key: StringKey,
  vars?: Record<string, string | number>,
): ReactNode[] {
  return t(lang, key, vars)
    .split('**')
    .map((part, i) => (i % 2 ? createElement('b', { key: i }, part) : part))
}

/* SSR-stable language hook: first render is always EN, the detected/saved
   language lands in the first client effect (and on <html lang>/<html dir>). */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>('en')
  useEffect(() => {
    setLang(detectLang())
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = LANGS.find((l) => l.code === lang)?.dir || 'ltr'
  }, [lang])
  const set = (l: Lang) => {
    saveLang(l)
    setLang(l)
  }
  return [lang, set]
}
