// convex/lib/boilerplate/autumn/autumn_customers/index.ts
// Public API exports for autumn customers module

// Constants
export { AUTUMN_CUSTOMERS_CONSTANTS, AUTUMN_SUBSCRIPTION_STATUS_NAMES } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateAutumnCustomerData,
  formatAutumnCustomerDisplayName,
  getSubscriptionStatusDisplayName,
  needsSync,
  isSubscriptionActive,
  isAutumnCustomerEditable,
} from './utils';

// Permissions
export {
  canViewAutumnCustomer,
  canEditAutumnCustomer,
  canDeleteAutumnCustomer,
  canCreateAutumnCustomer,
  requireViewAutumnCustomerAccess,
  requireEditAutumnCustomerAccess,
  requireDeleteAutumnCustomerAccess,
  requireCreateAutumnCustomerAccess,
  filterAutumnCustomersByAccess,
} from './permissions';

// Queries
export {
  getAutumnCustomers,
  getAutumnCustomer,
  getAutumnCustomerByPublicId,
  getAutumnCustomerByUserId,
  getAutumnCustomerByAuthUserId,
  getAutumnCustomerByAutumnId,
  getAutumnCustomerStats,
} from './queries';

// Mutations
export {
  createAutumnCustomer,
  updateAutumnCustomer,
  syncAutumnCustomer,
  deleteAutumnCustomer,
  restoreAutumnCustomer,
} from './mutations';
