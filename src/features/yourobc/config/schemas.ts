// src/features/yourobc/config/schemas.ts
/**
 * Zod validation schemas for YourOBC configuration
 *
 * These schemas provide runtime validation of configuration objects
 * to catch errors early and ensure type safety.
 */

import { z } from 'zod'

/**
 * Base schema for core module configuration
 * All modules should have a core object with boolean flags
 */
export const baseCoreSchema = z.object(z.union([z.boolean(), z.number(), z.string()]))

/**
 * Base schema for feature categories
 * Most feature categories have an 'enabled' flag and optional feature flags
 */
export const baseFeatureCategorySchema = z.object({
  enabled: z.boolean(),
}).passthrough() // Allow additional properties

/**
 * Accounting module schema
 */
export const accountingConfigSchema = z.object({
  core: baseCoreSchema,
  incomingInvoices: baseFeatureCategorySchema,
  outgoingInvoices: baseFeatureCategorySchema,
  statements: baseFeatureCategorySchema,
  dashboard: baseFeatureCategorySchema,
}).passthrough()

/**
 * Couriers module schema
 */
export const couriersConfigSchema = z.object({
  core: baseCoreSchema,
  management: baseFeatureCategorySchema,
  workStatus: baseFeatureCategorySchema,
  commission: baseFeatureCategorySchema,
  skills: baseFeatureCategorySchema,
  coverage: baseFeatureCategorySchema,
}).passthrough()

/**
 * Customers module schema
 */
export const customersConfigSchema = z.object({
  core: baseCoreSchema,
  analytics: baseFeatureCategorySchema,
  contacts: baseFeatureCategorySchema,
  addresses: baseFeatureCategorySchema,
  notes: baseFeatureCategorySchema,
  history: baseFeatureCategorySchema,
}).passthrough()

/**
 * Dashboard module schema
 */
export const dashboardConfigSchema = z.object({
  core: baseCoreSchema,
  overview: baseFeatureCategorySchema,
  activities: baseFeatureCategorySchema,
  alerts: baseFeatureCategorySchema,
  widgets: baseFeatureCategorySchema,
}).passthrough()

/**
 * Employees module schema
 */
export const employeesConfigSchema = z.object({
  core: baseCoreSchema,
  timeTracking: baseFeatureCategorySchema,
  kpis: baseFeatureCategorySchema,
  commissions: baseFeatureCategorySchema,
  vacations: baseFeatureCategorySchema,
}).passthrough()

/**
 * Invoices module schema
 */
export const invoicesConfigSchema = z.object({
  core: baseCoreSchema,
  numbering: baseFeatureCategorySchema,
  generation: baseFeatureCategorySchema,
  tracking: baseFeatureCategorySchema,
  payment: baseFeatureCategorySchema,
}).passthrough()

/**
 * Mobile module schema
 */
export const mobileConfigSchema = z.object({
  core: baseCoreSchema,
  layout: baseFeatureCategorySchema,
  dashboard: baseFeatureCategorySchema,
  forms: baseFeatureCategorySchema,
}).passthrough()

/**
 * Partners module schema
 */
export const partnersConfigSchema = z.object({
  core: baseCoreSchema,
  management: baseFeatureCategorySchema,
  search: baseFeatureCategorySchema,
  coverage: baseFeatureCategorySchema,
  nfo: baseFeatureCategorySchema,
}).passthrough()

/**
 * Quotes module schema
 */
export const quotesConfigSchema = z.object({
  core: baseCoreSchema,
  templates: baseFeatureCategorySchema,
  generation: baseFeatureCategorySchema,
  conversion: baseFeatureCategorySchema,
  expiration: baseFeatureCategorySchema,
  pricing: baseFeatureCategorySchema,
  communication: baseFeatureCategorySchema,
  tracking: baseFeatureCategorySchema,
  analytics: baseFeatureCategorySchema,
}).passthrough()

/**
 * Shipments module schema
 */
export const shipmentsConfigSchema = z.object({
  core: baseCoreSchema,
  sla: baseFeatureCategorySchema,
  tracking: baseFeatureCategorySchema,
  documentation: baseFeatureCategorySchema,
  communication: baseFeatureCategorySchema,
  tasks: baseFeatureCategorySchema,
  pricing: baseFeatureCategorySchema,
  routing: baseFeatureCategorySchema,
  analytics: baseFeatureCategorySchema,
}).passthrough()

/**
 * Statistics module schema
 */
export const statisticsConfigSchema = z.object({
  core: baseCoreSchema,
  employeeKpis: baseFeatureCategorySchema,
  operatingCosts: baseFeatureCategorySchema,
  revenue: baseFeatureCategorySchema,
  reporting: baseFeatureCategorySchema,
}).passthrough()

/**
 * Supporting modules schema
 */
export const supportingConfigSchema = z.object({
  core: baseCoreSchema,
  comments: baseFeatureCategorySchema,
  documents: baseFeatureCategorySchema,
  exchangeRates: baseFeatureCategorySchema,
  followupReminders: baseFeatureCategorySchema,
  inquirySources: baseFeatureCategorySchema,
  wiki: baseFeatureCategorySchema,
}).passthrough()

/**
 * Tasks module schema
 */
export const tasksConfigSchema = z.object({
  core: baseCoreSchema,
  dashboard: baseFeatureCategorySchema,
  sla: baseFeatureCategorySchema,
  automation: baseFeatureCategorySchema,
  delegation: baseFeatureCategorySchema,
}).passthrough()

/**
 * Tracking Messages module schema
 */
export const trackingMessagesConfigSchema = z.object({
  core: baseCoreSchema,
  automatic: baseFeatureCategorySchema,
  templates: baseFeatureCategorySchema,
  channels: baseFeatureCategorySchema,
  scheduling: baseFeatureCategorySchema,
}).passthrough()

/**
 * Complete YourOBC configuration schema
 */
export const yourOBCConfigSchema = z.object({
  accounting: accountingConfigSchema,
  couriers: couriersConfigSchema,
  customers: customersConfigSchema,
  dashboard: dashboardConfigSchema,
  employees: employeesConfigSchema,
  invoices: invoicesConfigSchema,
  mobile: mobileConfigSchema,
  partners: partnersConfigSchema,
  quotes: quotesConfigSchema,
  shipments: shipmentsConfigSchema,
  statistics: statisticsConfigSchema,
  supporting: supportingConfigSchema,
  tasks: tasksConfigSchema,
  trackingMessages: trackingMessagesConfigSchema,
})

/**
 * Validate a configuration object
 *
 * @param config - Configuration object to validate
 * @returns Validated configuration or throws ZodError
 *
 * @example
 * ```typescript
 * try {
 *   const validConfig = validateConfig(myConfig)
 *   console.log('Config is valid!')
 * } catch (error) {
 *   console.error('Config validation failed:', error)
 * }
 * ```
 */
export function validateConfig(config: unknown) {
  return yourOBCConfigSchema.parse(config)
}

/**
 * Safely validate a configuration object without throwing
 *
 * @param config - Configuration object to validate
 * @returns Success with data or error object
 *
 * @example
 * ```typescript
 * const result = safeValidateConfig(myConfig)
 * if (result.success) {
 *   console.log('Config is valid:', result.data)
 * } else {
 *   console.error('Validation errors:', result.error.issues)
 * }
 * ```
 */
export function safeValidateConfig(config: unknown) {
  return yourOBCConfigSchema.safeParse(config)
}
