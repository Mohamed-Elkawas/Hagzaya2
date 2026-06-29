'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

import { translations } from '../locales/translations'

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = 'ar' | 'en'
type Direction = 'rtl' | 'ltr'

interface LanguageContextValue {
  lang: Language
  dir: Direction
  isArabic: boolean
  toggleLanguage: () => void
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

interface LanguageProviderProps {
  children: ReactNode
  defaultLang?: Language
}

export function LanguageProvider({
  children,
  defaultLang = 'ar',
}: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('hagzaya_lang') as Language | null
    return stored ?? defaultLang
  })

  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr'
  const isArabic = lang === 'ar'

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', lang)
    html.setAttribute('dir', dir)

    // Switch font family via data attribute on body
    document.body.setAttribute('data-lang', lang)

    // Persist
    localStorage.setItem('hagzaya_lang', lang)
  }, [lang, dir])

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'))
  }

  const setLanguage = (newLang: Language) => {
    setLangState(newLang)
  }

  const t = (key: import('../locales/translations').TranslationKey | string): string => {
    // @ts-ignore
    return translations[key]?.[lang] || key
  }

  return (
    <LanguageContext.Provider
      value={{ lang, dir, isArabic, toggleLanguage, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  }
  return ctx
}

export default LanguageContext
