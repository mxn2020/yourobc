// src/features/yourobc/config/index.ts
/**
 * Central YourOBC Configuration Registry
 *
 * This module provides centralized access to all YourOBC module configurations.
 * It includes type-safe getters, validation, and helper functions for working
 * with feature flags across the entire application.
 *
 * @example
 * ```typescript
 * import { YOUROBC_CONFIG, getModuleConfig, isModuleFeatureEnabled } from '@/features/yourobc/config'
 *
 * // Access module config
 * const quotesConfig = YOUROBC_CONFIG.quotes
 *
 * // Or use the getter
 * const quotesConfig = getModuleConfig('quotes')
 *
 * // Check feature flag
 * if (isModuleFeatureEnabled('quotes', 'pricing', 'multiCurrency')) {
 *   // Feature is enabled
 * }
 * ```
 */

import { ACCOUNTING_CONFIG } from '../accounting/config'
import { COURIERS_CONFIG } from '../couriers/config'
import { CUSTOMERS_CONFIG } from '../customers/config'
import { DASHBOARD_CONFIG } from '../dashboard/config'
import { EMPLOYEES_CONFIG } from '../employees/config'
import { INVOICES_CONFIG } from '../invoices/config'
import { MOBILE_CONFIG } from '../mobile/config'
import { PARTNERS_CONFIG } from '../partners/config'
import { QUOTES_CONFIG } from '../quotes/config'
import { SHIPMENTS_CONFIG } from '../shipments/config'
import { STATISTICS_CONFIG } from '../statistics/config'
import { SUPPORTING_CONFIG } from '../supporting/config'
import { TASKS_CONFIG } from '../tasks/config'
import { TRACKING_MESSAGES_CONFIG } from '../tracking_messages/config'

import type { YourOBCConfig, YourOBCModuleName } from './types'
import { yourOBCConfigSchema, safeValidateConfig } from './schemas'

// Re-export types and schemas
export * from './types'
export * from './schemas'

/**
 * Central configuration object containing all module configs
 *
 * This object is validated on load to ensure all configurations are valid.
 * Any validation errors will be logged to the console.
 */
export const YOUROBC_CONFIG: YourOBCConfig = {
  accounting: ACCOUNTING_CONFIG,
  couriers: COURIERS_CONFIG,
  customers: CUSTOMERS_CONFIG,
  dashboard: DASHBOARD_CONFIG,
  employees: EMPLOYEES_CONFIG,
  invoices: INVOICES_CONFIG,
  mobile: MOBILE_CONFIG,
  partners: PARTNERS_CONFIG,
  quotes: QUOTES_CONFIG,
  shipments: SHIPMENTS_CONFIG,
  statistics: STATISTICS_CONFIG,
  supporting: SUPPORTING_CONFIG,
  tasks: TASKS_CONFIG,
  trackingMessages: TRACKING_MESSAGES_CONFIG,
}

/**
 * Validate the central configuration on load
 * Logs errors but doesn't throw to prevent application startup failures
 */
if (typeof window !== 'undefined') {
  // Only validate in browser environment
  const validationResult = safeValidateConfig(YOUROBC_CONFIG)
  if (!validationResult.success) {
    console.error(
      '[YourOBC Config] Configuration validation failed:',
      validationResult.error.issues
    )
  } else {
    console.log('[YourOBC Config] All module configurations validated successfully')
  }
}

/**
 * Get a specific module's configuration
 *
 * @param module - The module name
 * @returns The module's configuration object
 *
 * @example
 * ```typescript
 * const quotesConfig = getModuleConfig('quotes')
 * if (quotesConfig.pricing.enabled) {
 *   // Use pricing features
 * }
 * ```
 */
export function getModuleConfig<T extends YourOBCModuleName>(module: T): YourOBCConfig[T] {
  return YOUROBC_CONFIG[module]
}

/**
 * Check if a module's core feature is enabled
 *
 * @param module - The module name
 * @param coreFeature - The core feature name
 * @returns True if the core feature is enabled
 *
 * @example
 * ```typescript
 * if (isCoreModuleEnabled('quotes', 'quoteGeneration')) {
 *   // Quote generation is enabled
 * }
 * ```
 */
