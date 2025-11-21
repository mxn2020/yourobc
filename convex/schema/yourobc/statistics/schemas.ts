// convex/schema/yourobc/statistics/schemas.ts
// Schema exports for statistics module

import { employeeCostsTable } from './employeeCosts';
import { officeCostsTable } from './officeCosts';
import { miscExpensesTable } from './miscExpenses';
import { kpiTargetsTable } from './kpiTargets';
import { kpiCacheTable } from './kpiCache';

export const yourobcStatisticsSchemas = {
  yourobcEmployeeCosts: employeeCostsTable,
  yourobcOfficeCosts: officeCostsTable,
  yourobcMiscExpenses: miscExpensesTable,
  yourobcKpiTargets: kpiTargetsTable,
  yourobcKpiCache: kpiCacheTable,
};
