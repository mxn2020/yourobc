// convex/lib/software/yourobc/couriers/constants.ts
// Business constants for couriers module

/**
 * Courier module constants
 */
export const COURIERS_CONSTANTS = {
  // Courier Status Values
  STATUS: {
    AVAILABLE: 'available' as const,
    BUSY: 'busy' as const,
    OFFLINE: 'offline' as const,
    VACATION: 'vacation' as const,
  },

  // Default Values
  DEFAULT_VALUES: {
    STATUS: 'available' as const,
    IS_ACTIVE: true,
    IS_ONLINE: false,
    TIME_ENTRIES: [],
    TIMEZONE: 'UTC',
  },

  // Business Rules
  BUSINESS_RULES: {
    MIN_RANKING: 1,
    MAX_RANKING: 5,
    COMPANY_NAME_MIN_LENGTH: 2,
    COMPANY_NAME_MAX_LENGTH: 200,
    COURIER_NUMBER_MIN_LENGTH: 2,
    COURIER_NUMBER_MAX_LENGTH: 50,
    PHONE_MIN_LENGTH: 5,
    PHONE_MAX_LENGTH: 20,
  },

  // Validation Messages
  VALIDATION: {
    COMPANY_NAME_REQUIRED: 'Company name is required',
    COMPANY_NAME_TOO_SHORT: 'Company name must be at least 2 characters',
    COMPANY_NAME_TOO_LONG: 'Company name must be at most 200 characters',
    COURIER_NUMBER_REQUIRED: 'Courier number is required',
    FIRST_NAME_REQUIRED: 'First name is required',
    LAST_NAME_REQUIRED: 'Last name is required',
    PHONE_REQUIRED: 'Phone is required',
    INVALID_RANKING: 'Ranking must be between 1 and 5',
    INVALID_EMAIL: 'Invalid email address',
    TIMEZONE_REQUIRED: 'Timezone is required',
    SKILLS_REQUIRED: 'Skills are required',
  },

  // Error Messages
  ERRORS: {
    NOT_FOUND: 'Courier not found',
    ALREADY_DELETED: 'Courier is already deleted',
    UNAUTHORIZED_VIEW: 'You do not have permission to view this courier',
    UNAUTHORIZED_EDIT: 'You do not have permission to edit this courier',
    UNAUTHORIZED_DELETE: 'You do not have permission to delete this courier',
    UNAUTHORIZED_RESTORE: 'You do not have permission to restore this courier',
    CREATION_FAILED: 'Failed to create courier',
    UPDATE_FAILED: 'Failed to update courier',
    DELETE_FAILED: 'Failed to delete courier',
  },

  // Audit Actions
  AUDIT_ACTIONS: {
    CREATED: 'courier.created',
    UPDATED: 'courier.updated',
    DELETED: 'courier.deleted',
    RESTORED: 'courier.restored',
    STATUS_CHANGED: 'courier.status_changed',
    TIME_ENTRY_ADDED: 'courier.time_entry_added',
  },

  // Entity Type
  ENTITY_TYPE: 'yourobc_courier' as const,
} as const;

/**
 * Commission module constants
 */
export const COMMISSIONS_CONSTANTS = {
  // Commission Type Values
  TYPE: {
    PERCENTAGE: 'percentage' as const,
    FIXED: 'fixed' as const,
  },

  // Commission Status Values
  STATUS: {
    PENDING: 'pending' as const,
    PAID: 'paid' as const,
  },

  // Currency Values
  CURRENCY: {
    EUR: 'EUR' as const,
    USD: 'USD' as const,
  },

  // Payment Method Values
  PAYMENT_METHOD: {
    BANK_TRANSFER: 'bank_transfer' as const,
    CREDIT_CARD: 'credit_card' as const,
    CASH: 'cash' as const,
    CHECK: 'check' as const,
    PAYPAL: 'paypal' as const,
    WIRE_TRANSFER: 'wire_transfer' as const,
    OTHER: 'other' as const,
  },

  // Default Values
  DEFAULT_VALUES: {
    STATUS: 'pending' as const,
    TYPE: 'percentage' as const,
  },

  // Business Rules
  BUSINESS_RULES: {
    MIN_RATE: 0,
    MAX_RATE: 100, // for percentage
    MIN_AMOUNT: 0,
  },

  // Validation Messages
  VALIDATION: {
    COURIER_ID_REQUIRED: 'Courier ID is required',
    SHIPMENT_ID_REQUIRED: 'Shipment ID is required',
    TYPE_REQUIRED: 'Commission type is required',
    RATE_REQUIRED: 'Rate is required',
    BASE_AMOUNT_REQUIRED: 'Base amount is required',
    COMMISSION_AMOUNT_REQUIRED: 'Commission amount is required',
    INVALID_RATE: 'Rate must be between 0 and 100 for percentage type',
    INVALID_AMOUNT: 'Amount must be greater than or equal to 0',
  },

  // Error Messages
  ERRORS: {
    NOT_FOUND: 'Commission not found',
    ALREADY_DELETED: 'Commission is already deleted',
    UNAUTHORIZED_VIEW: 'You do not have permission to view this commission',
    UNAUTHORIZED_EDIT: 'You do not have permission to edit this commission',
    UNAUTHORIZED_DELETE: 'You do not have permission to delete this commission',
    UNAUTHORIZED_RESTORE: 'You do not have permission to restore this commission',
    ALREADY_PAID: 'Commission is already paid',
    CREATION_FAILED: 'Failed to create commission',
    UPDATE_FAILED: 'Failed to update commission',
    DELETE_FAILED: 'Failed to delete commission',
  },

  // Audit Actions
  AUDIT_ACTIONS: {
    CREATED: 'commission.created',
    UPDATED: 'commission.updated',
    DELETED: 'commission.deleted',
    RESTORED: 'commission.restored',
    APPROVED: 'commission.approved',
    PAID: 'commission.paid',
  },

  // Entity Type
  ENTITY_TYPE: 'yourobc_courier_commission' as const,
} as const;
