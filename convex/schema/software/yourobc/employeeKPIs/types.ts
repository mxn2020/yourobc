// convex/schema/software/yourobc/employeeKPIs/types.ts
/**
 * Employee KPIs Types
 *
 * TypeScript types extracted from validators for the employeeKPIs entity.
 *
 * @module convex/schema/software/yourobc/employeeKPIs/types
 */

import { Doc } from '../../../_generated/dataModel'

/**
 * Employee KPI document type
 */
export type EmployeeKPI = Doc<'yourobcEmployeeKPIs'>

/**
 * Employee Target document type
 */
export type EmployeeTarget = Doc<'yourobcEmployeeTargets'>

/**
 * KPI Targets embedded object type
 */
export type KPITargets = {
  quotesTarget?: number
  ordersTarget?: number
  revenueTarget?: number
  conversionTarget?: number // percentage
}

/**
 * KPI Target Achievement embedded object type
 */
export type KPITargetAchievement = {
  quotesAchievement?: number // percentage
  ordersAchievement?: number
  revenueAchievement?: number
  conversionAchievement?: number
}

/**
 * KPI Period type
 */
export type KPIPeriod = {
  year: number
  month: number
}

/**
 * Target Period type
 */
export type TargetPeriod = {
  year: number
  month?: number
  quarter?: number
}
