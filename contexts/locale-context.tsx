"use client"

import React, { createContext, useContext, useMemo } from 'react'
import { type Locale, getTranslations } from '@/lib/i18n'
import { useAuth } from '@/contexts/auth-context'

interface LocaleContextType {
  locale: Locale
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const locale: Locale = user?.language === 'ru' ? 'ru' : 'en'

  const value = useMemo(() => {
    const translations = getTranslations(locale)
    const t = (key: string) => translations[key] || key
    return { locale, t }
  }, [locale])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}
