// convex/lib/yourobc/couriers/constants.ts
// convex/yourobc/couriers/constants.ts

export const COURIER_CONSTANTS = {
  TYPE: {
    COURIER: 'courier',
  },
  STATUS: {
    AVAILABLE: 'available',
    BUSY: 'busy',
    OFFLINE: 'offline',
    VACATION: 'vacation',
  },
  TIME_ENTRY_TYPE: {
    LOGIN: 'login',
    LOGOUT: 'logout',
  },
  COMMISSION_TYPE: {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
  },
  DEFAULT_VALUES: {
    TYPE: 'courier',
    STATUS: 'available',
    COMMISSION_RATE: 5,
    TIMEZONE: 'Europe/Berlin',
  },
  LIMITS: {
    MAX_COURIER_NUMBER_LENGTH: 20,
    MAX_NAME_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_EMAIL_LENGTH: 100,
    MAX_LANGUAGES: 10,
    MAX_CERTIFICATIONS: 20,
    MAX_CARRY_WEIGHT: 50,
    MIN_COMMISSION_RATE: 0,
    MAX_COMMISSION_RATE: 100,
  },
  PERMISSIONS: {
    VIEW: 'couriers.view',
    CREATE: 'couriers.create',
    EDIT: 'couriers.edit',
    DELETE: 'couriers.delete',
    ASSIGN: 'couriers.assign',
    VIEW_TIME_ENTRIES: 'couriers.view_time_entries',
    VIEW_COMMISSIONS: 'couriers.view_commissions',
    EDIT_COMMISSIONS: 'couriers.edit_commissions',
},
} as const;

export const COURIER_STATUS_COLORS = {
  [COURIER_CONSTANTS.STATUS.AVAILABLE]: '#10b981',
  [COURIER_CONSTANTS.STATUS.BUSY]: '#f59e0b',
  [COURIER_CONSTANTS.STATUS.OFFLINE]: '#6b7280',
  [COURIER_CONSTANTS.STATUS.VACATION]: '#8b5cf6',
} as const;

export const COMMON_LANGUAGES = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Dutch',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Arabic',
] as const;