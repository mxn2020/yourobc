// src/features/boilerplate/i18n/utils/path.ts
// Client-safe path utilities for i18n

import type { Locale } from '../config'
import { I18N_CONFIG, getEnabledLocales } from '../config/i18n-config'

/**
 * Detect locale from URL path
 * If i18n is disabled, always returns default locale
 * If requireLocalePrefix is false, returns default locale if no prefix found
 */
export function getLocaleFromPath(pathname: string): Locale {
  // If i18n is disabled, always return default locale
  if (!I18N_CONFIG.enabled) {
    return I18N_CONFIG.defaultLocale
  }

  const segment = pathname.split('/')[1]
  const enabledLocales = getEnabledLocales()

  // Check if segment is a valid enabled locale
  if (enabledLocales.includes(segment as Locale)) {
    return segment as Locale
  }

  return I18N_CONFIG.defaultLocale
}

/**
 * Remove locale from path: /de/projects → /projects
 * Assumes routes are under /$locale/ directory structure
 */
export function stripLocaleFromPath(pathname: string): string {
  const segment = pathname.split('/')[1]
  const enabledLocales = getEnabledLocales()

  if (enabledLocales.includes(segment as Locale)) {
    return '/' + pathname.split('/').slice(2).join('/')
  }

  return pathname
}

/**
 * Add locale to path: /projects → /de/projects
 * Assumes routes are under /$locale/ directory structure
 */
export function addLocaleToPath(pathname: string, locale: Locale): string {
  const stripped = stripLocaleFromPath(pathname)
  return `/${locale}${stripped}`
}

/**
 * Get current locale from window location
 * Returns default locale if not found or in server context
 */
export function getCurrentLocale(): Locale {
  // Server-side: return default locale
  if (typeof window === 'undefined') {
    return I18N_CONFIG.defaultLocale
  }

  // Client-side: extract from pathname
  return getLocaleFromPath(window.location.pathname)
}

/**
 * Build a locale-aware route path
 * Used for type-safe navigation with i18n support
 *
 * Examples:
 * - buildLocalePath('/dashboard') → '/{-$locale}/dashboard'
 * - buildLocalePath('/auth/login') → '/{-$locale}/auth/login'
 * - buildLocalePath('/dashboard', 'de') → '/de/dashboard'
 */
export function buildLocalePath(path: string, locale?: Locale): string {
  // Remove leading slash if present for consistency
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // If specific locale is provided, use it
  if (locale) {
    return `/${locale}/${cleanPath}`
  }

  // Otherwise, use the route pattern with locale parameter
  return `/{-$locale}/${cleanPath}` as const
}
