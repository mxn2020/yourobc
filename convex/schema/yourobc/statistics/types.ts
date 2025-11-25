// convex/schema/yourobc/statistics/types.ts
// Type extractions from validators for statistics module

import type { Doc, Id } from '@/generated/dataModel';
import { Infer } from 'convex/values';
import { statisticsValidators, statisticsFields } from './validators';

/**
 * Base entity document types
 */
export type EmployeeCost = Doc<'yourobcEmployeeCosts'>;
export type OfficeCost = Doc<'yourobcOfficeCosts'>;
export type MiscExpense = Doc<'yourobcMiscExpenses'>;
export type KpiTarget = Doc<'yourobcKpiTargets'>;
export type KpiCache = Doc<'yourobcKpiCache'>;

export type EmployeeCostId = Id<'yourobcEmployeeCosts'>;
export type OfficeCostId = Id<'yourobcOfficeCosts'>;
export type MiscExpenseId = Id<'yourobcMiscExpenses'>;
export type KpiTargetId = Id<'yourobcKpiTargets'>;
export type KpiCacheId = Id<'yourobcKpiCache'>;

/**
 * Extract TypeScript types from validators
 */
export type OfficeCostCategory = Infer<typeof statisticsValidators.officeCostCategory>;
export type CostFrequency = Infer<typeof statisticsValidators.costFrequency>;
export type MiscExpenseCategory = Infer<typeof statisticsValidators.miscExpenseCategory>;
export type TargetType = Infer<typeof statisticsValidators.targetType>;
export type KpiCacheType = Infer<typeof statisticsValidators.kpiCacheType>;
export type Difficulty = Infer<typeof statisticsValidators.difficulty>;
export type Visibility = Infer<typeof statisticsValidators.visibility>;
export type Currency = Infer<typeof statisticsValidators.currency>;

/**
 * Extract TypeScript types from complex fields
 */
export type CurrencyAmount = Infer<typeof statisticsFields.currencyAmount>;
export type Stats = Infer<typeof statisticsFields.stats>;

/**
 * Utility unions for statistics module
 */
export type StatisticsEntity = EmployeeCost | OfficeCost | MiscExpense | KpiTarget | KpiCache;
export type StatisticsTableName =
  | 'yourobcEmployeeCosts'
  | 'yourobcOfficeCosts'
  | 'yourobcMiscExpenses'
  | 'yourobcKpiTargets'
  | 'yourobcKpiCache';
