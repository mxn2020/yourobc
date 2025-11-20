// src/features/system/i18n/config/i18n-config.ts

/**
 * I18n Configuration
 *
 * Detects and configures internationalization based on environment variables.
 * Allows enabling/disabling i18n and configuring locale behavior.
 */

import { locales, defaultLocale } from '../config'
import type { Locale } from '../config'

export interface I18nConfig {
  /** Whether i18n is enabled globally */
  enabled: boolean
  /** Default locale for the application */
  defaultLocale: Locale
  /** List of enabled locales */
  enabledLocales: Locale[]
  /** Fallback locale if translation missing */
  fallbackLocale: Locale
  /** Whether to detect and use browser locale */
  detectBrowserLocale: boolean
  /** Whether to persist locale selection in localStorage */
  persistLocale: boolean
  /** Whether to show language switcher in UI */
  showLanguageSwitcher: boolean
  /** Whether to cache translations in memory */
  cacheTranslations: boolean
  /** Whether to show missing translation warnings in console */
  showMissingTranslationWarnings: boolean
}

/**
 * Safe environment variable access for browser
 */
function getViteEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key]
  }
  return undefined
}

/**
 * Get environment variable with default value
 */
function getViteEnvWithDefault(key: string, defaultValue: string): string {
  return getViteEnv(key) ?? defaultValue
}

/**
 * Check if environment variable is "true" (default true if not set)
 */
function viteEnvIsTrue(key: string, defaultValue: boolean = true): boolean {
  const value = getViteEnv(key)
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true'
}

/**
 * Parse comma-separated locales from env
 */
function parseLocales(envValue: string | undefined): Locale[] {
  if (!envValue) return [...locales]

  const parsed = envValue
    .split(',')
    .map(l => l.trim() as Locale)
    .filter(l => locales.includes(l))

  return parsed.length > 0 ? parsed : [...locales]
}

/**
 * Get i18n configuration from environment variables
 */
export function getI18nConfig(): I18nConfig {
  // Check if i18n is enabled (default: true)
  const enabled = viteEnvIsTrue('VITE_ENABLE_I18N', true)

  // Get default locale (fallback to 'en' if invalid)
  const defaultLocaleEnv = getViteEnvWithDefault('VITE_I18N_DEFAULT_LOCALE', 'en') as Locale
  const validDefaultLocale = locales.includes(defaultLocaleEnv) ? defaultLocaleEnv : defaultLocale

  // Get enabled locales (default: all locales)
  const enabledLocalesEnv = getViteEnv('VITE_I18N_ENABLED_LOCALES')
  const enabledLocales = parseLocales(enabledLocalesEnv)

  // Ensure default locale is in enabled locales
  if (!enabledLocales.includes(validDefaultLocale)) {
    enabledLocales.unshift(validDefaultLocale)
  }

  // Get fallback locale (default: same as default locale)
  const fallbackLocaleEnv = getViteEnvWithDefault('VITE_I18N_FALLBACK_LOCALE', validDefaultLocale) as Locale
  const fallbackLocale = locales.includes(fallbackLocaleEnv) ? fallbackLocaleEnv : validDefaultLocale

  return {
    enabled,
    defaultLocale: validDefaultLocale,
    enabledLocales,
    fallbackLocale,
    detectBrowserLocale: viteEnvIsTrue('VITE_I18N_DETECT_BROWSER_LOCALE', true),
    persistLocale: viteEnvIsTrue('VITE_I18N_PERSIST_LOCALE', true),
    showLanguageSwitcher: viteEnvIsTrue('VITE_I18N_SHOW_LANGUAGE_SWITCHER', true),
    cacheTranslations: viteEnvIsTrue('VITE_I18N_CACHE_TRANSLATIONS', true),
    showMissingTranslationWarnings: viteEnvIsTrue('VITE_I18N_SHOW_MISSING_WARNINGS', true),
  }
}

/**
 * Singleton i18n configuration
 */
export const I18N_CONFIG = getI18nConfig()

/**
 * Check if i18n is enabled
 */
export function isI18nEnabled(): boolean {
  return I18N_CONFIG.enabled
}

/**
 * Check if a locale is enabled
 */
export function isLocaleEnabled(locale: string): boolean {
  if (!I18N_CONFIG.enabled) return locale === I18N_CONFIG.defaultLocale
  return I18N_CONFIG.enabledLocales.includes(locale as Locale)
}

/**
 * Get the list of enabled locales
 * If i18n is disabled, returns only the default locale
 */
export function getEnabledLocales(): Locale[] {
  if (!I18N_CONFIG.enabled) return [I18N_CONFIG.defaultLocale]
  return I18N_CONFIG.enabledLocales
}
