// convex/schema/yourobc/statistics/schemas.ts
/**
 * Statistics Schema Exports
 *
 * Central export point for all statistics table schemas.
 * This module exports the 5 core statistics tables:
 * - Employee Costs: Track employee salaries, benefits, bonuses
 * - Office Costs: Track rent, utilities, insurance, maintenance
 * - Miscellaneous Expenses: Track trade shows, marketing, tools, travel
 * - KPI Targets: Set performance targets for employees, teams, company
 * - KPI Cache: Pre-calculated performance metrics for reporting
 *
 * @module convex/schema/yourobc/statistics/schemas
 */

export { employeeCostsTable } from './employeeCosts'
export { officeCostsTable } from './officeCosts'
export { miscExpensesTable } from './miscExpenses'
export { kpiTargetsTable } from './kpiTargets'
export { kpiCacheTable } from './kpiCache'
