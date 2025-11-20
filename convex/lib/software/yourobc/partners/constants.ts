// convex/lib/software/yourobc/partners/constants.ts
// Business constants, permissions, and limits for partners module

/**
 * Partners Module Constants
 * Defines permissions, limits, and default values for partners entity
 */
export const PARTNERS_CONSTANTS = {
  // ============================================================================
  // Status Constants
  // ============================================================================
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  },

  // ============================================================================
  // Service Type Constants
  // ============================================================================
  SERVICE_TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
    BOTH: 'both',
  },

  // ============================================================================
  // Currency Constants
  // ============================================================================
  CURRENCY: {
    EUR: 'EUR',
    USD: 'USD',
  },

  // ============================================================================
  // Ranking Constants
  // ============================================================================
  RANKING: {
    MIN: 1,
    MAX: 5,
    ONE_STAR: 1,
    TWO_STARS: 2,
    THREE_STARS: 3,
    FOUR_STARS: 4,
    FIVE_STARS: 5,
  },

  // ============================================================================
  // Permissions
  // ============================================================================
  PERMISSIONS: {
    VIEW: 'partners:view',
    CREATE: 'partners:create',
    EDIT: 'partners:edit',
    DELETE: 'partners:delete',
    MANAGE_STATUS: 'partners:manage_status',
    VIEW_INTERNAL_NOTES: 'partners:view_internal_notes',
  },

  // ============================================================================
  // Field Limits
  // ============================================================================
  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 200,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_PARTNER_CODE_LENGTH: 20,
    MAX_NOTES_LENGTH: 5000,
    MAX_RANKING_NOTES_LENGTH: 1000,
    MAX_INTERNAL_PAYMENT_NOTES_LENGTH: 2000,
    MAX_PAYMENT_TERMS_DAYS: 365,
    MIN_PAYMENT_TERMS_DAYS: 0,
    MAX_COUNTRIES: 100,
    MAX_CITIES: 200,
    MAX_AIRPORTS: 100,
  },

  // ============================================================================
  // Default Values
  // ============================================================================
  DEFAULT_VALUES: {
    STATUS: 'active',
    SERVICE_TYPE: 'both',
    CURRENCY: 'EUR',
    PAYMENT_TERMS: 30,
    RANKING: 3,
    SERVICE_CAPABILITIES: {
      handlesCustoms: false,
      handlesPickup: false,
      handlesDelivery: false,
      handlesNFO: false,
      handlesTrucking: false,
    },
  },

  // ============================================================================
  // Display Fields
  // ============================================================================
  DISPLAY: {
    MAIN_FIELD: 'companyName',
    SECONDARY_FIELD: 'shortName',
    TERTIARY_FIELD: 'partnerCode',
  },

  // ============================================================================
  // Validation Rules
  // ============================================================================
  VALIDATION: {
    REQUIRED_FIELDS: ['companyName', 'serviceType', 'preferredCurrency', 'paymentTerms', 'status'],
    EMAIL_FIELDS: ['quotingEmail', 'primaryContact.email'],
  },
} as const;

/**
 * Partner status display names
 */
export const PARTNER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
} as const;

/**
 * Partner service type display names
 */
export const PARTNER_SERVICE_TYPE_LABELS = {
  OBC: 'OBC Only',
  NFO: 'NFO Only',
  both: 'Both OBC & NFO',
} as const;

/**
 * Currency display names
 */
export const CURRENCY_LABELS = {
  EUR: 'Euro (EUR)',
  USD: 'US Dollar (USD)',
} as const;

/**
 * Ranking display labels
 */
export const RANKING_LABELS = {
  1: '1 Star - Poor',
  2: '2 Stars - Below Average',
  3: '3 Stars - Average',
  4: '4 Stars - Good',
  5: '5 Stars - Excellent',
} as const;

/**
 * Service capabilities display names
 */
export const SERVICE_CAPABILITIES_LABELS = {
  handlesCustoms: 'Handles Customs',
  handlesPickup: 'Handles Pickup',
  handlesDelivery: 'Handles Delivery',
  handlesNFO: 'Handles NFO',
  handlesTrucking: 'Handles Trucking',
} as const;