export function isCoreModuleEnabled(
  module: YourOBCModuleName,
  coreFeature: string
): boolean {
  const config = YOUROBC_CONFIG[module] as any
  return config?.core?.[coreFeature] === true
}

/**
 * Check if a module feature is enabled
 *
 * @param module - The module name
 * @param category - The feature category
 * @param feature - The specific feature name
 * @returns True if the feature is enabled
 *
 * @example
 * ```typescript
 * // Check if multi-currency pricing is enabled in quotes
 * if (isModuleFeatureEnabled('quotes', 'pricing', 'multiCurrency')) {
 *   // Show currency selector
 * }
 * ```
 */
export function isModuleFeatureEnabled(
  module: YourOBCModuleName,
  category: string,
  feature: string
): boolean {
  const config = YOUROBC_CONFIG[module] as any
  const categoryConfig = config?.[category]

  if (!categoryConfig) {
    return false
  }

  // If category is disabled, all features are disabled
  if (categoryConfig.enabled === false) {
    return false
  }

  // Check the specific feature
  return categoryConfig[feature] === true
}

/**
 * Check if an entire feature category is enabled
 *
 * @param module - The module name
 * @param category - The feature category
 * @returns True if the category is enabled
 *
 * @example
 * ```typescript
 * if (isCategoryEnabled('quotes', 'pricing')) {
 *   // Pricing features are available
 * }
 * ```
 */
export function isCategoryEnabled(module: YourOBCModuleName, category: string): boolean {
  const config = YOUROBC_CONFIG[module] as any
  const categoryConfig = config?.[category]
  return categoryConfig?.enabled !== false
}

/**
 * Get all enabled modules
 *
 * @returns Array of module names that have at least one core feature enabled
 *
 * @example
 * ```typescript
 * const enabledModules = getEnabledModules()
 * console.log('Enabled modules:', enabledModules)
 * ```
 */
export function getEnabledModules(): YourOBCModuleName[] {
  return (Object.keys(YOUROBC_CONFIG) as YourOBCModuleName[]).filter(module => {
    const config = YOUROBC_CONFIG[module] as any
    return Object.values(config.core || {}).some(value => value === true)
  })
}

/**
 * Get configuration value with dot notation support
 *
 * @param module - The module name
 * @param path - Dot notation path (e.g., 'pricing.multiCurrency')
 * @returns The configuration value or undefined
 *
 * @example
 * ```typescript
 * const multiCurrency = getConfigValue('quotes', 'pricing.multiCurrency')
 * const validityDays = getConfigValue('quotes', 'expiration.defaultValidityDays')
 * ```
 */
export function getConfigValue(
  module: YourOBCModuleName,
  path: string
): boolean | number | string | undefined {
  const config = YOUROBC_CONFIG[module] as any
  const keys = path.split('.')

  let value = config
  for (const key of keys) {
    if (value?.[key] === undefined) {
      return undefined
    }
    value = value[key]
  }

  return value
}

/**
 * Check if module is fully enabled (all core features enabled)
 *
 * @param module - The module name
 * @returns True if all core features are enabled
 *
 * @example
 * ```typescript
 * if (isModuleFullyEnabled('quotes')) {
 *   // All core quote features are available
 * }
 * ```
 */
export function isModuleFullyEnabled(module: YourOBCModuleName): boolean {
  const config = YOUROBC_CONFIG[module] as any
  const coreValues = Object.values(config.core || {})
  return coreValues.length > 0 && coreValues.every(value => value === true)
}

/**
 * Development helper: Log configuration summary
 *
 * @example
 * ```typescript
 * // In development
 * if (process.env.NODE_ENV === 'development') {
 *   logConfigSummary()
 * }
 * ```
 */
export function logConfigSummary(): void {
  const enabledModules = getEnabledModules()
  console.group('YourOBC Configuration Summary')
  console.log('Total modules:', Object.keys(YOUROBC_CONFIG).length)
  console.log('Enabled modules:', enabledModules.length)
  console.log('Modules:', enabledModules)
  console.groupEnd()
}
