// convex/lib/system/supporting/counters/constants.ts
// Business constants for system counters module

export const SYSTEM_COUNTERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:counters:view',
    CREATE: 'system:counters:create',
    EDIT: 'system:counters:edit',
  },

  DEFAULTS: {
    STEP: 1,
    PAD_LENGTH: 4,
  },
} as const;

export const SYSTEM_COUNTERS_VALUES = {
  // Counter types defined in schema validators
} as const;
