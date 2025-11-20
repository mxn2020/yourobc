// src/features/boilerplate/i18n/utils.ts

/**
 * i18n Utility Functions
 *
 * Helper functions for internationalization
 */

import { format as formatDateFns } from 'date-fns'
import { enUS, es, fr, de, zhCN } from 'date-fns/locale'
import type { Locale } from './config'
import { getLocaleMetadata } from './config'
import type { NumberFormatOptions, DateFormatOptions } from './types'

/**
 * Date-fns locale mapping
 */
const dateFnsLocales = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  zh: zhCN,
}

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value)
  } catch (error) {
    console.error('Error formatting number:', error)
    return value.toString()
  }
}

/**
 * Format a currency value according to locale
 */
export function formatCurrency(
  value: number,
  locale: Locale,
  currency?: string
): string {
  const metadata = getLocaleMetadata(locale)
  const currencyCode = currency || metadata.numberFormat.currency

  return formatNumber(value, locale, {
    style: 'currency',
    currency: currencyCode,
  })
}

/**
 * Format a percentage according to locale
 */
export function formatPercent(
  value: number,
  locale: Locale,
  fractionDigits: number = 2
): string {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

/**
 * Format a date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale,
  formatString?: string
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const dateFnsLocale = dateFnsLocales[locale]
    const format = formatString || getLocaleMetadata(locale).dateFormat

    return formatDateFns(dateObj, format, { locale: dateFnsLocale })
  } catch (error) {
    console.error('Error formatting date:', error)
    return String(date)
  }
}

/**
 * Format a date with time according to locale
 */
export function formatDateTime(
  date: Date | string | number,
  locale: Locale
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const dateFnsLocale = dateFnsLocales[locale]

    // Different date-time formats per locale
    const formats: Record<Locale, string> = {
      en: 'MM/dd/yyyy HH:mm',
      es: 'dd/MM/yyyy HH:mm',
      fr: 'dd/MM/yyyy HH:mm',
      de: 'dd.MM.yyyy HH:mm',
      zh: 'yyyy/MM/dd HH:mm',
    }

    return formatDateFns(dateObj, formats[locale], { locale: dateFnsLocale })
  } catch (error) {
    console.error('Error formatting date time:', error)
    return String(date)
  }
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

    // Determine the appropriate unit
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  } catch (error) {
    console.error('Error formatting relative time:', error)
    return String(date)
  }
}

/**
 * Pluralize a value based on locale rules
 */
export function pluralize(
  count: number,
  locale: Locale,
  options: {
    zero?: string
    one: string
    two?: string
    few?: string
    many?: string
    other: string
  }
): string {
  const pr = new Intl.PluralRules(locale)
  const rule = pr.select(count)

  const value = options[rule as keyof typeof options] || options.other

  return value.replace('{count}', count.toString())
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.navigator.language || null
}

/**
 * Get locale from localStorage
 */
export function getStoredLocale(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return localStorage.getItem('locale')
  } catch (error) {
    console.error('Error reading locale from localStorage:', error)
    return null
  }
}

/**
 * Store locale in localStorage
 */
export function storeLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem('locale', locale)
  } catch (error) {
    console.error('Error storing locale in localStorage:', error)
  }
}

/**
 * Clear stored locale
 */
export function clearStoredLocale(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem('locale')
  } catch (error) {
    console.error('Error clearing locale from localStorage:', error)
  }
}

/**
 * Format file size according to locale
 */
export function formatFileSize(bytes: number, locale: Locale): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatNumber(size, locale, { maximumFractionDigits: 2 })} ${units[unitIndex]}`
}

/**
 * Get text direction for locale
 */
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  return getLocaleMetadata(locale).direction
}
