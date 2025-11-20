// convex/lib/boilerplate/payments/payments/constants.ts
// Business constants, permissions, and limits for payments module

export const PAYMENTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'payments:view',
    CREATE: 'payments:create',
    EDIT: 'payments:edit',
    DELETE: 'payments:delete',
    TRACK_USAGE: 'payments:track_usage',
    MANAGE_SUBSCRIPTION: 'payments:manage_subscription',
  },

  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    TRIALING: 'trialing',
  },

  PLAN_TYPE: {
    FREE: 'free',
    PAID: 'paid',
  },

  EVENT_TYPE: {
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    PAYMENT_SUCCEEDED: 'payment_succeeded',
    PAYMENT_FAILED: 'payment_failed',
    TRIAL_STARTED: 'trial_started',
    TRIAL_ENDED: 'trial_ended',
    PLAN_UPGRADED: 'plan_upgraded',
    PLAN_DOWNGRADED: 'plan_downgraded',
    USAGE_TRACKED: 'usage_tracked',
    LIMIT_EXCEEDED: 'limit_exceeded',
    OTHER: 'other',
  },

  EVENT_SOURCE: {
    AUTUMN: 'autumn',
    APP: 'app',
  },

  PAYMENT_EVENT_STATUS: {
    PENDING: 'pending',
    PROCESSED: 'processed',
    FAILED: 'failed',
  },

  LIMITS: {
    MAX_PLAN_NAME_LENGTH: 100,
    MIN_PLAN_NAME_LENGTH: 1,
    MAX_FEATURE_KEY_LENGTH: 100,
    MAX_UNIT_LENGTH: 50,
    MAX_CONTEXT_LENGTH: 500,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_QUANTITY: 0,
  },

  VALIDATION: {
    PLAN_NAME_PATTERN: /^.+$/,
    FEATURE_KEY_PATTERN: /^[a-zA-Z0-9_-]+$/,
  },

  DEFAULT_VALUES: {
    USAGE: {
      aiRequests: 0,
      projects: 0,
      storage: 0,
    },
    LIMITS: {
      aiRequests: 1000,
      projects: 10,
      storage: 10,
      teamMembers: 5,
    },
  },
} as const;
