// convex/lib/software/yourobc/employeeCommissions/index.ts
/**
 * Employee Commissions Library Barrel Export
 *
 * Exports all employee commission operations, types, and utilities.
 *
 * @module convex/lib/software/yourobc/employeeCommissions
 */

// Constants
export * from './constants'

// Types
export type {
  AppliedTier,
  CommissionTier,
  ServiceType,
  EmployeeCommission,
  EmployeeCommissionRule,
  EmployeeCommissionId,
  EmployeeCommissionRuleId,
  CreateEmployeeCommissionInput,
  UpdateEmployeeCommissionInput,
  CreateEmployeeCommissionRuleInput,
  UpdateEmployeeCommissionRuleInput,
  CommissionCalculationContext,
  CommissionCalculationResult,
  CommissionTotalsByPeriod,
  CommissionTotalsByEmployee,
  RuleMatchResult,
  ApproveCommissionInput,
  PayCommissionInput,
  CancelCommissionInput,
  BatchCalculateCommissionsInput,
  CommissionSearchFilters,
  RuleSearchFilters,
} from './types'

// Utilities
export {
  generateCommissionPublicId,
  generateRulePublicId,
  calculateCommission,
  findMatchingTier,
  doesRuleMatch,
  formatPeriod,
  formatRuleType,
  validateCommissionRate,
  validateCommissionTier,
  validateCommissionTiers,
  calculateTotalCommissions,
  formatCurrency,
  meetsMinimumThreshold,
  getPeriodRange,
  isDateInPeriod,
} from './utils'

// Permissions
export {
  canViewCommission,
  canCreateCommission,
  canUpdateCommission,
  canDeleteCommission,
  canApproveCommission,
  canPayCommission,
  canCancelCommission,
  canViewRule,
  canCreateRule,
  canUpdateRule,
  canDeleteRule,
} from './permissions'

// Queries
export {
  getCommissionById,
  getCommissionByPublicId,
  listCommissionsByEmployee,
  listCommissionsByPeriod,
  listCommissionsByStatus,
  listCommissionsByEmployeeAndStatus,
  listCommissionsByEmployeeAndPeriod,
  searchCommissions,
  getCommissionTotalsByPeriod,
  getCommissionTotalsByEmployee,
  getPendingCommissionsForAutoApproval,
  getRuleById,
  getRuleByPublicId,
  listRulesByEmployee,
  listActiveRulesByEmployee,
  searchRules,
  findMatchingRulesForEmployee,
} from './queries'

// Mutations
export {
  createCommission,
  updateCommission,
  approveCommission,
  payCommission,
  cancelCommission,
  deleteCommission,
  restoreCommission,
  autoApproveCommissionsForInvoice,
  createRule,
  updateRule,
  deleteRule,
  restoreRule,
  activateRule,
  deactivateRule,
  bulkUpdateCommissionStatus,
  recalculateCommission,
} from './mutations'
