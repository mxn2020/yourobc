// convex/lib/software/yourobc/employeeKPIs/utils.ts
/**
 * Employee KPIs Utilities
 *
 * Utility functions for KPI calculations and formatting.
 *
 * @module convex/lib/software/yourobc/employeeKPIs/utils
 */

import type { RankByMetric } from '../../../schema/yourobc/base'
import type { KPICalculationResult, TargetAchievementResult } from './types'
import { QUARTER_MONTHS } from './constants'

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(
  quotesConverted: number,
  quotesCreated: number
): number {
  if (quotesCreated === 0) return 0
  return (quotesConverted / quotesCreated) * 100
}

/**
 * Calculate average quote value
 */
export function calculateAverageQuoteValue(
  quotesValue: number,
  quotesCreated: number
): number {
  if (quotesCreated === 0) return 0
  return quotesValue / quotesCreated
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(
  ordersValue: number,
  ordersProcessed: number
): number {
  if (ordersProcessed === 0) return 0
  return ordersValue / ordersProcessed
}

/**
 * Calculate all KPI metrics
 */
export function calculateKPIMetrics(
  quotesCreated: number,
  quotesConverted: number,
  quotesValue: number,
  ordersProcessed: number,
  ordersValue: number
): KPICalculationResult {
  return {
    conversionRate: calculateConversionRate(quotesConverted, quotesCreated),
    averageQuoteValue: calculateAverageQuoteValue(quotesValue, quotesCreated),
    averageOrderValue: calculateAverageOrderValue(ordersValue, ordersProcessed),
  }
}

/**
 * Calculate target achievement percentage
 */
export function calculateAchievement(actual: number, target: number): number {
  if (target === 0) return 0
  return (actual / target) * 100
}

/**
 * Calculate target achievements
 */
export function calculateTargetAchievements(
  kpi: {
    quotesCreated: number
    ordersProcessed: number
    ordersValue: number
    conversionRate: number
  },
  targets: {
    quotesTarget?: number
    ordersTarget?: number
    revenueTarget?: number
    conversionTarget?: number
  }
): TargetAchievementResult {
  const quotesAchievement = targets.quotesTarget
    ? calculateAchievement(kpi.quotesCreated, targets.quotesTarget)
    : 0

  const ordersAchievement = targets.ordersTarget
    ? calculateAchievement(kpi.ordersProcessed, targets.ordersTarget)
    : 0

  const revenueAchievement = targets.revenueTarget
    ? calculateAchievement(kpi.ordersValue, targets.revenueTarget)
    : 0

  const conversionAchievement = targets.conversionTarget
    ? calculateAchievement(kpi.conversionRate, targets.conversionTarget)
    : 0

  // Calculate overall achievement (average of all non-zero achievements)
  const achievements = [
    quotesAchievement,
    ordersAchievement,
    revenueAchievement,
    conversionAchievement,
  ].filter((a) => a > 0)

  const overallAchievement =
    achievements.length > 0
      ? achievements.reduce((sum, a) => sum + a, 0) / achievements.length
      : 0

  return {
    quotesAchievement,
    ordersAchievement,
    revenueAchievement,
    conversionAchievement,
    overallAchievement,
  }
}

/**
 * Format period string
 */
export function formatPeriod(
  year: number,
  month?: number,
  quarter?: number
): string {
  if (quarter) {
    return `${year}-Q${quarter}`
  }
  if (month) {
    return `${year}-${String(month).padStart(2, '0')}`
  }
  return `${year}`
}

/**
 * Get quarter from month
 */
export function getQuarterFromMonth(month: number): number {
  if (month >= 1 && month <= 3) return 1
  if (month >= 4 && month <= 6) return 2
  if (month >= 7 && month <= 9) return 3
  return 4
}

/**
 * Get months in quarter
 */
export function getMonthsInQuarter(quarter: number): number[] {
  return QUARTER_MONTHS[quarter as keyof typeof QUARTER_MONTHS] || []
}

/**
 * Generate public ID for KPI
 */
export function generateKPIPublicId(
  employeeId: string,
  year: number,
  month: number
): string {
  return `KPI-${year}-${String(month).padStart(2, '0')}-${employeeId.slice(-6)}`
}

/**
 * Generate public ID for target
 */
export function generateTargetPublicId(
  employeeId: string,
  year: number,
  month?: number,
  quarter?: number
): string {
  if (quarter) {
    return `TARGET-${year}-Q${quarter}-${employeeId.slice(-6)}`
  }
  if (month) {
    return `TARGET-${year}-${String(month).padStart(2, '0')}-${employeeId.slice(-6)}`
  }
  return `TARGET-${year}-${employeeId.slice(-6)}`
}

/**
 * Get metric value for ranking
 */
export function getMetricValueForRanking(
  kpi: {
    ordersProcessed: number
    ordersValue: number
    conversionRate: number
    commissionsEarned: number
  },
  rankBy: RankByMetric
): number {
  switch (rankBy) {
    case 'orders':
      return kpi.ordersProcessed
    case 'revenue':
      return kpi.ordersValue
    case 'conversion':
      return kpi.conversionRate
    case 'commissions':
      return kpi.commissionsEarned
    default:
      return 0
  }
}
