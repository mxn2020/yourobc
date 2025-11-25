// convex/lib/yourobc/statistics/index.ts
/**
 * Statistics Library - Barrel Export
 *
 * Central export point for all statistics operations.
 * Provides CRUD operations for all 5 statistics tables.
 *
 * @module convex/lib/yourobc/statistics
 */

// ============================================================================
// Constants & Configuration
// ============================================================================

export { STATISTICS_CONSTANTS, STATISTICS_VALUES } from './constants';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type * from './types';

// ============================================================================
// Utilities & Helpers
// ============================================================================

export {
  // Trim functions
  trimEmployeeCostData,
  trimOfficeCostData,
  trimMiscExpenseData,
  trimKpiTargetData,
  trimKpiCacheData,
  
  // Validation functions
  validateEmployeeCostData,
  validateOfficeCostData,
  validateMiscExpenseData,
  validateKpiTargetData,
  validateKpiCacheData,
  validateCurrencyAmount,
  
  // Currency utilities
  createCurrencyAmount,
  calculateTotalEmployeeCost,
  calculateConversionRate,
  calculateGrowthRate,
  formatCurrency,
  formatPercentage,
} from './utils';

// ============================================================================
// Permissions & Access Control
// ============================================================================

export {
  // Auth helpers
  isAuthenticated,
  getAuthUserId,
  
  // Employee Cost permissions
  canViewEmployeeCost,
  requireViewEmployeeCostAccess,
  canEditEmployeeCost,
  requireEditEmployeeCostAccess,
  canDeleteEmployeeCost,
  requireDeleteEmployeeCostAccess,
  
  // Office Cost permissions
  canViewOfficeCost,
  requireViewOfficeCostAccess,
  canEditOfficeCost,
  requireEditOfficeCostAccess,
  canDeleteOfficeCost,
  requireDeleteOfficeCostAccess,
  
  // Misc Expense permissions
  canViewMiscExpense,
  requireViewMiscExpenseAccess,
  canEditMiscExpense,
  requireEditMiscExpenseAccess,
  canDeleteMiscExpense,
  requireDeleteMiscExpenseAccess,
  canApproveMiscExpense,
  requireApproveMiscExpenseAccess,
  
  // KPI Target permissions
  canViewKpiTarget,
  requireViewKpiTargetAccess,
  canEditKpiTarget,
  requireEditKpiTargetAccess,
  canDeleteKpiTarget,
  requireDeleteKpiTargetAccess,
  
  // KPI Cache permissions
  canViewKpiCache,
  requireViewKpiCacheAccess,
  canEditKpiCache,
  requireEditKpiCacheAccess,
  canDeleteKpiCache,
  requireDeleteKpiCacheAccess,
  
  // Filter functions
  filterEmployeeCostsByAccess,
  filterOfficeCostsByAccess,
  filterMiscExpensesByAccess,
  filterKpiTargetsByAccess,
  filterKpiCacheByAccess,
} from './permissions';

// ============================================================================
// Queries (Read Operations)
// ============================================================================

export {
  // Employee Cost queries
  getEmployeeCosts,
  getEmployeeCost,
  getEmployeeCostByPublicId,
  getEmployeeCostsByEmployee,
  
  // Office Cost queries
  getOfficeCosts,
  getOfficeCost,
  getOfficeCostByPublicId,
  
  // Misc Expense queries
  getMiscExpenses,
  getMiscExpense,
  getMiscExpenseByPublicId,
  getPendingMiscExpenses,
  
  // KPI Target queries
  getKpiTargets,
  getKpiTarget,
  getKpiTargetByPublicId,
  
  // KPI Cache queries
  getKpiCache,
  getKpiCacheById,
  getKpiCacheByPublicId,
  getKpiCacheForEntity,
} from './queries';

// ============================================================================
// Mutations (Write Operations)
// ============================================================================

export {
  // Employee Cost mutations
  createEmployeeCost,
  updateEmployeeCost,
  deleteEmployeeCost,
  
  // Office Cost mutations
  createOfficeCost,
  updateOfficeCost,
  deleteOfficeCost,
  
  // Misc Expense mutations
  createMiscExpense,
  updateMiscExpense,
  approveMiscExpense,
  deleteMiscExpense,
  
  // KPI Target mutations
  createKpiTarget,
  updateKpiTarget,
  deleteKpiTarget,
  
  // KPI Cache mutations
  createKpiCache,
  updateKpiCache,
  deleteKpiCache,
} from './mutations';

