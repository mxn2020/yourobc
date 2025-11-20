// convex/lib/boilerplate/payments/payments/index.ts
// Public API exports for payments module

// Constants
export { PAYMENTS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCreateSubscriptionData,
  validateUpdateSubscriptionData,
  validateTrackUsageData,
  isSubscriptionActive,
  hasFeatureAccess,
  isUsageLimitExceeded,
  calculateRemainingUsage,
  initializeDefaultUsage,
  initializeDefaultLimits,
  isSubscriptionExpiringSoon,
  isTrialEndingSoon,
  getSubscriptionStatusColor,
  formatUsagePercentage,
  getUsageLevel,
} from './utils';

// Permissions
export {
  canViewSubscription,
  requireViewSubscriptionAccess,
  canEditSubscription,
  requireEditSubscriptionAccess,
  canDeleteSubscription,
  requireDeleteSubscriptionAccess,
  canViewUsageLog,
  requireViewUsageLogAccess,
  canTrackUsage,
  requireTrackUsageAccess,
  canViewPaymentEvent,
  requireViewPaymentEventAccess,
  canEditPaymentEvent,
  requireEditPaymentEventAccess,
  filterSubscriptionsByAccess,
  filterUsageLogsByAccess,
  filterPaymentEventsByAccess,
} from './permissions';

// Queries
export {
  getUserSubscription,
  getSubscription,
  getSubscriptionByPublicId,
  listSubscriptions,
  listAllSubscriptions,
  checkFeatureAccess,
  isUsageLimitExceededQuery,
  getUserUsageStats,
  getUserUsageLogs,
  getUserPaymentEvents,
  getSubscriptionStats,
} from './queries';

// Mutations
export {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  restoreSubscription,
  trackUsage,
  resetUsage,
  logPaymentEvent,
  markEventProcessed,
} from './mutations';
