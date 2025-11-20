// convex/lib/yourobc/shipments/constants.ts
// convex/yourobc/shipments/constants.ts

export const SHIPMENT_CONSTANTS = {
  STATUS: {
    QUOTED: 'quoted',
    BOOKED: 'booked',
    PICKUP: 'pickup',
    IN_TRANSIT: 'in_transit',
    CUSTOMS: 'customs',
    DELIVERED: 'delivered',
    DOCUMENT: 'document',
    INVOICED: 'invoiced',
    CANCELLED: 'cancelled',
  },
  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
  },
  PRIORITY: {
    STANDARD: 'standard',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },
  SLA_STATUS: {
    ON_TIME: 'on_time',
    WARNING: 'warning',
    OVERDUE: 'overdue',
  },
  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },
  DEFAULT_VALUES: {
    PRIORITY: 'standard',
    CURRENCY: 'EUR',
    SLA_WARNING_HOURS: 24,
    PAYMENT_TERMS: 30,
  },
  LIMITS: {
    MAX_SHIPMENT_NUMBER_LENGTH: 20,
    MAX_AWB_NUMBER_LENGTH: 20,
    MAX_CUSTOMER_REFERENCE_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 1000,
    MAX_COURIER_INSTRUCTIONS_LENGTH: 1000,
    MAX_PARTNER_REFERENCE_LENGTH: 50,
    MAX_NOTES_LENGTH: 2000,
    MAX_DIMENSIONS_VALUE: 10000,
    MIN_DIMENSIONS_VALUE: 0.1,
    MAX_WEIGHT: 1000,
    MIN_WEIGHT: 0.1,
    MAX_FLIGHT_NUMBER_LENGTH: 10,
    MAX_AIRLINE_LENGTH: 50,
  },
  PERMISSIONS: {
    VIEW: 'shipments.view',
    CREATE: 'shipments.create',
    EDIT: 'shipments.edit',
    DELETE: 'shipments.delete',
    ASSIGN_COURIER: 'shipments.assign_courier',
    UPDATE_STATUS: 'shipments.update_status',
    VIEW_COSTS: 'shipments.view_costs',
    EDIT_COSTS: 'shipments.edit_costs',
    VIEW_HISTORY: 'shipments.view_history',
    CANCEL: 'shipments.cancel',
  },
} as const;

export const SHIPMENT_STATUS_COLORS = {
  [SHIPMENT_CONSTANTS.STATUS.QUOTED]: '#6b7280',
  [SHIPMENT_CONSTANTS.STATUS.BOOKED]: '#3b82f6',
  [SHIPMENT_CONSTANTS.STATUS.PICKUP]: '#f59e0b',
  [SHIPMENT_CONSTANTS.STATUS.IN_TRANSIT]: '#8b5cf6',
  [SHIPMENT_CONSTANTS.STATUS.CUSTOMS]: '#9333ea',
  [SHIPMENT_CONSTANTS.STATUS.DELIVERED]: '#10b981',
  [SHIPMENT_CONSTANTS.STATUS.DOCUMENT]: '#06b6d4',
  [SHIPMENT_CONSTANTS.STATUS.INVOICED]: '#22c55e',
  [SHIPMENT_CONSTANTS.STATUS.CANCELLED]: '#ef4444',
} as const;

export const PRIORITY_COLORS = {
  [SHIPMENT_CONSTANTS.PRIORITY.STANDARD]: '#6b7280',
  [SHIPMENT_CONSTANTS.PRIORITY.URGENT]: '#f59e0b',
  [SHIPMENT_CONSTANTS.PRIORITY.CRITICAL]: '#ef4444',
} as const;

export const SLA_STATUS_COLORS = {
  [SHIPMENT_CONSTANTS.SLA_STATUS.ON_TIME]: '#10b981',
  [SHIPMENT_CONSTANTS.SLA_STATUS.WARNING]: '#f59e0b',
  [SHIPMENT_CONSTANTS.SLA_STATUS.OVERDUE]: '#ef4444',
} as const;

export const COMMON_AIRLINES = [
  'Lufthansa',
  'British Airways',
  'Air France',
  'KLM',
  'Emirates',
  'Qatar Airways',
  'Turkish Airlines',
  'American Airlines',
  'Delta Air Lines',
  'United Airlines',
] as const;

export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centimeters' },
  { value: 'inch', label: 'Inches' },
] as const;

export const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilograms' },
  { value: 'lb', label: 'Pounds' },
] as const;