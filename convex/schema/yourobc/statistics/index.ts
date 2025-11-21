// convex/schema/yourobc/statistics/index.ts
/**
 * Statistics Module - Barrel Export
 *
 * Central export point for all statistics schemas, validators, and types.
 * This module provides operating costs tracking and KPI performance metrics
 * across 5 core tables.
 *
 * @module convex/schema/yourobc/statistics
 */

// Table Schemas
export {
  employeeCostsTable,
  officeCostsTable,
  miscExpensesTable,
  kpiTargetsTable,
  kpiCacheTable,
} from './schemas'

// Validators
export {
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
} from './validators'

// Types
export type {
  EmployeeCost,
  OfficeCost,
  MiscExpense,
  KpiTarget,
  KpiCache,
  StatisticsEntity,
  StatisticsTableName,
  OfficeCostCategory,
  CostFrequency,
  MiscExpenseCategory,
  TargetType,
  KpiCacheType,
  Difficulty,
  Visibility,
} from './types'
