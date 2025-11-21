// convex/lib/software/yourobc/shipments/index.ts
// Public API exports for shipments module

// Constants
export { SHIPMENTS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateShipmentData,
  validateDimensions,
  validateAddress,
  validateCurrencyAmount,
  formatShipmentDisplayName,
  isShipmentEditable,
  canCancelShipment,
  calculateChargeableWeight,
  formatTrackingStatus,
  trimShipmentData,
} from './utils';

// Permissions
export {
  canViewShipment,
  canEditShipment,
  canDeleteShipment,
  canAssignShipment,
  canUpdateShipmentStatus,
  canManageAllShipments,
  requireViewShipmentAccess,
  requireEditShipmentAccess,
  requireDeleteShipmentAccess,
  requireAssignShipmentAccess,
  requireUpdateShipmentStatusAccess,
  requireManageAllShipmentsAccess,
  filterShipmentsByAccess,
} from './permissions';

// Queries
export {
  getShipments,
  getShipment,
  getShipmentByPublicId,
  getShipmentByNumber,
  getShipmentStatusHistory,
  getShipmentsByCustomer,
  getShipmentsByCourier,
  getShipmentsByEmployee,
  getShipmentStats,
} from './queries';

// Mutations
export {
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  restoreShipment,
  bulkUpdateShipments,
  bulkDeleteShipments,
} from './mutations';
