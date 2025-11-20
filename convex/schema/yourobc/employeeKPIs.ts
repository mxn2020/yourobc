// convex/schema/yourobc/employeeKPIs.ts
/**
 * YourOBC Employee KPIs Schema
 *
 * Defines schemas for employee performance tracking, KPIs, targets, and rankings.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * Tables:
 * - employeeKPIsTable: Monthly performance metrics and rankings
 * - employeeTargetsTable: Individual targets set by managers
 *
 * @module convex/schema/yourobc/employeeKPIs
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  rankByMetricValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Employee KPIs Table
// ============================================================================

/**
 * Employee KPIs
 * Tracks performance metrics for sales employees
 */
export const employeeKPIsTable = defineTable({
  employeeId: v.id('yourobcEmployees'),

  // Time Period
  year: v.number(),
  month: v.number(),

  // Quote Metrics
  quotesCreated: v.number(),
  quotesConverted: v.number(), // quotes that became orders
  quotesValue: v.number(), // total value of all quotes
  convertedValue: v.number(), // value of converted quotes

  // Order Metrics
  ordersProcessed: v.number(),
  ordersCompleted: v.number(),
  ordersValue: v.number(),
  averageOrderValue: v.number(),

  // Commission Metrics
  commissionsEarned: v.number(),
  commissionsPaid: v.number(),
  commissionsPending: v.number(),

  // Performance Metrics
  conversionRate: v.number(), // quotesConverted / quotesCreated * 100
  averageQuoteValue: v.number(),
  customerRetentionRate: v.optional(v.number()),

  // Ranking (calculated across all employees)
  rank: v.optional(v.number()), // 1-based ranking
  rankBy: v.optional(rankByMetricValidator),

  // Targets
  targets: v.optional(v.object({
    quotesTarget: v.optional(v.number()),
    ordersTarget: v.optional(v.number()),
    revenueTarget: v.optional(v.number()),
    conversionTarget: v.optional(v.number()), // percentage
  })),

  // Target Achievement
  targetAchievement: v.optional(v.object({
    quotesAchievement: v.optional(v.number()), // percentage
    ordersAchievement: v.optional(v.number()),
    revenueAchievement: v.optional(v.number()),
    conversionAchievement: v.optional(v.number()),
  })),

  // Metadata and audit fields
  calculatedAt: v.number(), // when KPIs were last calculated
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_month', ['employeeId', 'year', 'month'])
  .index('year_month', ['year', 'month'])
  .index('rank', ['year', 'month', 'rank']) // For leaderboards

// ============================================================================
// Employee Targets Table
// ============================================================================

/**
 * Employee Targets
 * Individual targets set by admin/manager
 */
export const employeeTargetsTable = defineTable({
  employeeId: v.id('yourobcEmployees'),

  // Time Period
  year: v.number(),
  month: v.optional(v.number()), // null for yearly targets
  quarter: v.optional(v.number()), // 1, 2, 3, or 4

  // Target Values
  quotesTarget: v.optional(v.number()),
  ordersTarget: v.optional(v.number()),
  revenueTarget: v.optional(v.number()),
  conversionTarget: v.optional(v.number()), // percentage
  commissionsTarget: v.optional(v.number()),

  // Target Metadata
  setBy: v.string(), // authUserId who set the target
  setDate: v.number(),
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_period', ['employeeId', 'year', 'month'])
  .index('year_month', ['year', 'month'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (rankByMetricValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, metadataSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for metadata/audit fields: ...metadataSchema, ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit or metadata fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Employee KPIs Table:
 *    - Period-based: Monthly tracking (year + month)
 *    - Quote Metrics: Created, converted, value, conversion rate
 *    - Order Metrics: Processed, completed, value, average order value
 *    - Commission Metrics: Earned, paid, pending
 *    - Performance Metrics: Auto-calculated conversion rates, averages
 *    - Rankings: Calculated across all employees for leaderboards
 *    - Targets: Optional targets with achievement tracking
 *
 * 2. Performance Metrics:
 *    - conversionRate: quotesConverted / quotesCreated * 100
 *    - averageQuoteValue: quotesValue / quotesCreated
 *    - averageOrderValue: ordersValue / ordersProcessed
 *    - customerRetentionRate: Optional metric for repeat business
 *
 * 3. Ranking System:
 *    - rank: 1-based ranking (1 = best performer)
 *    - rankBy: Metric used for ranking (orders, revenue, conversion, commissions)
 *    - Rankings calculated monthly across all employees
 *    - Uses rankByMetricValidator from base.ts
 *
 * 4. Target Management:
 *    - Separate targets table for flexibility
 *    - Supports yearly, quarterly, and monthly targets
 *    - Achievement percentages auto-calculated from KPIs
 *    - Set by managers with tracking metadata
 *
 * 5. Employee Targets Table:
 *    - Flexible period: yearly (month=null), quarterly, or monthly
 *    - Multiple target types: quotes, orders, revenue, conversion, commissions
 *    - Audit trail: setBy, setDate, notes
 *    - Links to KPIs for achievement calculation
 *
 * 6. Indexes:
 *    - employee: All KPIs for an employee
 *    - employee_year: Annual performance
 *    - employee_month: Monthly performance
 *    - year_month: Company-wide monthly metrics
 *    - rank: Leaderboard queries (month + rank)
 */
