// convex/lib/yourobc/customers/index.ts
// Public API exports for customers module

// Constants
export { CUSTOMERS_CONSTANTS, CUSTOMERS_VALUES } from './constants';
export { CUSTOMER_MARGINS_CONSTANTS } from './margins.constants';

// Types
export type * from './types';
export type * from './margins.types';

// Utilities
export {
  validateCustomerData,
  validateContact,
  validateAddress,
  trimCustomerData,
  buildSearchableText,
  formatCustomerDisplayName,
  isCustomerEditable,
  calculateAverageMargin,
  calculateAveragePaymentTerms,
} from './utils';
export {
  validateCustomerMarginData,
  formatCustomerMarginDisplayName,
  generateMarginId,
  isCustomerMarginEditable,
  isCustomerMarginActive,
  calculateMarginAmount,
  calculatePriceWithMargin,
  getApplicableVolumeTier,
} from './margins.utils';

// Permissions
export {
  canViewCustomer,
  canEditCustomer,
  canDeleteCustomer,
  requireViewCustomerAccess,
  requireEditCustomerAccess,
  requireDeleteCustomerAccess,
  filterCustomersByAccess,
} from './permissions';
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
} from './margins.permissions';

// Queries
export {
  getCustomers,
  getCustomer,
  getCustomerByPublicId,
  getCustomerStats,
} from './queries';
export {
  getCustomerMargins,
  getCustomerMargin,
  getCustomerMarginByPublicId,
  getCustomerMarginByMarginId,
  getCustomerMarginStats,
} from './margins.queries';

// Mutations
export {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  restoreCustomer,
  archiveCustomer,
  bulkUpdateCustomers,
  bulkDeleteCustomers,
} from './mutations';
export {
  createCustomerMargin,
  updateCustomerMargin,
  deleteCustomerMargin,
  restoreCustomerMargin,
  approveCustomerMargin,
} from './margins.mutations';
