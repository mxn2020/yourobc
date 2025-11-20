// convex/lib/boilerplate/payments/stripe_connect/constants.ts

/**
 * Stripe Connect Constants
 *
 * Constants for Stripe Connect module
 */

export const STRIPE_CONNECT_CONSTANTS = {
  // Permissions
  PERMISSIONS: {
    VIEW: 'payments:stripe_connect:view',
    CREATE: 'payments:stripe_connect:create',
    UPDATE: 'payments:stripe_connect:update',
    DELETE: 'payments:stripe_connect:delete',
    MANAGE_ACCOUNTS: 'payments:stripe_connect:manage_accounts',
    MANAGE_PRODUCTS: 'payments:stripe_connect:manage_products',
    MANAGE_PAYMENTS: 'payments:stripe_connect:manage_payments',
    VIEW_ANALYTICS: 'payments:stripe_connect:view_analytics',
  },

  // Account Statuses
  ACCOUNT_STATUS: {
    PENDING: 'pending',
    ONBOARDING: 'onboarding',
    ACTIVE: 'active',
    RESTRICTED: 'restricted',
    DISABLED: 'disabled',
  } as const,

  // Payment Statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
  } as const,

  // Subscription Statuses
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    PAST_DUE: 'past_due',
    CANCELLED: 'cancelled',
    UNPAID: 'unpaid',
  } as const,

  // Payment Types
  PAYMENT_TYPE: {
    ONE_TIME: 'one_time',
    SUBSCRIPTION: 'subscription',
  } as const,

  // Intervals
  INTERVAL: {
    ONE_TIME: 'one_time',
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
  } as const,

  // Event Types
  EVENT_TYPE: {
    ACCOUNT_CREATED: 'account_created',
    ACCOUNT_UPDATED: 'account_updated',
    ACCOUNT_ONBOARDED: 'account_onboarded',
    PAYMENT_CREATED: 'payment_created',
    PAYMENT_SUCCEEDED: 'payment_succeeded',
    PAYMENT_FAILED: 'payment_failed',
    SUBSCRIPTION_CREATED: 'subscription_created',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    REFUND_CREATED: 'refund_created',
    WEBHOOK_RECEIVED: 'webhook_received',
    API_ERROR: 'api_error',
    OTHER: 'other',
  } as const,

  // Event Sources
  EVENT_SOURCE: {
    STRIPE_WEBHOOK: 'stripe_webhook',
    API_CALL: 'api_call',
    MANUAL: 'manual',
  } as const,

  // Default Values
  DEFAULT_VALUES: {
    ACCOUNT_TYPE: 'express',
    ACCOUNT_STATUS: 'pending',
    ONBOARDING_COMPLETED: false,
    ACTIVE: true,
    DEFAULT_CURRENCY: 'usd',
    APPLICATION_FEE_PERCENT: 5,
    PAYMENT_TYPE: 'one_time',
    INTERVAL: 'one_time',
  },

  // Validation Limits
  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_EMAIL_LENGTH: 255,
    MIN_AMOUNT: 50, // Minimum charge amount in cents (Stripe minimum)
    MAX_AMOUNT: 99999999, // Maximum amount in cents
    MAX_APPLICATION_FEE_PERCENT: 100,
    MIN_APPLICATION_FEE_PERCENT: 0,
    MAX_QUERY_LIMIT: 100,
    DEFAULT_QUERY_LIMIT: 50,
  },

  // Validation Patterns
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    STRIPE_ACCOUNT_ID_PATTERN: /^acct_[a-zA-Z0-9]+$/,
    STRIPE_PAYMENT_INTENT_PATTERN: /^pi_[a-zA-Z0-9]+$/,
    STRIPE_CHARGE_PATTERN: /^ch_[a-zA-Z0-9]+$/,
    STRIPE_SUBSCRIPTION_PATTERN: /^sub_[a-zA-Z0-9]+$/,
    STRIPE_CUSTOMER_PATTERN: /^cus_[a-zA-Z0-9]+$/,
    STRIPE_PRODUCT_PATTERN: /^prod_[a-zA-Z0-9]+$/,
    STRIPE_PRICE_PATTERN: /^price_[a-zA-Z0-9]+$/,
    CURRENCY_PATTERN: /^[a-z]{3}$/,
  },
} as const;
