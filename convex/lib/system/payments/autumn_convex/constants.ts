// convex/lib/boilerplate/payments/autumn_convex/constants.ts

/**
 * Autumn Convex Constants
 *
 * Constants for Autumn payment integration module
 */

export const AUTUMN_CONSTANTS = {
  // Permissions
  PERMISSIONS: {
    VIEW: 'payments:autumn:view',
    CREATE: 'payments:autumn:create',
    UPDATE: 'payments:autumn:update',
    TRACK_USAGE: 'payments:autumn:track_usage',
  },

  // Plan Types
  PLAN_TYPES: {
    FREE: 'free',
    PAID: 'paid',
  } as const,

  // Subscription Statuses
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    CANCELLED: 'cancelled',
    PAST_DUE: 'past_due',
    TRIALING: 'trialing',
  } as const,

  // Event Types
  EVENT_TYPES: {
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
  } as const,

  // Event Sources
  EVENT_SOURCES: {
    AUTUMN: 'autumn',
    APP: 'app',
  } as const,

  // Default Values
  DEFAULT_VALUES: {
    USAGE: {
      aiRequests: 0,
      projects: 0,
      storage: 0,
    },
  },

  // Validation Limits
  LIMITS: {
    MAX_PLAN_NAME_LENGTH: 100,
    MAX_FEATURE_KEY_LENGTH: 100,
    MAX_UNIT_LENGTH: 50,
    MAX_CONTEXT_LENGTH: 500,
  },
} as const;
