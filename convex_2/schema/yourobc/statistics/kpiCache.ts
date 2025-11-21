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
import { statisticsValidators, statisticsFields } from './validators'
import { classificationFields } from '@/schema/base'

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
  cacheType: statisticsValidators.kpiCacheType, // employee, customer, company, department
  entityId: v.optional(v.string()), // employeeId, customerId, etc.
  entityName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()),
  quarter: v.optional(v.number()),

  // Revenue Metrics
  totalRevenue: statisticsFields.currencyAmount,
  totalCost: v.optional(statisticsFields.currencyAmount),
  totalMargin: statisticsFields.currencyAmount,
  averageMargin: statisticsFields.currencyAmount,

  // Quote Metrics
  quoteCount: v.number(),
  averageQuoteValue: statisticsFields.currencyAmount,

  // Order Metrics
  orderCount: v.number(),
  averageOrderValue: statisticsFields.currencyAmount,
  averageMarginPerOrder: statisticsFields.currencyAmount,

  // Conversion Metrics
  conversionRate: v.number(), // Percentage

  // Commission
  totalCommission: v.optional(statisticsFields.currencyAmount),

  // Comparison
  previousPeriodRevenue: v.optional(statisticsFields.currencyAmount),
  previousPeriodMargin: v.optional(statisticsFields.currencyAmount),
  growthRate: v.optional(v.number()), // Percentage

  // Cache Metadata
  calculatedAt: v.number(),
  calculatedBy: v.string(),

  // Classification
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Complexity of calculations
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who owns this cache entry
  isOfficial: v.optional(v.boolean()), // Official cache vs test/experimental

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track cache usage

  // Audit & Soft Delete
  ...statisticsFields.audit,
  ...statisticsFields.softDelete,
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
