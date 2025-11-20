// convex/lib/boilerplate/stripe/stripe/constants.ts
// Business constants, permissions, and limits for stripe module

export const STRIPE_CONSTANTS = {
  PERMISSIONS: {
    // Customer permissions
    CUSTOMER_VIEW: 'stripe:customer:view',
    CUSTOMER_CREATE: 'stripe:customer:create',
    CUSTOMER_UPDATE: 'stripe:customer:update',
    CUSTOMER_DELETE: 'stripe:customer:delete',

    // Subscription permissions
    SUBSCRIPTION_VIEW: 'stripe:subscription:view',
    SUBSCRIPTION_CREATE: 'stripe:subscription:create',
    SUBSCRIPTION_UPDATE: 'stripe:subscription:update',
    SUBSCRIPTION_CANCEL: 'stripe:subscription:cancel',
    SUBSCRIPTION_DELETE: 'stripe:subscription:delete',

    // Payment permissions
    PAYMENT_VIEW: 'stripe:payment:view',
    PAYMENT_CREATE: 'stripe:payment:create',
    PAYMENT_REFUND: 'stripe:payment:refund',
    PAYMENT_DELETE: 'stripe:payment:delete',

    // Webhook permissions
    WEBHOOK_VIEW: 'stripe:webhook:view',
    WEBHOOK_PROCESS: 'stripe:webhook:process',
    WEBHOOK_RETRY: 'stripe:webhook:retry',

    // Admin permissions
    ADMIN_VIEW_ALL: 'stripe:admin:view:all',
    ADMIN_MANAGE_ALL: 'stripe:admin:manage:all',
    ADMIN_ANALYTICS: 'stripe:admin:analytics',
  },

  LIMITS: {
    // Customer limits
    CUSTOMER_NAME_MAX: 200,
    CUSTOMER_EMAIL_MAX: 255,
    CUSTOMER_DESCRIPTION_MAX: 500,
    CUSTOMER_PHONE_MAX: 50,

    // Address limits
    ADDRESS_LINE_MAX: 100,
    CITY_MAX: 100,
    STATE_MAX: 100,
    POSTAL_CODE_MAX: 20,
    COUNTRY_MAX: 2, // ISO 3166-1 alpha-2

    // Subscription limits
    SUBSCRIPTION_NAME_MAX: 200,
    PRODUCT_NAME_MAX: 200,
    PRODUCT_DESCRIPTION_MAX: 1000,
    CANCEL_REASON_MAX: 500,
    COUPON_CODE_MAX: 50,

    // Payment limits
    PAYMENT_DESCRIPTION_MAX: 500,
    REFUND_REASON_MAX: 500,
    ERROR_MESSAGE_MAX: 1000,

    // Amount limits (in cents)
    MIN_AMOUNT_USD: 50, // $0.50
    MAX_AMOUNT_USD: 99999999, // $999,999.99
    MIN_AMOUNT_EUR: 50,
    MAX_AMOUNT_EUR: 99999999,

    // Webhook limits
    WEBHOOK_EVENT_DATA_MAX: 1048576, // 1MB
    WEBHOOK_MAX_RETRY_ATTEMPTS: 5,
    WEBHOOK_RETRY_DELAY_MINUTES: 5,

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Search
    MIN_SEARCH_QUERY_LENGTH: 2,
    MAX_SEARCH_RESULTS: 50,
  },

  DEFAULTS: {
    // Customer defaults
    CUSTOMER_STATUS: 'active' as const,
    CUSTOMER_CURRENCY: 'usd' as const,
    CUSTOMER_BALANCE: 0,
    CUSTOMER_DELINQUENT: false,

    // Subscription defaults
    SUBSCRIPTION_STATUS: 'active' as const,
    COLLECTION_METHOD: 'charge_automatically' as const,
    CANCEL_AT_PERIOD_END: false,
    SUBSCRIPTION_QUANTITY: 1,
    DAYS_UNTIL_DUE: 0,

    // Payment defaults
    PAYMENT_STATUS: 'pending' as const,
    PAYMENT_CURRENCY: 'usd' as const,
    REFUNDED: false,
    DISPUTED: false,
    PROCESSING_ATTEMPTS: 0,

    // Webhook defaults
    WEBHOOK_STATUS: 'pending' as const,
    WEBHOOK_PROCESSING_ATTEMPTS: 0,
    WEBHOOK_LIVEMODE: false,

    // Pagination
    PAGE_SIZE: 20,

    // Trial periods
    TRIAL_DAYS: 14,
  },

  SUBSCRIPTION_STATUSES: {
    ACTIVE: 'active' as const,
    CANCELED: 'canceled' as const,
    INCOMPLETE: 'incomplete' as const,
    INCOMPLETE_EXPIRED: 'incomplete_expired' as const,
    PAST_DUE: 'past_due' as const,
    TRIALING: 'trialing' as const,
    UNPAID: 'unpaid' as const,
  },

  PAYMENT_STATUSES: {
    PENDING: 'pending' as const,
    PROCESSING: 'processing' as const,
    SUCCEEDED: 'succeeded' as const,
    FAILED: 'failed' as const,
    CANCELED: 'canceled' as const,
    REFUNDED: 'refunded' as const,
  },

  CUSTOMER_STATUSES: {
    ACTIVE: 'active' as const,
    INACTIVE: 'inactive' as const,
    SUSPENDED: 'suspended' as const,
  },

  WEBHOOK_STATUSES: {
    PENDING: 'pending' as const,
    PROCESSING: 'processing' as const,
    SUCCEEDED: 'succeeded' as const,
    FAILED: 'failed' as const,
    RETRYING: 'retrying' as const,
  },

  BILLING_INTERVALS: {
    DAY: 'day' as const,
    WEEK: 'week' as const,
    MONTH: 'month' as const,
    YEAR: 'year' as const,
  },

  COLLECTION_METHODS: {
    CHARGE_AUTOMATICALLY: 'charge_automatically' as const,
    SEND_INVOICE: 'send_invoice' as const,
  },

  WEBHOOK_EVENTS: {
    // Customer events
    CUSTOMER_CREATED: 'customer.created',
    CUSTOMER_UPDATED: 'customer.updated',
    CUSTOMER_DELETED: 'customer.deleted',
    CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
    CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
    CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
    CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',

    // Payment intent events
    PAYMENT_INTENT_CREATED: 'payment_intent.created',
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
    PAYMENT_INTENT_CANCELED: 'payment_intent.canceled',
    PAYMENT_INTENT_PROCESSING: 'payment_intent.processing',
    PAYMENT_INTENT_AMOUNT_CAPTURABLE_UPDATED: 'payment_intent.amount_capturable_updated',

    // Charge events
    CHARGE_SUCCEEDED: 'charge.succeeded',
    CHARGE_FAILED: 'charge.failed',
    CHARGE_CAPTURED: 'charge.captured',
    CHARGE_REFUNDED: 'charge.refunded',
    CHARGE_UPDATED: 'charge.updated',
    CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
    CHARGE_DISPUTE_UPDATED: 'charge.dispute.updated',
    CHARGE_DISPUTE_CLOSED: 'charge.dispute.closed',

    // Invoice events
    INVOICE_CREATED: 'invoice.created',
    INVOICE_FINALIZED: 'invoice.finalized',
    INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
    INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
    INVOICE_UPCOMING: 'invoice.upcoming',
    INVOICE_VOIDED: 'invoice.voided',
    INVOICE_PAID: 'invoice.paid',

    // Subscription schedule events
    SUBSCRIPTION_SCHEDULE_CREATED: 'subscription_schedule.created',
    SUBSCRIPTION_SCHEDULE_UPDATED: 'subscription_schedule.updated',
    SUBSCRIPTION_SCHEDULE_CANCELED: 'subscription_schedule.canceled',
    SUBSCRIPTION_SCHEDULE_RELEASED: 'subscription_schedule.released',
    SUBSCRIPTION_SCHEDULE_ABORTED: 'subscription_schedule.aborted',
  },

  ERROR_MESSAGES: {
    // Customer errors
    CUSTOMER_NOT_FOUND: 'Stripe customer not found',
    CUSTOMER_EMAIL_REQUIRED: 'Customer email is required',
    CUSTOMER_EMAIL_INVALID: 'Customer email is invalid',
    CUSTOMER_ALREADY_EXISTS: 'Customer already exists',
    CUSTOMER_CREATION_FAILED: 'Failed to create Stripe customer',

    // Subscription errors
    SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
    SUBSCRIPTION_ALREADY_CANCELED: 'Subscription is already canceled',
    SUBSCRIPTION_CREATION_FAILED: 'Failed to create subscription',
    SUBSCRIPTION_UPDATE_FAILED: 'Failed to update subscription',
    SUBSCRIPTION_CANCEL_FAILED: 'Failed to cancel subscription',
    INVALID_SUBSCRIPTION_STATUS: 'Invalid subscription status',

    // Payment errors
    PAYMENT_NOT_FOUND: 'Payment not found',
    PAYMENT_ALREADY_REFUNDED: 'Payment has already been refunded',
    PAYMENT_CREATION_FAILED: 'Failed to create payment',
    PAYMENT_PROCESSING_FAILED: 'Payment processing failed',
    REFUND_FAILED: 'Failed to process refund',
    INVALID_AMOUNT: 'Invalid payment amount',
    AMOUNT_TOO_SMALL: 'Payment amount is too small',
    AMOUNT_TOO_LARGE: 'Payment amount is too large',

    // Webhook errors
    WEBHOOK_NOT_FOUND: 'Webhook event not found',
    WEBHOOK_PROCESSING_FAILED: 'Failed to process webhook event',
    WEBHOOK_ALREADY_PROCESSED: 'Webhook event already processed',
    WEBHOOK_SIGNATURE_INVALID: 'Invalid webhook signature',
    WEBHOOK_EVENT_TYPE_UNKNOWN: 'Unknown webhook event type',

    // Permission errors
    NOT_AUTHORIZED: 'You are not authorized to perform this action',
    ADMIN_ONLY: 'This action requires administrator privileges',
    NOT_CUSTOMER_OWNER: 'You are not the owner of this customer record',
    NOT_SUBSCRIPTION_OWNER: 'You are not the owner of this subscription',

    // Validation errors
    INVALID_INPUT: 'Invalid input provided',
    INVALID_CURRENCY: 'Invalid currency code',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_STRIPE_ID: 'Invalid Stripe ID',
    MISSING_REQUIRED_FIELD: 'Missing required field',

    // Generic errors
    DATABASE_ERROR: 'Database operation failed',
    STRIPE_API_ERROR: 'Stripe API error occurred',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },

  SUCCESS_MESSAGES: {
    // Customer messages
    CUSTOMER_CREATED: 'Stripe customer created successfully',
    CUSTOMER_UPDATED: 'Stripe customer updated successfully',
    CUSTOMER_DELETED: 'Stripe customer deleted successfully',

    // Subscription messages
    SUBSCRIPTION_CREATED: 'Subscription created successfully',
    SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
    SUBSCRIPTION_CANCELED: 'Subscription canceled successfully',
    SUBSCRIPTION_DELETED: 'Subscription deleted successfully',

    // Payment messages
    PAYMENT_CREATED: 'Payment created successfully',
    PAYMENT_SUCCEEDED: 'Payment succeeded',
    PAYMENT_REFUNDED: 'Payment refunded successfully',

    // Webhook messages
    WEBHOOK_PROCESSED: 'Webhook event processed successfully',
    WEBHOOK_RETRIED: 'Webhook event retry scheduled',
  },

  VALIDATION_PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    STRIPE_CUSTOMER_ID: /^cus_[a-zA-Z0-9]+$/,
    STRIPE_SUBSCRIPTION_ID: /^sub_[a-zA-Z0-9]+$/,
    STRIPE_PAYMENT_INTENT_ID: /^pi_[a-zA-Z0-9]+$/,
    STRIPE_CHARGE_ID: /^ch_[a-zA-Z0-9]+$/,
    STRIPE_INVOICE_ID: /^in_[a-zA-Z0-9]+$/,
    STRIPE_PRICE_ID: /^price_[a-zA-Z0-9]+$/,
    STRIPE_PRODUCT_ID: /^prod_[a-zA-Z0-9]+$/,
    CURRENCY_CODE: /^[A-Z]{3}$/,
    POSTAL_CODE_US: /^\d{5}(-\d{4})?$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
  },

  CURRENCIES: {
    USD: 'usd',
    EUR: 'eur',
    GBP: 'gbp',
    CAD: 'cad',
    AUD: 'aud',
    JPY: 'jpy',
    CNY: 'cny',
    INR: 'inr',
  },

  FEATURES: {
    ENABLE_SUBSCRIPTIONS: true,
    ENABLE_ONE_TIME_PAYMENTS: true,
    ENABLE_REFUNDS: true,
    ENABLE_WEBHOOKS: true,
    ENABLE_CUSTOMER_PORTAL: true,
    ENABLE_INVOICING: true,
    ENABLE_TAX_CALCULATION: false,
    ENABLE_PAYMENT_METHODS: true,
    ENABLE_COUPONS: true,
    ENABLE_TRIALS: true,
  },

  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
    BACKOFF_MULTIPLIER: 2,
  },

  WEBHOOK_CONFIG: {
    SIGNATURE_HEADER: 'stripe-signature',
    TOLERANCE_SECONDS: 300, // 5 minutes
    MAX_EVENT_AGE_HOURS: 24,
  },
} as const;
