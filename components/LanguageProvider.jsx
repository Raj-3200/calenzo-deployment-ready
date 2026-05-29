'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_LANGUAGE, languageOrDefault } from '@/lib/i18n'

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
})

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE
    return languageOrDefault(window.localStorage.getItem('calenzo-language') || DEFAULT_LANGUAGE)
  })

  useEffect(() => {
    const normalized = languageOrDefault(language)
    document.documentElement.lang = normalized
    window.localStorage.setItem('calenzo-language', normalized)
    document.cookie = `calenzo-language=${normalized}; path=/; max-age=31536000; samesite=lax`
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage: (nextLanguage) => setLanguageState(languageOrDefault(nextLanguage)),
  }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
