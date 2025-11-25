// convex/lib/yourobc/employees/commissions/index.ts
// Public API exports for employeeCommissions module

// Constants
export { EMPLOYEE_COMMISSIONS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmployeeCommissionData,
  generateCommissionId,
  calculateCommissionAmount,
  calculateMarginPercentage,
  formatCommissionDisplayName,
  isCommissionEditable,
  canApproveCommission,
  canPayCommission,
} from './utils';

// Permissions
export {
  canViewEmployeeCommission,
  canEditEmployeeCommission,
  canDeleteEmployeeCommission,
  canApproveEmployeeCommission,
  canPayEmployeeCommission,
  requireViewEmployeeCommissionAccess,
  requireEditEmployeeCommissionAccess,
  requireDeleteEmployeeCommissionAccess,
  requireApproveEmployeeCommissionAccess,
  requirePayEmployeeCommissionAccess,
  filterEmployeeCommissionsByAccess,
} from './permissions';

// Queries
export {
  getEmployeeCommissions,
  getEmployeeCommission,
  getEmployeeCommissionByPublicId,
  getEmployeeCommissionStats,
} from './queries';

// Mutations
export {
  createEmployeeCommission,
  updateEmployeeCommission,
  approveEmployeeCommission,
  payEmployeeCommission,
  deleteEmployeeCommission,
  restoreEmployeeCommission,
} from './mutations';
