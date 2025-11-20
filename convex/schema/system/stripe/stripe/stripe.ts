// convex/schema/boilerplate/stripe/stripe/stripe.ts
// Table definitions for stripe module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { stripeValidators } from './validators';

/**
 * Stripe Customers Table
 *
 * Stores Stripe customer information
 *
 * @remarks
 * - Uses authUserId (string) for simpler client code integration
 * - Links to Better Auth's user ID for easy lookup from client hooks
 * - Tracks customer metadata and billing information
 */
export const stripeCustomersTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: v.optional(stripeValidators.customerStatus),

  // User reference - Better Auth user ID (string)
  authUserId: v.string(),

  // Stripe customer details
  stripeCustomerId: v.string(),
  email: v.string(),

  // Customer Information
  phone: v.optional(v.string()),
  description: v.optional(v.string()),

  // Billing Address
  address: v.optional(
    v.object({
      line1: v.optional(v.string()),
      line2: v.optional(v.string()),
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      postalCode: v.optional(v.string()),
      country: v.optional(v.string()),
    })
  ),

  // Payment Method
  defaultPaymentMethodId: v.optional(v.string()),
  defaultSourceId: v.optional(v.string()),

  // Customer Settings
  currency: v.optional(v.string()),
  balance: v.optional(v.number()),
  delinquent: v.optional(v.boolean()),

  // Tax Information
  taxExempt: v.optional(v.string()),
  taxIds: v.optional(v.array(v.string())),

  // Marketing Preferences
  invoiceSettings: v.optional(
    v.object({
      customFields: v.optional(v.any()),
      defaultPaymentMethod: v.optional(v.string()),
      footer: v.optional(v.string()),
    })
  ),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_stripe_customer_id', ['stripeCustomerId'])
  .index('by_email', ['email'])
  .index('by_created_at', ['createdAt']);

/**
 * Stripe Subscriptions Table
 *
 * Tracks active and past subscriptions
 *
 * @remarks
 * - Uses authUserId (string) for simpler client code integration
 * - Supports multiple subscription plans and products
 * - Tracks trial periods and cancellation details
 */
