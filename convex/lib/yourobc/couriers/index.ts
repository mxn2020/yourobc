// convex/lib/yourobc/couriers/index.ts
// Public API exports for couriers module

// Constants
export { COURIERS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateCourierData,
  validateContact,
  validateAddress,
  validateServiceCoverage,
  validateApiIntegration,
  validateCostStructure,
  formatCourierDisplayName,
  isCourierEditable,
  courierSupportsService,
  courierCoversCountry,
  calculateAverageReliability,
  calculateAverageOnTimeRate,
} from './utils';

// Permissions
export {
  canViewCourier,
  canEditCourier,
  canDeleteCourier,
  canManageCourierApi,
  requireViewCourierAccess,
  requireEditCourierAccess,
  requireDeleteCourierAccess,
  requireManageCourierApiAccess,
  filterCouriersByAccess,
} from './permissions';

// Queries
export {
  getCouriers,
  getCourier,
  getCourierByPublicId,
  getCourierByName,
  getPreferredCouriers,
  getCouriersByServiceType,
  getCouriersByCountry,
  getCourierStats,
} from './queries';

// Mutations
export {
  createCourier,
  updateCourier,
  deleteCourier,
  restoreCourier,
  archiveCourier,
  bulkUpdateCouriers,
  bulkDeleteCouriers,
} from './mutations';
