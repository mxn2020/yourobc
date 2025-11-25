// convex/lib/yourobc/supporting/counters/constants.ts
// Business constants, permissions, and limits for counters module

export const COUNTERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'counters:view',
    CREATE: 'counters:create',
    EDIT: 'counters:edit',
    DELETE: 'counters:delete',
  },

  LIMITS: {
    MAX_COUNTER_VALUE: 9999999,
    MIN_COUNTER_VALUE: 0,
  },

  DEFAULTS: {
    YEAR: new Date().getFullYear(),
    LAST_NUMBER: 0,
  },
} as const;

export const COUNTERS_VALUES = {
  // Counter types are defined in base validators
} as const;
