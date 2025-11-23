// convex/schema/yourobc/employees/kpis/validators.ts
/**
 * Employee KPIs Validators
 *
 * Convex validators for employee KPI structures and nested objects.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for employee KPIs module
 */
export const employeeKPIsValidators = {
  status: v.union(
    v.literal('on_track'),
    v.literal('at_risk'),
    v.literal('behind'),
    v.literal('achieved')
  ),

  period: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly'),
    v.literal('quarterly'),
    v.literal('yearly')
  ),
} as const;

/**
 * Complex object schemas for employee KPIs module
 */
export const employeeKPIsFields = {
  historicalDataEntry: v.object({
    date: v.number(),
    value: v.number(),
    note: v.optional(v.string()),
  }),
} as const;
