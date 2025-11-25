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
  yourobcEmployeeCosts: employeeCostsTable,
  yourobcOfficeCosts: officeCostsTable,
  yourobcMiscExpenses: miscExpensesTable,
  yourobcKpiTargets: kpiTargetsTable,
  yourobcKpiCache: kpiCacheTable,
};
