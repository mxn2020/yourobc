// convex/schema/software/yourobc/employeeKPIs/employeeKPIs.ts
/**
 * Employee KPIs Table
 *
 * Tracks monthly performance metrics for sales employees.
 * Includes quote metrics, order metrics, commission metrics, and rankings.
 *
 * @module convex/schema/software/yourobc/employeeKPIs/employeeKPIs
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  rankByMetricValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base'
import { kpiTargetsValidator, kpiTargetAchievementValidator } from './validators'

/**
 * Employee KPIs Table
 * Tracks performance metrics for sales employees on a monthly basis
 */
export const employeeKPIsTable = defineTable({
  // Identity
  publicId: v.string(), // Public-facing identifier (e.g., KPI-2024-001)
  ownerId: v.string(), // authUserId who owns this KPI record

  // Employee Reference
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

  // Targets (embedded for quick access)
  targets: v.optional(kpiTargetsValidator),

  // Target Achievement
  targetAchievement: v.optional(kpiTargetAchievementValidator),

  // Metadata
  calculatedAt: v.number(), // when KPIs were last calculated

  // Standard fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_month', ['employeeId', 'year', 'month'])
  .index('year_month', ['year', 'month'])
  .index('rank', ['year', 'month', 'rank']) // For leaderboards
  .searchIndex('search_metricName', {
    searchField: 'publicId',
  })
