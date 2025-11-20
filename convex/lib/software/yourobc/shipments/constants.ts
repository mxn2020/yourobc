// convex/lib/software/yourobc/shipments/constants.ts
// Constants for shipments module

/**
 * Shipments module constants
 */
export const SHIPMENTS_CONSTANTS = {
  // Display configuration
  DISPLAY_FIELD: 'shipmentNumber' as const,
  DISPLAY_FIELD_LABEL: 'Shipment Number',

  // Status history display configuration
  STATUS_HISTORY_DISPLAY_FIELD: 'timestamp' as const,
  STATUS_HISTORY_DISPLAY_FIELD_LABEL: 'Timestamp',

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,

  // Validation limits
  MIN_SHIPMENT_NUMBER_LENGTH: 3,
  MAX_SHIPMENT_NUMBER_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_NOTES_LENGTH: 2000,

  // SLA thresholds (in hours)
  SLA_WARNING_THRESHOLD: 24,
  SLA_OVERDUE_THRESHOLD: 0,

  // Status transitions
  ALLOWED_STATUS_TRANSITIONS: {
    quoted: ['booked', 'cancelled'],
    booked: ['pickup', 'cancelled'],
    pickup: ['in_transit', 'cancelled'],
    in_transit: ['delivered', 'customs', 'cancelled'],
    customs: ['in_transit', 'delivered', 'cancelled'],
    delivered: ['document', 'invoiced'],
    document: ['invoiced'],
    invoiced: [],
    cancelled: [],
  } as const,

  // Error messages
  ERRORS: {
    NOT_FOUND: 'Shipment not found',
    STATUS_HISTORY_NOT_FOUND: 'Shipment status history entry not found',
    ALREADY_DELETED: 'Shipment is already deleted',
    UNAUTHORIZED_VIEW: 'You do not have permission to view this shipment',
    UNAUTHORIZED_EDIT: 'You do not have permission to edit this shipment',
    UNAUTHORIZED_DELETE: 'You do not have permission to delete this shipment',
    UNAUTHORIZED_RESTORE: 'You do not have permission to restore this shipment',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    INVALID_SHIPMENT_NUMBER: 'Invalid shipment number',
    INVALID_DIMENSIONS: 'Invalid dimensions data',
    INVALID_PRICE: 'Invalid price data',
    INVALID_SLA: 'Invalid SLA data',
    DUPLICATE_SHIPMENT_NUMBER: 'Shipment number already exists',
  },

  // Success messages
  SUCCESS: {
    CREATED: 'Shipment created successfully',
    STATUS_HISTORY_CREATED: 'Status history entry created successfully',
    UPDATED: 'Shipment updated successfully',
    STATUS_HISTORY_UPDATED: 'Status history entry updated successfully',
    DELETED: 'Shipment deleted successfully',
    STATUS_HISTORY_DELETED: 'Status history entry deleted successfully',
    RESTORED: 'Shipment restored successfully',
    STATUS_HISTORY_RESTORED: 'Status history entry restored successfully',
    STATUS_CHANGED: 'Shipment status changed successfully',
  },
} as const;

/**
 * Shipment status labels
 */
export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  quoted: 'Quoted',
  booked: 'Booked',
  pickup: 'Pickup',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  customs: 'Customs',
  document: 'Documentation',
  invoiced: 'Invoiced',
  cancelled: 'Cancelled',
};

/**
 * Service type labels
 */
export const SERVICE_TYPE_LABELS: Record<string, string> = {
  OBC: 'On-Board Courier',
  NFO: 'Next Flight Out',
};

/**
 * Priority labels
 */
export const PRIORITY_LABELS: Record<string, string> = {
  standard: 'Standard',
  urgent: 'Urgent',
  critical: 'Critical',
};

/**
 * SLA status labels
 */
export const SLA_STATUS_LABELS: Record<string, string> = {
  on_time: 'On Time',
  warning: 'Warning',
  overdue: 'Overdue',
};
