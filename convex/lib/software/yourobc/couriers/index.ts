// convex/lib/software/yourobc/couriers/index.ts
// Barrel exports for couriers library module

// Export constants
export { COURIERS_CONSTANTS, COMMISSIONS_CONSTANTS } from './constants';

// Export types
export type {
  TimeTrackingData,
  CourierAvailabilityData,
  CourierRankingData,
  CommissionApprovalData,
  CommissionPaymentData,
  CommissionCalculationData,
  CourierFilters,
  CommissionFilters,
  CourierPerformanceMetrics,
  CommissionSummary,
} from './types';

// Export utils
export {
  generatePublicId,
  generateCommissionPublicId,
  validateCourierData,
  validateCourierUpdateData,
  validateCommissionData,
  validateCommissionUpdateData,
  calculateCommissionAmount,
  validateCommissionCalculation,
  formatCourierDisplayName,
  getCommissionDisplayDate,
} from './utils';

// Export permissions
export {
  canViewCourier,
  canEditCourier,
  canDeleteCourier,
  canRestoreCourier,
  canChangeCourierStatus,
  validateCourierExists,
  requireEditPermission,
  requireDeletePermission,
  requireRestorePermission,
  canViewCommission,
  canEditCommission,
  canDeleteCommission,
  canRestoreCommission,
  canApproveCommission,
  canPayCommission,
  validateCommissionExists,
  requireCommissionEditPermission,
  requireCommissionDeletePermission,
  requireCommissionRestorePermission,
} from './permissions';

// Export queries
export {
  getCourierById,
  getCourierByPublicId,
  getCourierByCourierNumber,
  listCouriers,
  listCouriersByOwner,
  searchCouriers,
  getCommissionById,
  getCommissionByPublicId,
  listCommissionsByCourier,
  listCommissionsByShipment,
  listCommissions,
  getCommissionSummaryForCourier,
} from './queries';

// Export mutations
export {
  createCourier,
  updateCourier,
  deleteCourier,
  restoreCourier,
  addTimeEntry,
  changeCourierStatus,
  createCommission,
  updateCommission,
  deleteCommission,
  restoreCommission,
  approveCommission,
  payCommission,
} from './mutations';
