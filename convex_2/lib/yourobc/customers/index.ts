// convex/lib/yourobc/customers/index.ts
// Public API exports for customers module

// Constants
export { CUSTOMERS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCustomerData,
  validateContact,
  validateAddress,
  formatCustomerDisplayName,
  isCustomerEditable,
  calculateAverageMargin,
  calculateAveragePaymentTerms,
} from './utils';

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

// Queries
export {
  getCustomers,
  getCustomer,
  getCustomerByPublicId,
  getCustomerStats,
} from './queries';

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
