// convex/schema/yourobc/statistics/validators.ts
/**
 * Statistics Validators
 *
 * All validators for operating costs, KPI tracking, and performance metrics.
 * This module consolidates validators for employee costs, office costs,
 * miscellaneous expenses, KPI targets, and cached performance metrics.
 *
 * @module convex/schema/yourobc/statistics/validators
 */

import { v } from 'convex/values'
import {
  officeCostCategoryValidator,
  costFrequencyValidator,
  miscExpenseCategoryValidator,
  targetTypeValidator,
  kpiCacheTypeValidator,
  difficultyValidator,
  visibilityValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
  statsSchema,
} from '../../base'

// ============================================================================
// Re-export Validators from Base
// ============================================================================

// Cost Categories
export { officeCostCategoryValidator } from '../../base'
export { costFrequencyValidator } from '../../base'
export { miscExpenseCategoryValidator } from '../../base'

// KPI Types
export { targetTypeValidator } from '../../base'
export { kpiCacheTypeValidator } from '../../base'

// Standard Validators
export { difficultyValidator } from '../../base'
export { visibilityValidator } from '../../base'

// Schemas
export { currencyAmountSchema } from '../../base'
export { auditFields } from '../../base'
export { softDeleteFields } from '../../base'
export { metadataSchema } from '../../base'
export { statsSchema } from '../../base'

// ============================================================================
// Type Exports
// ============================================================================

export type {
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
} from '../../base'
