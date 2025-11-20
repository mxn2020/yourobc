// convex/lib/software/yourobc/customerMargins/index.ts
// Public API exports for customerMargins module

// Constants
export { CUSTOMER_MARGINS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCustomerMarginData,
  formatCustomerMarginDisplayName,
  generateMarginId,
  isCustomerMarginEditable,
  isCustomerMarginActive,
  calculateMarginAmount,
  calculatePriceWithMargin,
  getApplicableVolumeTier,
} from './utils';

// Permissions
export {
  canViewCustomerMargin,
  canEditCustomerMargin,
  canDeleteCustomerMargin,
  canApproveCustomerMargin,
  requireViewCustomerMarginAccess,
  requireEditCustomerMarginAccess,
  requireDeleteCustomerMarginAccess,
  requireApproveCustomerMarginAccess,
  filterCustomerMarginsByAccess,
} from './permissions';

// Queries
export {
  getCustomerMargins,
  getCustomerMargin,
  getCustomerMarginByPublicId,
  getCustomerMarginByMarginId,
  getCustomerMarginStats,
} from './queries';

// Mutations
export {
  createCustomerMargin,
  updateCustomerMargin,
  deleteCustomerMargin,
  restoreCustomerMargin,
  approveCustomerMargin,
} from './mutations';
