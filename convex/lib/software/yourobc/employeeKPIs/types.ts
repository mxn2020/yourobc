// convex/lib/software/yourobc/employeeKPIs/types.ts
/**
 * Employee KPIs Library Types
 *
 * TypeScript types for employee KPIs and targets operations.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/types
 */

import { Id } from '../../../_generated/dataModel'
import type { RankByMetric } from '../../../schema/yourobc/base'

/**
 * KPI creation arguments
 */
export interface CreateKPIArgs {
  publicId: string
  ownerId: string
  employeeId: Id<'yourobcEmployees'>
  year: number
  month: number
  quotesCreated: number
  quotesConverted: number
  quotesValue: number
  convertedValue: number
  ordersProcessed: number
  ordersCompleted: number
  ordersValue: number
  averageOrderValue: number
  commissionsEarned: number
  commissionsPaid: number
  commissionsPending: number
  conversionRate: number
  averageQuoteValue: number
  customerRetentionRate?: number
  rank?: number
  rankBy?: RankByMetric
  tags?: string[]
  category?: string
}

/**
 * KPI update arguments
 */
export interface UpdateKPIArgs {
  id: Id<'yourobcEmployeeKPIs'>
  quotesCreated?: number
  quotesConverted?: number
  quotesValue?: number
  convertedValue?: number
  ordersProcessed?: number
  ordersCompleted?: number
  ordersValue?: number
  averageOrderValue?: number
  commissionsEarned?: number
  commissionsPaid?: number
  commissionsPending?: number
  conversionRate?: number
  averageQuoteValue?: number
  customerRetentionRate?: number
  rank?: number
  rankBy?: RankByMetric
  tags?: string[]
  category?: string
}

/**
 * Target creation arguments
 */
export interface CreateTargetArgs {
  publicId: string
  ownerId: string
  employeeId: Id<'yourobcEmployees'>
  kpiId?: Id<'yourobcEmployeeKPIs'>
  year: number
  month?: number
  quarter?: number
  period: string
  quotesTarget?: number
  ordersTarget?: number
  revenueTarget?: number
  conversionTarget?: number
  commissionsTarget?: number
  setBy: string
  notes?: string
  tags?: string[]
  category?: string
}

/**
 * Target update arguments
 */
export interface UpdateTargetArgs {
  id: Id<'yourobcEmployeeTargets'>
  kpiId?: Id<'yourobcEmployeeKPIs'>
  quotesTarget?: number
  ordersTarget?: number
  revenueTarget?: number
  conversionTarget?: number
  commissionsTarget?: number
  notes?: string
  tags?: string[]
  category?: string
}

/**
 * KPI calculation result
 */
export interface KPICalculationResult {
  conversionRate: number
  averageQuoteValue: number
  averageOrderValue: number
  rank?: number
  rankBy?: RankByMetric
}

/**
 * Target achievement result
 */
export interface TargetAchievementResult {
  quotesAchievement: number
  ordersAchievement: number
  revenueAchievement: number
  conversionAchievement: number
  overallAchievement: number
}
