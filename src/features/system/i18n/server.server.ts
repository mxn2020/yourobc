// src/features/boilerplate/i18n/server.ts

import { readFileSync } from 'fs'
import { join } from 'path'
import type { Locale, Namespace } from './config'
import { I18N_CONFIG } from './config/i18n-config'

// In-memory cache (survives across requests)
const cache = new Map<string, Record<string, string>>()

/**
 * Load and flatten translations
 * Converts nested JSON to flat keys: { projects: { page: { title: "X" }}} → { "projects.page.title": "X" }
 */
export function loadTranslations(locale: Locale, namespaces: Namespace[]): Record<string, string> {
  const cacheKey = `${locale}:${namespaces.join(',')}`

  // Check cache if caching is enabled
  if (I18N_CONFIG.cacheTranslations && cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const flat: Record<string, string> = {}

  for (const namespace of namespaces) {
    try {
      // ✅ Fixed path - translations are in src/features/boilerplate/i18n/locales
      const path = join(process.cwd(), 'src', 'features', 'boilerplate', 'i18n', 'locales', locale, `${namespace}.json`)
      const content = JSON.parse(readFileSync(path, 'utf-8'))

      // Flatten nested object
      flattenObject(content, namespace, flat)
    } catch (error) {
      console.error(`Failed to load ${locale}/${namespace}:`, error)
    }
  }

  // Only cache if caching is enabled
  if (I18N_CONFIG.cacheTranslations) {
    cache.set(cacheKey, flat)
  }

  return flat
}

/**
 * Wrapper for server-side translation loading
 * Can be called directly in beforeLoad since it already runs on the server
 *
 * Example usage in route beforeLoad:
 * ```ts
 * const translations = typeof window === 'undefined'
 *   ? loadTranslationsServer(locale, ['common', 'ui'])
 *   : window.__TRANSLATIONS__ || {}
 * ```
 */
export function loadTranslationsServer(locale: Locale, namespaces: Namespace[]): Record<string, string> {
  try {
    return loadTranslations(locale, namespaces)
  } catch (error) {
    console.error('Failed to load translations on server:', error)
    return {}
  }
}

function flattenObject(obj: any, prefix: string, result: Record<string, string>) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = `${prefix}.${key}`

    if (typeof value === 'string') {
      result[fullKey] = value
    } else if (typeof value === 'object' && value !== null) {
      flattenObject(value, fullKey, result)
    }
  }
}

