// convex/schema/boilerplate/stripe_connect/stripe_connect/stripe_connect.ts
// Table definitions for stripe_connect module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { stripeConnectValidators } from './validators';

/**
 * Connected Accounts Table
 * Stores Stripe Connect Express account information for clients
 */
export const connectedAccountsTable = defineTable({
  // Required: Main display field
  name: v.string(), // Client name (using 'name' instead of 'clientName' for GUIDE compatibility)

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // Account owner/creator

  // Client identification
  clientEmail: v.string(),

  // Stripe Connect account details
  stripeAccountId: v.string(), // Stripe Connect account ID (acct_xxx)
  accountType: stripeConnectValidators.accountType, // Using Express accounts

  // Account status
  status: stripeConnectValidators.accountStatus,

  // Capabilities (what the account can do)
  capabilities: v.optional(v.object({
    card_payments: v.optional(v.string()), // 'active' | 'inactive' | 'pending'
    transfers: v.optional(v.string()),
  })),

  // Account details
  charges_enabled: v.optional(v.boolean()), // Can process charges
  payouts_enabled: v.optional(v.boolean()), // Can receive payouts
  details_submitted: v.optional(v.boolean()), // Has submitted verification details

  // Onboarding
  onboarding_completed: v.boolean(), // Fully onboarded
  onboarding_link: v.optional(v.string()), // Latest onboarding link
  onboarding_link_expires_at: v.optional(v.number()), // Link expiration

  // Settings
  statement_descriptor: v.optional(v.string()), // Appears on customer's credit card statement
  default_currency: v.optional(v.string()), // Default currency (e.g., 'usd')

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_stripe_account_id', ['stripeAccountId'])
  .index('by_status', ['status'])
  .index('by_client_email', ['clientEmail'])
  .index('by_onboarding_completed', ['onboarding_completed'])
  .index('by_created_at', ['createdAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);

/**
 * Client Products Table
 * Stores products and pricing plans for connected accounts
 */
export const clientProductsTable = defineTable({
  // Required: Main display field
  name: v.string(), // Product name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // Product owner

  // Connected account reference
  connectedAccountId: v.id('connectedAccounts'),

  // Stripe product details
  stripeProductId: v.optional(v.string()), // Stripe product ID (prod_xxx)
  stripePriceId: v.optional(v.string()), // Stripe price ID (price_xxx)

  // Product information
  description: v.optional(v.string()),

  // Pricing
  amount: v.number(), // Price in cents
  currency: v.string(), // Currency code (e.g., 'usd')
  interval: v.optional(stripeConnectValidators.interval), // Billing interval

  // Application fee (your percentage)
  application_fee_percent: v.number(), // Fee percentage (e.g., 5 for 5%)
  application_fee_amount: v.optional(v.number()), // Or fixed amount in cents

  // Status
  active: v.boolean(),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_connected_account_id', ['connectedAccountId'])
  .index('by_stripe_product_id', ['stripeProductId'])
  .index('by_active', ['active'])
  .index('by_created_at', ['createdAt'])
  .index('by_owner_and_account', ['ownerId', 'connectedAccountId']);

/**
 * Client Payments Table
 * Tracks payments made to connected accounts with application fees
 */
export const clientPaymentsTable = defineTable({
  // Required: Main display field (using publicId as display reference since payments don't have names)
  name: v.string(), // Generated display name like "Payment {publicId}" or customer name

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // Payment owner/processor

  // Connected account reference
  connectedAccountId: v.id('connectedAccounts'),

  // Product reference (if applicable)
  productId: v.optional(v.id('clientProducts')),

  // Stripe payment details
  stripePaymentIntentId: v.optional(v.string()), // Payment Intent ID (pi_xxx)
  stripeChargeId: v.optional(v.string()), // Charge ID (ch_xxx)
  stripeSubscriptionId: v.optional(v.string()), // Subscription ID (sub_xxx) if recurring
  stripeInvoiceId: v.optional(v.string()), // Invoice ID (in_xxx) if subscription

  // Customer information
  customerEmail: v.optional(v.string()),
  customerName: v.optional(v.string()),
  stripeCustomerId: v.optional(v.string()), // Customer ID on connected account

  // Payment type
  paymentType: stripeConnectValidators.paymentType,

  // Amounts (in cents)
  amount: v.number(), // Total payment amount
  application_fee_amount: v.number(), // Your fee amount
  net_amount: v.number(), // Amount client receives (amount - fee)
  currency: v.string(),

  // Status
  status: stripeConnectValidators.paymentStatus,

  // Subscription details (if recurring)
  subscription_status: v.optional(stripeConnectValidators.subscriptionStatus),
  subscription_current_period_end: v.optional(v.number()),

  // Refund information
  refunded: v.optional(v.boolean()),
  refund_amount: v.optional(v.number()),
  refund_date: v.optional(v.number()),

  // Description
  description: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_connected_account_id', ['connectedAccountId'])
  .index('by_stripe_payment_intent_id', ['stripePaymentIntentId'])
  .index('by_stripe_subscription_id', ['stripeSubscriptionId'])
  .index('by_status', ['status'])
  .index('by_payment_type', ['paymentType'])
  .index('by_created_at', ['createdAt'])
  .index('by_owner_and_account', ['ownerId', 'connectedAccountId'])
  .index('by_owner_and_status', ['ownerId', 'status']);

/**
 * Connect Events Table
 * Audit trail for Stripe Connect events (webhooks, API calls, etc.)
 */
export const connectEventsTable = defineTable({
  // Required: Main display field
  name: v.string(), // Event name/description

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // Event creator/processor

  // Connected account reference
  connectedAccountId: v.optional(v.id('connectedAccounts')),

  // Payment reference (if applicable)
  paymentId: v.optional(v.id('clientPayments')),

  // Event details
  eventType: stripeConnectValidators.eventType,

  // Event data
  stripeEventId: v.optional(v.string()), // Stripe webhook event ID
  eventData: v.optional(v.any()), // Full event payload
  source: stripeConnectValidators.eventSource,

  // Processing status
  status: v.union(
    v.literal('pending'),
    v.literal('processed'),
    v.literal('failed')
  ),
  processed: v.optional(v.boolean()),
  error: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_connected_account_id', ['connectedAccountId'])
  .index('by_payment_id', ['paymentId'])
  .index('by_event_type', ['eventType'])
  .index('by_stripe_event_id', ['stripeEventId'])
  .index('by_processed', ['processed'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt']);
