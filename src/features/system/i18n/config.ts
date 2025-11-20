// src/features/system/i18n/config.ts

/**
 * i18n Configuration
 *
 * This file contains the main configuration for internationalization
 * including supported locales, default locale, and locale-related settings.
 */

export const locales = ['en', 'es', 'fr', 'de', 'zh'] as const
export type Locale = (typeof locales)[number]

// Read default locale from environment variable, fallback to 'en'
const envDefaultLocale = import.meta.env.VITE_I18N_DEFAULT_LOCALE as string | undefined
export const defaultLocale: Locale = (envDefaultLocale && locales.includes(envDefaultLocale as Locale))
  ? (envDefaultLocale as Locale)
  : 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '简体中文',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  zh: '🇨🇳',
}

/**
 * Translation namespaces
 * These correspond to the JSON files in src/i18n/locales/{locale}/
 */
export const namespaces = [
  'common',
  'ui',
  'auth',
  'dashboard',
  'projects',
  'tasks',
  'settings',
  'admin',
  'blog',
  'websites',
  'ai',
  'payments',
  'email',
  'notifications',
  'errors',
  'validation',
  'metadata',
] as const

export type Namespace = (typeof namespaces)[number]

/**
 * Locale metadata for enhanced functionality
 */
export const localeMetadata: Record<Locale, {
  code: string
  name: string
  nativeName: string
  flag: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  numberFormat: {
    decimal: string
    thousands: string
    currency: string
  }
}> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'USD',
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR',
    },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      decimal: ',',
      thousands: ' ',
      currency: 'EUR',
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    dateFormat: 'dd.MM.yyyy',
    numberFormat: {
      decimal: ',',
      thousands: '.',
      currency: 'EUR',
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳',
    direction: 'ltr',
    dateFormat: 'yyyy/MM/dd',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: 'CNY',
    },
  },
}

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

/**
 * Get locale from string with fallback
 */
export function getValidLocale(locale: string | null | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return defaultLocale
}

/**
 * Get locale metadata
 */
export function getLocaleMetadata(locale: Locale) {
  return localeMetadata[locale]
}
