// convex/schema/yourobc/statistics/schemas.ts
// Schema exports for statistics module

import {
  employeeCostsTable,
  kpiCacheTable,
  kpiTargetsTable,
  miscExpensesTable,
  officeCostsTable,
} from './tables';

export const yourobcStatisticsSchemas = {
  yourobcStatisticsEmployeeCosts: employeeCostsTable,
  yourobcStatisticsOfficeCosts: officeCostsTable,
  yourobcStatisticsMiscExpenses: miscExpensesTable,
  yourobcStatisticsKpiTargets: kpiTargetsTable,
  yourobcStatisticsKpiCache: kpiCacheTable,
};
