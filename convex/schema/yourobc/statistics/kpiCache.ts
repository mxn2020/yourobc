// convex/schema/yourobc/statistics/kpiCache.ts
/**
 * KPI Cache Table Schema
 *
 * Pre-calculated KPIs for performance optimization and reporting.
 * Stores computed metrics for employees, customers, departments, and company-wide.
 *
 * @module convex/schema/yourobc/statistics/kpiCache
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  currencyAmountSchema,
  kpiCacheTypeValidator,
  difficultyValidator,
  visibilityValidator,
  metadataSchema,
  statsSchema,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * KPI cache table
 * Pre-calculated KPIs for performance optimization and reporting.
 * Stores computed metrics for employees, customers, departments, and company-wide.
 */
export const kpiCacheTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Cache entry name (e.g., 'Employee KPI - John Doe - Jan 2024')
  description: v.optional(v.string()), // Cache description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Scope
  cacheType: kpiCacheTypeValidator, // employee, customer, company, department
  entityId: v.optional(v.string()), // employeeId, customerId, etc.
  entityName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()),
  quarter: v.optional(v.number()),

  // Revenue Metrics
  totalRevenue: currencyAmountSchema,
  totalCost: v.optional(currencyAmountSchema),
  totalMargin: currencyAmountSchema,
  averageMargin: currencyAmountSchema,

  // Quote Metrics
  quoteCount: v.number(),
  averageQuoteValue: currencyAmountSchema,

  // Order Metrics
  orderCount: v.number(),
  averageOrderValue: currencyAmountSchema,
  averageMarginPerOrder: currencyAmountSchema,

  // Conversion Metrics
  conversionRate: v.number(), // Percentage

  // Commission
  totalCommission: v.optional(currencyAmountSchema),

  // Comparison
  previousPeriodRevenue: v.optional(currencyAmountSchema),
  previousPeriodMargin: v.optional(currencyAmountSchema),
  growthRate: v.optional(v.number()), // Percentage

  // Cache Metadata
  calculatedAt: v.number(),
  calculatedBy: v.string(),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Complexity of calculations
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who owns this cache entry
  isOfficial: v.optional(v.boolean()), // Official cache vs test/experimental

  // Usage Statistics
  stats: v.optional(statsSchema), // Track cache usage

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_cache_type', ['cacheType'])
  .index('by_entity_year_month', ['entityId', 'year', 'month'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
