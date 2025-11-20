// convex/schema/software/yourobc/statistics/validators.ts
/**
 * Statistics Validators
 *
 * All validators for operating costs, KPI tracking, and performance metrics.
 * This module consolidates validators for employee costs, office costs,
 * miscellaneous expenses, KPI targets, and cached performance metrics.
 *
 * @module convex/schema/software/yourobc/statistics/validators
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
} from '../../../yourobc/base'

// ============================================================================
// Re-export Validators from Base
// ============================================================================

// Cost Categories
export { officeCostCategoryValidator } from '../../../yourobc/base'
export { costFrequencyValidator } from '../../../yourobc/base'
export { miscExpenseCategoryValidator } from '../../../yourobc/base'

// KPI Types
export { targetTypeValidator } from '../../../yourobc/base'
export { kpiCacheTypeValidator } from '../../../yourobc/base'

// Standard Validators
export { difficultyValidator } from '../../../yourobc/base'
export { visibilityValidator } from '../../../yourobc/base'

// Schemas
export { currencyAmountSchema } from '../../../yourobc/base'
export { auditFields } from '../../../yourobc/base'
export { softDeleteFields } from '../../../yourobc/base'
export { metadataSchema } from '../../../yourobc/base'
export { statsSchema } from '../../../yourobc/base'

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
} from '../../../yourobc/base'
