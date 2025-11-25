// convex/schema/yourobc/statistics/validators.ts
/**
 * Statistics Validators
 *
 * Grouped validators for statistics module following the trackingMessages pattern.
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
  currencyValidator,
  currencyAmountSchema,
  statsSchema,
} from '../../base'

// ============================================================================
// Grouped Validators - Simple union validators
// ============================================================================

export const statisticsValidators = {
  // Cost Categories
  officeCostCategory: officeCostCategoryValidator,
  costFrequency: costFrequencyValidator,
  miscExpenseCategory: miscExpenseCategoryValidator,

  // KPI Types
  targetType: targetTypeValidator,
  kpiCacheType: kpiCacheTypeValidator,

  // Standard Validators
  difficulty: difficultyValidator,
  visibility: visibilityValidator,
  currency: currencyValidator,
} as const

// ============================================================================
// Grouped Fields - Complex object schemas
// ============================================================================

export const statisticsFields = {
  // Currency and monetary values
  currencyAmount: currencyAmountSchema,

  // Tracking
  stats: statsSchema,
} as const

