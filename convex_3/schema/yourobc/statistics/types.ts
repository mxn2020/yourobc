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
export type EmployeeCost = Doc<'yourobcEmployeeCosts'>

/**
 * Office Cost entry document type
 */
export type OfficeCost = Doc<'yourobcOfficeCosts'>

/**
 * Miscellaneous Expense entry document type
 */
export type MiscExpense = Doc<'yourobcMiscExpenses'>

/**
 * KPI Target entry document type
 */
export type KpiTarget = Doc<'yourobcKpiTargets'>

/**
 * KPI Cache entry document type
 */
export type KpiCache = Doc<'yourobcKpiCache'>

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
export type Entity =
  | EmployeeCost
  | OfficeCost
  | MiscExpense
  | KpiTarget
  | KpiCache

/**
 *  table names
 */
export type TableName =
  | 'yourobcEmployeeCosts'
  | 'yourobcOfficeCosts'
  | 'yourobcMiscExpenses'
  | 'yourobcKpiTargets'
  | 'yourobcKpiCache'
