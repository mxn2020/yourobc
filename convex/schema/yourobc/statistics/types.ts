// convex/schema/yourobc/statistics/types.ts
// Type extractions from validators for statistics module

import type { Doc, Id } from '@/generated/dataModel';
import { Infer } from 'convex/values';
import { statisticsValidators, statisticsFields } from './validators';

/**
 * Base entity document types
 */
export type EmployeeCost = Doc<'yourobcStatisticsEmployeeCosts'>;
export type OfficeCost = Doc<'yourobcStatisticsOfficeCosts'>;
export type MiscExpense = Doc<'yourobcStatisticsMiscExpenses'>;
export type KpiTarget = Doc<'yourobcStatisticsKpiTargets'>;
export type KpiCache = Doc<'yourobcStatisticsKpiCache'>;

export type EmployeeCostId = Id<'yourobcStatisticsEmployeeCosts'>;
export type OfficeCostId = Id<'yourobcStatisticsOfficeCosts'>;
export type MiscExpenseId = Id<'yourobcStatisticsMiscExpenses'>;
export type KpiTargetId = Id<'yourobcStatisticsKpiTargets'>;
export type KpiCacheId = Id<'yourobcStatisticsKpiCache'>;

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
  | 'yourobcStatisticsEmployeeCosts'
  | 'yourobcStatisticsOfficeCosts'
  | 'yourobcStatisticsMiscExpenses'
  | 'yourobcStatisticsKpiTargets'
  | 'yourobcStatisticsKpiCache';
