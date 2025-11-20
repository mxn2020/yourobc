// convex/schema/software/yourobc/employeeKPIs/validators.ts
/**
 * Employee KPIs Validators
 *
 * Defines all validators for the employeeKPIs entity.
 * This entity has TWO related tables: employeeKPIsTable and employeeTargetsTable.
 *
 * @module convex/schema/software/yourobc/employeeKPIs/validators
 */

import { v } from 'convex/values'

// ============================================================================
// KPI Validators
// ============================================================================

/**
 * Target fields validator (embedded in KPIs table)
 */
export const kpiTargetsValidator = v.object({
  quotesTarget: v.optional(v.number()),
  ordersTarget: v.optional(v.number()),
  revenueTarget: v.optional(v.number()),
  conversionTarget: v.optional(v.number()), // percentage
})

/**
 * Target achievement fields validator (embedded in KPIs table)
 */
export const kpiTargetAchievementValidator = v.object({
  quotesAchievement: v.optional(v.number()), // percentage
  ordersAchievement: v.optional(v.number()),
  revenueAchievement: v.optional(v.number()),
  conversionAchievement: v.optional(v.number()),
})

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * These validators are used in the employeeKPIs and employeeTargets table definitions.
 *
 * ✅ DO:
 * - Import these validators in table definitions
 * - Import these validators in mutations/queries args
 * - Use for embedded objects in the tables
 *
 * ❌ DON'T:
 * - Redefine these validators elsewhere
 * - Use inline validators in table definitions
 */
