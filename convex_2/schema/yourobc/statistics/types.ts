// convex/schema/yourobc/statistics/types.ts
/**
 * Statistics Type Extractions
 *
 * TypeScript type definitions extracted from statistics validators.
 * Provides type-safe interfaces for all statistics entities.
 *
 * @module convex/schema/yourobc/statistics/types
 */

import { Doc } from '@/generated/dataModel'

// ============================================================================
// Table Document Types
// ============================================================================

/**
 * Employee Cost entry document type
 */
export type EmployeeCost = Doc<'yourobcStatisticsEmployeeCosts'>

/**
 * Office Cost entry document type
 */
export type OfficeCost = Doc<'yourobcStatisticsOfficeCosts'>

/**
 * Miscellaneous Expense entry document type
 */
export type MiscExpense = Doc<'yourobcStatisticsMiscExpenses'>

/**
 * KPI Target entry document type
 */
export type KpiTarget = Doc<'yourobcStatisticsKpiTargets'>

/**
 * KPI Cache entry document type
 */
export type KpiCache = Doc<'yourobcStatisticsKpiCache'>

// ============================================================================
// Re-export Validator Types
// ============================================================================

export type {
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
  Currency,
} from './validators'

// ============================================================================
// Utility Types
// ============================================================================

/**
 * All statistics table types
 */
export type StatisticsEntity =
  | EmployeeCost
  | OfficeCost
  | MiscExpense
  | KpiTarget
  | KpiCache

/**
 * Statistics table names
 */
export type StatisticsTableName =
  | 'yourobcStatisticsEmployeeCosts'
  | 'yourobcStatisticsOfficeCosts'
  | 'yourobcStatisticsMiscExpenses'
  | 'yourobcStatisticsKpiTargets'
  | 'yourobcStatisticsKpiCache'
