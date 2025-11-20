// src/features/boilerplate/i18n/context.tsx

'use client' // Mark as client component

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import type { Locale } from './config'
import { I18N_CONFIG } from './config/i18n-config'

// Simple, flat translation storage
type Translations = Record<string, string>

interface I18nContextValue {
  locale: Locale
  translations: Translations
  t: (key: string, values?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  locale: Locale
  translations: Translations
  children: React.ReactNode
}

export function I18nProvider({ locale, translations, children }: I18nProviderProps) {
  const t = useCallback((key: string, values?: Record<string, string | number>) => {
    let text = translations[key]

    if (!text) {
      if (I18N_CONFIG.showMissingTranslationWarnings) {
        console.warn(`Missing translation: ${key}`)
      }
      return key
    }

    // Replace {variable} with values
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }

    return text
  }, [translations])

  const value = useMemo(() => ({ locale, translations, t }), [locale, translations, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
