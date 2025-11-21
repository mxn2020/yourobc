// convex/lib/yourobc/statistics/index.ts
/**
 * Statistics Library - Barrel Export
 *
 * Central export point for all statistics operations.
 * Provides CRUD operations for all 5 statistics tables:
 * - Employee Costs
 * - Office Costs
 * - Miscellaneous Expenses
 * - KPI Targets
 * - KPI Cache
 *
 * @module convex/lib/yourobc/statistics
 */

// ============================================================================
// Constants
// ============================================================================

export {
  OFFICE_COST_CATEGORIES,
  MISC_EXPENSE_CATEGORIES,
  COST_FREQUENCIES,
  TARGET_TYPES,
  KPI_CACHE_TYPES,
  MAX_COST_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_NOTES_LENGTH,
  MIN_COST_AMOUNT,
  MAX_COST_AMOUNT,
  KPI_CACHE_TTL,
  KPI_CACHE_STALE_THRESHOLD,
  MAX_CACHED_KPIS_PER_ENTITY,
  DEFAULT_CURRENCY,
  QUARTERS,
  QUARTER_NAMES,
  MONTH_NAMES,
  DEFAULT_KPI_TARGETS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants'

// ============================================================================
// Types
// ============================================================================

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
  CurrencyAmount,
  CreateEmployeeCostArgs,
  UpdateEmployeeCostArgs,
  CreateOfficeCostArgs,
  UpdateOfficeCostArgs,
  CreateMiscExpenseArgs,
  UpdateMiscExpenseArgs,
  ApproveExpenseArgs,
  CreateKpiTargetArgs,
  UpdateKpiTargetArgs,
  CreateKpiCacheArgs,
  UpdateKpiCacheArgs,
  EmployeeCostFilterArgs,
  OfficeCostFilterArgs,
  MiscExpenseFilterArgs,
  KpiTargetFilterArgs,
  KpiCacheFilterArgs,
} from './types'

// ============================================================================
// Utilities
// ============================================================================

export {
  generatePublicId,
  generateEmployeeCostPublicId,
  generateOfficeCostPublicId,
  generateMiscExpensePublicId,
  generateKpiTargetPublicId,
  generateKpiCachePublicId,
  createCurrencyAmount,
  addCurrencyAmounts,
  subtractCurrencyAmounts,
  multiplyCurrencyAmount,
  divideCurrencyAmount,
  zeroCurrencyAmount,
  getQuarterFromMonth,
  getMonthsInQuarter,
  getQuarterDateRange,
  getMonthDateRange,
  getYearDateRange,
  isDateInPeriod,
  daysBetween,
  monthsBetween,
  calculateTotalEmployeeCost,
  annualizeCost,
  prorateCost,
  calculateConversionRate,
  calculateAverage,
  calculateGrowthRate,
  calculateMargin,
  calculateMarginPercentage,
  validateDateRange,
  validateYear,
  validateMonth,
  validateQuarter,
  validateCurrencyAmount,
  formatCurrency,
  formatPercentage,
  formatPeriodName,
} from './utils'

// ============================================================================
// Permissions
// ============================================================================

export {
  isAuthenticated,
  getAuthUserId,
  isOwner,
  canView,
  canEdit,
  canDelete,
  canViewEmployeeCost,
  canEditEmployeeCost,
  canDeleteEmployeeCost,
  canViewOfficeCost,
  canEditOfficeCost,
  canDeleteOfficeCost,
  canViewMiscExpense,
  canEditMiscExpense,
  canDeleteMiscExpense,
  canApproveMiscExpense,
  canViewKpiTarget,
  canEditKpiTarget,
  canDeleteKpiTarget,
  canViewKpiCache,
  canEditKpiCache,
  canDeleteKpiCache,
  canRecalculateKpiCache,
  isSoftDeleted,
  canRestore,
} from './permissions'

// ============================================================================
// Queries
// ============================================================================

export {
  getEmployeeCostById,
  getEmployeeCostByPublicId,
  listEmployeeCosts,
  getEmployeeCostsByEmployee,
  getOfficeCostById,
  getOfficeCostByPublicId,
  listOfficeCosts,
  getMiscExpenseById,
  getMiscExpenseByPublicId,
  listMiscExpenses,
  getPendingMiscExpenses,
  getKpiTargetById,
  getKpiTargetByPublicId,
  listKpiTargets,
  getKpiTargetsByEmployee,
  getKpiCacheById,
  getKpiCacheByPublicId,
  listKpiCache,
  getKpiCacheForEntity,
} from './queries'

// ============================================================================
// Mutations
// ============================================================================

export {
  createEmployeeCost,
  updateEmployeeCost,
  deleteEmployeeCost,
  createOfficeCost,
  updateOfficeCost,
  deleteOfficeCost,
  createMiscExpense,
  updateMiscExpense,
  approveMiscExpense,
  deleteMiscExpense,
  createKpiTarget,
  updateKpiTarget,
  deleteKpiTarget,
  createKpiCache,
  updateKpiCache,
  deleteKpiCache,
} from './mutations'
