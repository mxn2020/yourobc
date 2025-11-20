// convex/lib/yourobc/partners/constants.ts
// convex/yourobc/partners/constants.ts

export const PARTNER_CONSTANTS = {
  TYPE: {
    OBC: 'OBC',
    NFO: 'NFO',
    BOTH: 'both',
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
  },
  DEFAULT_VALUES: {
    STATUS: 'active',
    PAYMENT_TERMS: 30,
    PREFERRED_CURRENCY: 'EUR',
    TIMEZONE: 'Europe/Berlin',
  },
  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 100,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_PARTNER_CODE_LENGTH: 20,
    MAX_CONTACT_NAME_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_EMAIL_LENGTH: 100,
    MAX_ADDRESS_STREET_LENGTH: 200,
    MAX_ADDRESS_CITY_LENGTH: 100,
    MAX_ADDRESS_POSTAL_CODE_LENGTH: 20,
    MAX_NOTES_LENGTH: 1000,
    MAX_COUNTRIES: 50,
    MAX_CITIES: 100,
    MAX_AIRPORTS: 100,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
  },
  PERMISSIONS: {
    VIEW: 'partners.view',
    CREATE: 'partners.create',
    EDIT: 'partners.edit',
    DELETE: 'partners.delete',
    ASSIGN: 'partners.assign',
    VIEW_QUOTES: 'partners.view_quotes',
    MANAGE_COVERAGE: 'partners.manage_coverage',
  },
} as const;

export const PARTNER_STATUS_COLORS = {
  [PARTNER_CONSTANTS.STATUS.ACTIVE]: '#10b981',
  [PARTNER_CONSTANTS.STATUS.INACTIVE]: '#6b7280',
  [PARTNER_CONSTANTS.STATUS.SUSPENDED]: '#ef4444',
} as const;

export const SERVICE_TYPE_COLORS = {
  [PARTNER_CONSTANTS.TYPE.OBC]: '#3b82f6',
  [PARTNER_CONSTANTS.TYPE.NFO]: '#8b5cf6',
  [PARTNER_CONSTANTS.TYPE.BOTH]: '#10b981',
} as const;

export const COMMON_AIRPORTS = [
  'FRA', 'LHR', 'CDG', 'AMS', 'MAD',
  'FCO', 'MUC', 'ZUR', 'VIE', 'BRU',
  'JFK', 'LAX', 'ORD', 'YYZ', 'NRT',
  'SIN', 'SYD', 'DXB', 'DOH', 'HKG',
] as const;

export const PAYMENT_TERM_OPTIONS = [
  { value: 0, label: 'Immediate' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 45, label: '45 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const;