// src/features/boilerplate/i18n/types.ts

/**
 * i18n TypeScript Types
 *
 * Type definitions for internationalization
 */

import type { Locale, Namespace } from './config'

/**
 * Translation function type
 */
export type TranslationFunction = (
  key: string,
  values?: Record<string, string | number>
) => string

/**
 * Locale change handler
 */
export type LocaleChangeHandler = (locale: Locale) => void | Promise<void>

/**
 * Translation message format
 */
export interface Messages {
  [key: string]: string | Messages
}

/**
 * Translation namespace messages
 */
export type NamespaceMessages = Record<Namespace, Messages>

/**
 * Locale data
 */
export interface LocaleData {
  locale: Locale
  messages: Messages
}

/**
 * i18n Context
 */
export interface I18nContext {
  locale: Locale
  setLocale: (locale: Locale) => void | Promise<void>
  t: TranslationFunction
  isLoading: boolean
}

/**
 * Translation key type (for autocomplete)
 * This will be generated/extended as we add translations
 */
export type TranslationKey = string

/**
 * Format options for numbers
 */
export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent'
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Format options for dates
 */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit'
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  day?: 'numeric' | '2-digit'
  hour?: 'numeric' | '2-digit'
  minute?: 'numeric' | '2-digit'
  second?: 'numeric' | '2-digit'
  timeZone?: string
}
