// convex/lib/yourobc/supporting/exchange_rates/constants.ts
// Business constants, permissions, and limits for exchange rates module

export const EXCHANGE_RATES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'exchange_rates:view',
    CREATE: 'exchange_rates:create',
    EDIT: 'exchange_rates:edit',
    DELETE: 'exchange_rates:delete',
  },

  LIMITS: {
    MAX_RATE: 1000000,
    MIN_RATE: 0.000001,
  },

  DEFAULTS: {
    RATE: 1.0,
    SOURCE: 'manual',
    IS_ACTIVE: true,
  },
} as const;

export const EXCHANGE_RATES_VALUES = {
  // Add enum values here if needed
} as const;
