/**
 * YourOBC Employee Commissions Module
 *
 * Exports for employee commissions functionality including mutations,
 * queries, utils, constants, and types.
 *
 * @module convex/lib/yourobc/employees/commissions
 */

// Constants
export { COMMISSION_CONSTANTS } from './constants';

// Types
export type {
  Commission,
  CommissionId,
  CommissionRule,
  CommissionRuleId,
  CommissionCalculation,
  CommissionTier,
  CreateCommissionData,
  CreateCommissionRuleData,
  CommissionFilters,
  CommissionSummary,
} from './types';

// Mutations
export {
  createCommission,
  approveCommission,
  payCommission,
  cancelCommission,
  createCommissionRule,
  updateCommissionRule,
  deleteCommissionRule,
  autoApproveFromInvoice,
  recalculateCommission,
} from './mutations';

// Queries
export {
  getEmployeeCommissions,
  getPendingCommissions,
  getApprovedCommissions,
  getQuarterlyReport,
  getMonthlyCommissionSummary,
  getCommissionRules,
  getActiveCommissionRule,
  calculateCommissionPreview,
  getAllCommissions,
  getCommissionStatistics,
  getCommissionById,
} from './queries';

// Utils
export {
  calculateMarginCommission,
  calculateRevenueCommission,
  calculateFixedCommission,
  calculateTieredCommission,
  applyCommissionRule,
  validateCommissionRule,
} from './utils';
