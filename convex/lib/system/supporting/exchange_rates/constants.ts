// convex/lib/system/supporting/exchange_rates/constants.ts
// Business constants and permissions for system exchange rates module

export const SYSTEM_EXCHANGE_RATES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:exchange_rates:view',
    CREATE: 'system:exchange_rates:create',
    EDIT: 'system:exchange_rates:edit',
    DELETE: 'system:exchange_rates:delete',
  },

  LIMITS: {
    MIN_RATE: 0.000001,
    MAX_RATE: 1_000_000,
    MAX_NAME_LENGTH: 120,
    MAX_SOURCE_LENGTH: 120,
  },

  DEFAULTS: {
    IS_AUTOMATIC: false,
  },
} as const;

export const SYSTEM_EXCHANGE_RATES_VALUES = {
  // Currency enum values are defined in schema validators
} as const;
