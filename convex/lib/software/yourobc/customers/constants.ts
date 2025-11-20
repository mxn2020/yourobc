// convex/lib/software/yourobc/customers/constants.ts
// Business constants for customers module

/**
 * Customer module constants
 */
export const CUSTOMERS_CONSTANTS = {
  // Customer Status Values
  STATUS: {
    ACTIVE: 'active' as const,
    INACTIVE: 'inactive' as const,
    BLACKLISTED: 'blacklisted' as const,
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

  // Contact Role Values
  CONTACT_ROLE: {
    DECISION_MAKER: 'Entscheider' as const,
    ACCOUNTING: 'Buchhaltung' as const,
    LOGISTICS: 'Logistik' as const,
    PURCHASING: 'Einkauf' as const,
    MANAGEMENT: 'Geschäftsführung' as const,
    OTHER: 'Sonstiges' as const,
  },

  // Preferred Contact Method Values
  PREFERRED_CONTACT_METHOD: {
    EMAIL: 'email' as const,
    PHONE: 'phone' as const,
    MOBILE: 'mobile' as const,
  },

  // Default Values
  DEFAULT_VALUES: {
    STATUS: 'active' as const,
    CURRENCY: 'EUR' as const,
    PAYMENT_TERMS: 30, // days
    MARGIN: 0, // percentage
    STATS: {
      TOTAL_QUOTES: 0,
      ACCEPTED_QUOTES: 0,
      TOTAL_REVENUE: 0,
    },
  },

  // Business Rules
  BUSINESS_RULES: {
    MIN_PAYMENT_TERMS: 0, // days
    MAX_PAYMENT_TERMS: 365, // days
    MIN_MARGIN: 0, // percentage
    MAX_MARGIN: 100, // percentage
    COMPANY_NAME_MIN_LENGTH: 2,
    COMPANY_NAME_MAX_LENGTH: 200,
  },

  // Service Suspension
  SUSPENSION: {
    REASONS: {
      PAYMENT_OVERDUE: 'Payment overdue',
      FRAUDULENT_ACTIVITY: 'Fraudulent activity',
      CUSTOMER_REQUEST: 'Customer request',
      POLICY_VIOLATION: 'Policy violation',
      OTHER: 'Other',
    },
  },

  // Validation Messages
  VALIDATION: {
    COMPANY_NAME_REQUIRED: 'Company name is required',
    COMPANY_NAME_TOO_SHORT: 'Company name must be at least 2 characters',
    COMPANY_NAME_TOO_LONG: 'Company name must be at most 200 characters',
    PRIMARY_CONTACT_REQUIRED: 'Primary contact is required',
    BILLING_ADDRESS_REQUIRED: 'Billing address is required',
    INVALID_PAYMENT_TERMS: 'Payment terms must be between 0 and 365 days',
    INVALID_MARGIN: 'Margin must be between 0 and 100 percent',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_CURRENCY: 'Invalid currency',
    INVALID_PAYMENT_METHOD: 'Invalid payment method',
  },

  // Error Messages
  ERRORS: {
    NOT_FOUND: 'Customer not found',
    ALREADY_DELETED: 'Customer is already deleted',
    UNAUTHORIZED_VIEW: 'You do not have permission to view this customer',
    UNAUTHORIZED_EDIT: 'You do not have permission to edit this customer',
    UNAUTHORIZED_DELETE: 'You do not have permission to delete this customer',
    UNAUTHORIZED_RESTORE: 'You do not have permission to restore this customer',
    BLACKLISTED: 'This customer is blacklisted',
    SERVICE_SUSPENDED: 'Service is suspended for this customer',
    CREATION_FAILED: 'Failed to create customer',
    UPDATE_FAILED: 'Failed to update customer',
    DELETE_FAILED: 'Failed to delete customer',
  },

  // Audit Actions
  AUDIT_ACTIONS: {
    CREATED: 'customer.created',
    UPDATED: 'customer.updated',
    DELETED: 'customer.deleted',
    RESTORED: 'customer.restored',
    ARCHIVED: 'customer.archived',
    STATUS_CHANGED: 'customer.status_changed',
    SUSPENDED: 'customer.suspended',
    REACTIVATED: 'customer.reactivated',
  },

  // Entity Type
  ENTITY_TYPE: 'yourobc_customer' as const,
} as const;
