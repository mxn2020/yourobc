// convex/lib/boilerplate/autumn/autumn_customers/constants.ts
// Business constants, permissions, and limits for autumn customers module

export const AUTUMN_CUSTOMERS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'autumn_customers:view',
    CREATE: 'autumn_customers:create',
    EDIT: 'autumn_customers:edit',
    DELETE: 'autumn_customers:delete',
    SYNC: 'autumn_customers:sync',
  },

  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    INACTIVE: 'inactive',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 3,
    SYNC_INTERVAL_MS: 300000, // 5 minutes
    SYNC_RETRY_DELAY_MS: 60000, // 1 minute
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_@.]+$/,
  },
} as const;

export const AUTUMN_SUBSCRIPTION_STATUS_NAMES = {
  active: 'Active',
  trialing: 'Trialing',
  cancelled: 'Cancelled',
  past_due: 'Past Due',
  inactive: 'Inactive',
} as const;
