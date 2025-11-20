// convex/lib/yourobc/customers/constants.ts
// convex/yourobc/customers/constants.ts

export const CUSTOMER_CONSTANTS = {
  TYPE: {
    COMPANY: 'company',
  },
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BLACKLISTED: 'blacklisted',
  },
  CONTACT_TYPE: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    BILLING: 'billing',
    SHIPPING: 'shipping',
  },
  DEFAULT_VALUES: {
    STATUS: 'active',
    CURRENCY: 'EUR',
    PAYMENT_TERMS: 30,
    PAYMENT_METHOD: 'bank_transfer',
    MARGIN: 0,
  },
  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 200,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_CONTACT_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_WEBSITE_LENGTH: 200,
    MAX_NOTES_LENGTH: 5000,
    MAX_TAGS: 20,
    MAX_CONTACTS: 10,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
    MIN_MARGIN: -100,
    MAX_MARGIN: 1000,
  },
  PERMISSIONS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    EDIT: 'customers.edit',
    DELETE: 'customers.delete',
    VIEW_STATS: 'customers.view_stats',
    EXPORT: 'customers.export',
  },
} as const;

export const CUSTOMER_STATUS_COLORS = {
  [CUSTOMER_CONSTANTS.STATUS.ACTIVE]: '#10b981',
  [CUSTOMER_CONSTANTS.STATUS.INACTIVE]: '#f59e0b',
  [CUSTOMER_CONSTANTS.STATUS.BLACKLISTED]: '#ef4444',
} as const;

export const PAYMENT_METHODS = [
  'bank_transfer',
  'credit_card',
  'cash',
  'check',
  'paypal',
  'wire_transfer',
] as const;

export const COMMON_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
] as const;

export const COMMON_PAYMENT_TERMS = [
  { label: 'Net 15', value: 15 },
  { label: 'Net 30', value: 30 },
  { label: 'Net 45', value: 45 },
  { label: 'Net 60', value: 60 },
  { label: 'Due on Receipt', value: 0 },
  { label: 'Cash in Advance', value: -1 },
] as const;

export const COMMON_COUNTRIES = [
  'Germany',
  'United States',
  'United Kingdom',
  'France',
  'Netherlands',
  'Belgium',
  'Austria',
  'Switzerland',
  'Italy',
  'Spain',
  'Poland',
  'Czech Republic',
] as const;

export const COMMON_COUNTRY_CODES = [
  'DE',
  'US',
  'GB',
  'FR',
  'NL',
  'BE',
  'AT',
  'CH',
  'IT',
  'ES',
  'PL',
  'CZ',
] as const;