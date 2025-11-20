// src/features/boilerplate/i18n/utils/validateTranslations.ts

/**
 * Translation Validation Utility
 *
 * Helps ensure translation files are complete and consistent across locales
 */

import { locales, namespaces, type Locale, type Namespace } from '../config'

interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  summary: {
    totalKeys: number
    missingKeys: number
    extraKeys: number
  }
}

/**
 * Get all keys from a nested object as dot-notation paths
 */
function getKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = []

  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getKeys(obj[key], path))
    } else {
      keys.push(path)
    }
  }

  return keys
}

/**
 * Load a translation file
 */
async function loadTranslationFile(locale: Locale, namespace: Namespace): Promise<any> {
  try {
    const translations = await import(`../locales/${locale}/${namespace}.json`)
    return translations.default || translations
  } catch (error) {
    return null
  }
}

/**
 * Compare two sets of translation keys
 */
function compareKeys(baseKeys: string[], compareKeys: string[]) {
  const missing = baseKeys.filter(key => !compareKeys.includes(key))
  const extra = compareKeys.filter(key => !baseKeys.includes(key))

  return { missing, extra }
}

/**
 * Validate translations for a specific namespace across all locales
 */
export async function validateNamespace(
  namespace: Namespace,
  baseLocale: Locale = 'en'
): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Load base locale (reference)
  const baseTranslations = await loadTranslationFile(baseLocale, namespace)

  if (!baseTranslations) {
    return {
      valid: false,
      errors: [`Base locale '${baseLocale}' not found for namespace '${namespace}'`],
      warnings: [],
      summary: { totalKeys: 0, missingKeys: 0, extraKeys: 0 }
    }
  }

  const baseKeys = getKeys(baseTranslations)
  let totalMissingKeys = 0
  let totalExtraKeys = 0

  // Compare each locale against the base
  for (const locale of locales) {
    if (locale === baseLocale) continue

    const translations = await loadTranslationFile(locale, namespace)

    if (!translations) {
      warnings.push(`Missing translation file for locale '${locale}' in namespace '${namespace}'`)
      continue
    }

    const localeKeys = getKeys(translations)
    const { missing, extra } = compareKeys(baseKeys, localeKeys)

    if (missing.length > 0) {
      totalMissingKeys += missing.length
      errors.push(
        `Locale '${locale}' is missing ${missing.length} key(s) in '${namespace}': ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`
      )
    }

    if (extra.length > 0) {
      totalExtraKeys += extra.length
      warnings.push(
        `Locale '${locale}' has ${extra.length} extra key(s) in '${namespace}': ${extra.slice(0, 5).join(', ')}${extra.length > 5 ? '...' : ''}`
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalKeys: baseKeys.length,
      missingKeys: totalMissingKeys,
      extraKeys: totalExtraKeys
    }
  }
}

/**
 * Validate all translations
 */
export async function validateAllTranslations(baseLocale: Locale = 'en'): Promise<{
  valid: boolean
  results: Record<Namespace, ValidationResult>
  summary: {
    totalNamespaces: number
    validNamespaces: number
    totalErrors: number
    totalWarnings: number
  }
}> {
  const results: Record<string, ValidationResult> = {}
  let totalErrors = 0
  let totalWarnings = 0
  let validNamespaces = 0

  for (const namespace of namespaces) {
    const result = await validateNamespace(namespace, baseLocale)
    results[namespace] = result

    totalErrors += result.errors.length
    totalWarnings += result.warnings.length

    if (result.valid) {
      validNamespaces++
    }
  }

  return {
    valid: totalErrors === 0,
    results: results as Record<Namespace, ValidationResult>,
    summary: {
      totalNamespaces: namespaces.length,
      validNamespaces,
      totalErrors,
      totalWarnings
    }
  }
}

/**
 * Print validation results to console
 */
export function printValidationResults(results: ValidationResult, namespace: string) {
  console.log(`\n📋 Validation results for namespace: ${namespace}`)
  console.log(`─────────────────────────────────────────`)

  if (results.valid) {
    console.log('✅ All translations are valid!')
  } else {
    console.log('❌ Translation validation failed')
  }

  console.log(`\nSummary:`)
  console.log(`  Total keys: ${results.summary.totalKeys}`)
  console.log(`  Missing keys: ${results.summary.missingKeys}`)
  console.log(`  Extra keys: ${results.summary.extraKeys}`)

  if (results.errors.length > 0) {
    console.log(`\n❌ Errors (${results.errors.length}):`)
    results.errors.forEach(error => console.log(`  - ${error}`))
  }

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${results.warnings.length}):`)
    results.warnings.forEach(warning => console.log(`  - ${warning}`))
  }
}

/**
 * Example usage in a script or test
 */
export async function runValidation() {
  console.log('🔍 Starting translation validation...\n')

  const results = await validateAllTranslations('en')

  console.log(`\n📊 Overall Summary:`)
  console.log(`─────────────────────────────────────────`)
  console.log(`  Total namespaces: ${results.summary.totalNamespaces}`)
  console.log(`  Valid namespaces: ${results.summary.validNamespaces}`)
  console.log(`  Total errors: ${results.summary.totalErrors}`)
  console.log(`  Total warnings: ${results.summary.totalWarnings}`)

  // Print details for each namespace
  for (const [namespace, result] of Object.entries(results.results)) {
    if (!result.valid || result.warnings.length > 0) {
      printValidationResults(result, namespace)
    }
  }

  if (results.valid) {
    console.log('\n✅ All translations validated successfully!')
  } else {
    console.log('\n❌ Translation validation failed. Please fix the errors above.')
    process.exit(1)
  }
}
