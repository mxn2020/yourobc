// convex/lib/yourobc/shipments/index.ts
// convex/yourobc/shipments/index.ts

export { 
  SHIPMENT_CONSTANTS, 
  SHIPMENT_STATUS_COLORS, 
  PRIORITY_COLORS,
  SLA_STATUS_COLORS,
  COMMON_AIRLINES,
  DIMENSION_UNITS,
  WEIGHT_UNITS
} from './constants'

export * from './types'

export {
  getShipments,
  getShipment,
  getShipmentsByCustomer,
  getShipmentsByCourier,
  getShipmentStats,
  getShipmentStatusHistory,
  searchShipments,
  getOverdueShipments,
} from './queries'

export {
  createShipment,
  updateShipment,
  updateShipmentStatus,
  assignCourier,
  deleteShipment,
} from './mutations'

export {
  validateShipmentData,
  validateStatusUpdate,
  generateShipmentNumber,
  generateAWBNumber,
  getShipmentStatusColor,
  getPriorityColor,
  getSLAStatusColor,
  calculateSLA,
  getNextTask,
  formatShipmentDisplayName,
  formatAddressDisplay,
  formatDimensionsDisplay,
  formatCurrencyDisplay,
  sanitizeShipmentForExport,
  canUpdateShipmentStatus,
  calculateDeliveryTime,
  isShipmentOverdue,
  isShipmentActive,
  convertDimensions,
} from './utils'