export const stripeSubscriptionsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),
  status: stripeValidators.subscriptionStatus,

  // User and customer reference
  authUserId: v.string(),
  stripeCustomerId: v.string(),

  // Stripe subscription details
  stripeSubscriptionId: v.string(),
  stripePriceId: v.string(),
  stripeProductId: v.string(),

  // Product Information
  productName: v.optional(v.string()),
  productDescription: v.optional(v.string()),

  // Pricing
  amount: v.optional(v.number()),
  currency: v.optional(v.string()),
  interval: v.optional(stripeValidators.billingInterval),
  intervalCount: v.optional(v.number()),

  // Period dates
  currentPeriodStart: v.number(),
  currentPeriodEnd: v.number(),

  // Cancellation
  cancelAtPeriodEnd: v.boolean(),
  canceledAt: v.optional(v.number()),
  cancelAt: v.optional(v.number()),
  cancelReason: v.optional(v.string()),

  // Trial period
  trialStart: v.optional(v.number()),
  trialEnd: v.optional(v.number()),

  // Billing
  daysUntilDue: v.optional(v.number()),
  startDate: v.optional(v.number()),
  endedAt: v.optional(v.number()),

  // Collection Method
  collectionMethod: v.optional(v.union(v.literal('charge_automatically'), v.literal('send_invoice'))),

  // Discount and Coupon
  discountId: v.optional(v.string()),
  couponId: v.optional(v.string()),
  couponCode: v.optional(v.string()),

  // Quantity
  quantity: v.optional(v.number()),

  // Default Payment Method
  defaultPaymentMethodId: v.optional(v.string()),

  // Latest Invoice
  latestInvoiceId: v.optional(v.string()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_stripe_customer_id', ['stripeCustomerId'])
  .index('by_stripe_subscription_id', ['stripeSubscriptionId'])
  .index('by_status', ['status'])
  .index('by_auth_user_id_status', ['authUserId', 'status'])
  .index('by_product', ['stripeProductId'])
  .index('by_created_at', ['createdAt'])
  .index('by_current_period_end', ['currentPeriodEnd']);

/**
 * Stripe Payments Table
 *
 * Tracks one-time payments and payment intents
 *
 * @remarks
 * - Uses authUserId (string) for user tracking
 * - Optional for guest checkouts
 * - Supports refunds and payment metadata
 */
export const stripePaymentsTable = defineTable({
  // Required: Core fields (authUserId optional for guests)
  publicId: v.string(),
  ownerId: v.optional(v.id('userProfiles')),
  name: v.string(),
  status: stripeValidators.paymentStatus,

  // User and customer reference (optional for guests)
  authUserId: v.optional(v.string()),
  stripeCustomerId: v.optional(v.string()),

  // Stripe payment details
  stripePaymentIntentId: v.string(),
  stripeChargeId: v.optional(v.string()),
  stripeInvoiceId: v.optional(v.string()),

  // Payment amount
  amount: v.number(), // In cents
  currency: v.string(),
  amountReceived: v.optional(v.number()),

  // Payment details
  description: v.optional(v.string()),
  receiptEmail: v.optional(v.string()),
  receiptUrl: v.optional(v.string()),

  // Payment Method
  paymentMethodId: v.optional(v.string()),
  paymentMethodType: v.optional(v.string()),

  // Processing Details
  processingAt: v.optional(v.number()),
  succeededAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),

  // Error Information
  errorMessage: v.optional(v.string()),
  errorCode: v.optional(v.string()),

  // Refund information
  refunded: v.optional(v.boolean()),
  refundAmount: v.optional(v.number()),
  refundDate: v.optional(v.number()),
  refundReason: v.optional(v.string()),

  // Dispute Information
  disputed: v.optional(v.boolean()),
  disputeStatus: v.optional(v.string()),
  disputeReason: v.optional(v.string()),

  // Application Fee
  applicationFee: v.optional(v.number()),
  applicationFeeAmount: v.optional(v.number()),

  // Transfer Information
  transferId: v.optional(v.string()),
  transferGroup: v.optional(v.string()),

  // Related Objects
  subscriptionId: v.optional(v.id('stripeSubscriptions')),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_stripe_customer_id', ['stripeCustomerId'])
  .index('by_stripe_payment_intent_id', ['stripePaymentIntentId'])
  .index('by_stripe_invoice_id', ['stripeInvoiceId'])
  .index('by_status', ['status'])
  .index('by_subscription', ['subscriptionId'])
  .index('by_created_at', ['createdAt'])
  .index('by_refunded', ['refunded']);

/**
 * Stripe Webhook Events Table
 *
 * Logs all incoming webhook events from Stripe
 *
 * @remarks
 * - Tracks webhook processing status
 * - Stores raw event data for debugging
 * - Prevents duplicate processing with idempotency
 */
export const stripeWebhookEventsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.optional(v.id('userProfiles')),
  name: v.string(),
  status: stripeValidators.webhookStatus,

  // Event Details
  stripeEventId: v.string(),
  eventType: v.string(),
  apiVersion: v.optional(v.string()),

  // Event Data
  eventData: v.any(),
  objectType: v.optional(v.string()),
  objectId: v.optional(v.string()),

  // Processing
  processedAt: v.optional(v.number()),
  processingAttempts: v.optional(v.number()),
  lastProcessingAttempt: v.optional(v.number()),

  // Error Tracking
  errorMessage: v.optional(v.string()),
  errorStack: v.optional(v.string()),

  // Idempotency
  idempotencyKey: v.optional(v.string()),

  // Webhook Source
  livemode: v.optional(v.boolean()),
  account: v.optional(v.string()),

  // Required: Standard fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_stripe_event_id', ['stripeEventId'])
  .index('by_event_type', ['eventType'])
  .index('by_status', ['status'])
  .index('by_object_type', ['objectType', 'objectId'])
  .index('by_idempotency_key', ['idempotencyKey'])
  .index('by_created_at', ['createdAt']);
