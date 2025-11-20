// convex/lib/boilerplate/stripe-connect/mutations.ts

/**
 * Stripe Connect Mutations
 *
 * Mutation functions for managing Stripe Connect data in Convex
 */

declare const process: { env: Record<string, string | undefined> }

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { STRIPE_CONNECT_CONSTANTS } from './constants';
import { validateCreateConnectedAccountData, validateCreateProductData } from './utils';

// ============================================
// Connected Account Mutations
// ============================================

/**
 * Create or update a connected account
 * 🔒 Authentication: Required
 */
export const upsertConnectedAccount = mutation({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    stripeAccountId: v.string(),
    accountType: v.literal('express'),
    accountStatus: v.union(
      v.literal('pending'),
      v.literal('onboarding'),
      v.literal('active'),
      v.literal('restricted'),
      v.literal('disabled')
    ),
    capabilities: v.optional(
      v.object({
        card_payments: v.optional(v.string()),
        transfers: v.optional(v.string()),
      })
    ),
    charges_enabled: v.optional(v.boolean()),
    payouts_enabled: v.optional(v.boolean()),
    details_submitted: v.optional(v.boolean()),
    onboarding_completed: v.boolean(),
    statement_descriptor: v.optional(v.string()),
    default_currency: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Trim string fields
    const trimmedData = {
      ...args,
      clientName: args.clientName.trim(),
      clientEmail: args.clientEmail.trim(),
      stripeAccountId: args.stripeAccountId.trim(),
      statement_descriptor: args.statement_descriptor?.trim(),
      default_currency: args.default_currency?.trim(),
    };

    // 3. Check if account already exists
    const existing = await ctx.db
      .query('connectedAccounts')
      .withIndex('by_stripe_account_id', (q) => q.eq('stripeAccountId', trimmedData.stripeAccountId))
      .first();

    if (existing) {
      // 4. Update existing account
      await ctx.db.patch(existing._id, {
        ...trimmedData,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 5. Audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'stripe_connect.account_updated',
        entityType: 'connected_account',
        entityId: existing._id,
        entityTitle: trimmedData.clientName,
        description: `Updated connected account: ${trimmedData.clientName} (${trimmedData.clientEmail})`,
        metadata: { stripeAccountId: trimmedData.stripeAccountId, accountStatus: trimmedData.accountStatus },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return existing._id;
    } else {
      // 4. Create new account
      const publicId = await generateUniquePublicId(ctx, 'connectedAccounts');
      const accountId = await ctx.db.insert('connectedAccounts', {
        publicId,
        ...trimmedData,
        onboarding_link: undefined,
        onboarding_link_expires_at: undefined,
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });

      // 5. Audit log
      await ctx.db.insert('auditLogs', {
        userId: user._id,
        userName: user.name || user.email || 'Unknown User',
        action: 'stripe_connect.account_created',
        entityType: 'connected_account',
        entityId: accountId,
        entityTitle: trimmedData.clientName,
        description: `Created connected account: ${trimmedData.clientName} (${trimmedData.clientEmail})`,
        metadata: { stripeAccountId: trimmedData.stripeAccountId, accountStatus: trimmedData.accountStatus },
        createdAt: now,
        createdBy: user._id,
        updatedAt: now,
      });

      return accountId;
    }
  },
});

/**
 * Update connected account status
 * 🔒 Authentication: Required
 */
export const updateAccountStatus = mutation({
  args: {
    accountId: v.id('connectedAccounts'),
    accountStatus: v.union(
      v.literal('pending'),
      v.literal('onboarding'),
      v.literal('active'),
      v.literal('restricted'),
      v.literal('disabled')
    ),
    charges_enabled: v.optional(v.boolean()),
    payouts_enabled: v.optional(v.boolean()),
    details_submitted: v.optional(v.boolean()),
    onboarding_completed: v.optional(v.boolean()),
    capabilities: v.optional(
      v.object({
        card_payments: v.optional(v.string()),
        transfers: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { accountId, ...updates }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Get account for audit log
    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error('Connected account not found');
    }

    // 3. Update account
    await ctx.db.patch(accountId, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'stripe_connect.account_status_updated',
      entityType: 'connected_account',
      entityId: accountId,
      entityTitle: account.clientName,
      description: `Updated account status to ${updates.accountStatus}`,
      metadata: { accountStatus: updates.accountStatus },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return accountId;
  },
});

/**
 * Update onboarding link
 * 🔒 Authentication: Not required (internal use)
 */
export const updateOnboardingLink = mutation({
  args: {
    accountId: v.id('connectedAccounts'),
    onboarding_link: v.string(),
    onboarding_link_expires_at: v.number(),
  },
  handler: async (ctx, { accountId, ...updates }) => {
    await ctx.db.patch(accountId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return accountId;
  },
});

/**
 * Delete connected account (soft delete)
 * 🔒 Authentication: Required
 */
export const deleteConnectedAccount = mutation({
  args: {
    accountId: v.id('connectedAccounts'),
  },
  handler: async (ctx, { accountId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Get account and check existence
    const account = await ctx.db.get(accountId);
    if (!account || account.deletedAt) {
      throw new Error('Connected account not found');
    }

    // 3. Soft delete all related products
    const products = await ctx.db
      .query('clientProducts')
      .withIndex('by_connected_account_id', (q) => q.eq('connectedAccountId', accountId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    for (const product of products) {
      await ctx.db.patch(product._id, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    // Note: Payments are kept for historical records
    // 4. Soft delete the account
    await ctx.db.patch(accountId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'stripe_connect.account_deleted',
      entityType: 'connected_account',
      entityId: accountId,
      entityTitle: account.clientName,
      description: `Deleted connected account: ${account.clientName} (${account.clientEmail})`,
      metadata: { stripeAccountId: account.stripeAccountId },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return accountId;
  },
});

// ============================================
// Product Mutations
// ============================================

/**
 * Create a product
 * 🔒 Authentication: Required
 */
export const createProduct = mutation({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    interval: v.optional(
      v.union(
        v.literal('one_time'),
        v.literal('day'),
        v.literal('week'),
        v.literal('month'),
        v.literal('year')
      )
    ),
    application_fee_percent: v.number(),
    active: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'clientProducts');

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedStripeProductId = args.stripeProductId.trim();
    const trimmedStripePriceId = args.stripePriceId.trim();
    const trimmedCurrency = args.currency.trim();

    // 3. Insert product
    const productId = await ctx.db.insert('clientProducts', {
      publicId,
      connectedAccountId: args.connectedAccountId,
      stripeProductId: trimmedStripeProductId,
      stripePriceId: trimmedStripePriceId,
      name: trimmedName,
      description: trimmedDescription,
      amount: args.amount,
      currency: trimmedCurrency,
      interval: args.interval,
      application_fee_percent: args.application_fee_percent,
      application_fee_amount: undefined,
      active: args.active,
      metadata: args.metadata,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'stripe_connect.product_created',
      entityType: 'client_product',
      entityId: productId,
      entityTitle: trimmedName,
      description: `Created product: ${trimmedName}`,
      metadata: { stripeProductId: trimmedStripeProductId, amount: args.amount, currency: trimmedCurrency },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return productId;
  },
});

/**
 * Create or update a product (upsert)
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const upsertClientProduct = mutation({
  args: {
    accountId: v.id('connectedAccounts'),
    stripeProductId: v.string(),
    stripePriceId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    interval: v.optional(
      v.union(
        v.literal('one_time'),
        v.literal('day'),
        v.literal('week'),
        v.literal('month'),
        v.literal('year')
      )
    ),
    active: v.boolean(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if product already exists by Stripe product ID
    const existing = await ctx.db
      .query('clientProducts')
      .withIndex('by_stripe_product_id', (q) => q.eq('stripeProductId', args.stripeProductId.trim()))
      .first();

    if (existing) {
      // Update existing product
      await ctx.db.patch(existing._id, {
        connectedAccountId: args.accountId,
        stripePriceId: args.stripePriceId.trim(),
        name: args.name.trim(),
        description: args.description?.trim(),
        amount: args.amount,
        currency: args.currency.trim(),
        interval: args.interval,
        active: args.active,
        metadata: args.metadata,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new product
      const publicId = await generateUniquePublicId(ctx, 'clientProducts');
      const productId = await ctx.db.insert('clientProducts', {
        publicId,
        connectedAccountId: args.accountId,
        stripeProductId: args.stripeProductId.trim(),
        stripePriceId: args.stripePriceId.trim(),
        name: args.name.trim(),
        description: args.description?.trim(),
        amount: args.amount,
        currency: args.currency.trim(),
        interval: args.interval || 'one_time',
        application_fee_percent: Number(process.env.STRIPE_APPLICATION_FEE_PERCENT) || 5,
        application_fee_amount: undefined,
        active: args.active,
        metadata: args.metadata,
        createdAt: now,
        updatedAt: now,
      });
      return productId;
    }
  },
});

/**
 * Update product
 * 🔒 Authentication: Not required (internal use)
 */
export const updateProduct = mutation({
  args: {
    productId: v.id('clientProducts'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      amount: v.optional(v.number()),
      active: v.optional(v.boolean()),
      application_fee_percent: v.optional(v.number()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { productId, updates }) => {
    const trimmedUpdates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) trimmedUpdates.name = updates.name.trim();
    if (updates.description !== undefined) trimmedUpdates.description = updates.description?.trim();
    if (updates.amount !== undefined) trimmedUpdates.amount = updates.amount;
    if (updates.active !== undefined) trimmedUpdates.active = updates.active;
    if (updates.application_fee_percent !== undefined) {
      trimmedUpdates.application_fee_percent = updates.application_fee_percent;
    }
    if (updates.metadata !== undefined) trimmedUpdates.metadata = updates.metadata;

    await ctx.db.patch(productId, trimmedUpdates);

    return productId;
  },
});

/**
 * Delete product (soft delete)
 * 🔒 Authentication: Required
 */
export const deleteProduct = mutation({
  args: {
    productId: v.id('clientProducts'),
  },
  handler: async (ctx, { productId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    const now = Date.now();

    // 2. Get product and check existence
    const product = await ctx.db.get(productId);
    if (!product || product.deletedAt) {
      throw new Error('Product not found');
    }

    // 3. Soft delete the product
    await ctx.db.patch(productId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'stripe_connect.product_deleted',
      entityType: 'client_product',
      entityId: productId,
      entityTitle: product.name,
      description: `Deleted product: ${product.name}`,
      metadata: { stripeProductId: product.stripeProductId },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return productId;
  },
});

// ============================================
// Payment Mutations
// ============================================

/**
 * Create a payment record
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const createPayment = mutation({
  args: {
    connectedAccountId: v.id('connectedAccounts'),
    productId: v.optional(v.id('clientProducts')),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    paymentType: v.union(v.literal('one_time'), v.literal('subscription')),
    amount: v.number(),
    application_fee_amount: v.number(),
    net_amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('cancelled'),
      v.literal('refunded')
    ),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'clientPayments');

    const paymentId = await ctx.db.insert('clientPayments', {
      publicId,
      ...args,
      stripePaymentIntentId: args.stripePaymentIntentId?.trim(),
      stripeChargeId: args.stripeChargeId?.trim(),
      stripeSubscriptionId: args.stripeSubscriptionId?.trim(),
      stripeInvoiceId: args.stripeInvoiceId?.trim(),
      customerEmail: args.customerEmail?.trim(),
      customerName: args.customerName?.trim(),
      stripeCustomerId: args.stripeCustomerId?.trim(),
      currency: args.currency.trim(),
      description: args.description?.trim(),
      subscription_status: undefined,
      subscription_current_period_end: undefined,
      refunded: undefined,
      refund_amount: undefined,
      refund_date: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return paymentId;
  },
});

/**
 * Update payment status
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id('clientPayments'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('succeeded'),
      v.literal('failed'),
      v.literal('cancelled'),
      v.literal('refunded')
    ),
    stripeChargeId: v.optional(v.string()),
  },
  handler: async (ctx, { paymentId, ...updates }) => {
    await ctx.db.patch(paymentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

/**
 * Update subscription status
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const updateSubscriptionStatus = mutation({
  args: {
    paymentId: v.id('clientPayments'),
    subscription_status: v.union(
      v.literal('active'),
      v.literal('past_due'),
      v.literal('cancelled'),
      v.literal('unpaid')
    ),
    subscription_current_period_end: v.optional(v.number()),
  },
  handler: async (ctx, { paymentId, ...updates }) => {
    await ctx.db.patch(paymentId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

/**
 * Mark payment as refunded
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const markPaymentRefunded = mutation({
  args: {
    paymentId: v.id('clientPayments'),
    refund_amount: v.number(),
  },
  handler: async (ctx, { paymentId, refund_amount }) => {
    await ctx.db.patch(paymentId, {
      status: 'refunded',
      refunded: true,
      refund_amount,
      refund_date: Date.now(),
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

/**
 * Update payment by Stripe payment intent ID
 * 🔒 Authentication: Not required (webhook-triggered)
 */
export const updatePaymentByStripeId = mutation({
  args: {
    stripePaymentIntentId: v.string(),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('processing'),
        v.literal('succeeded'),
        v.literal('failed'),
        v.literal('cancelled'),
        v.literal('refunded')
      )
    ),
    stripeChargeId: v.optional(v.string()),
  },
  handler: async (ctx, { stripePaymentIntentId, ...updates }) => {
    const payment = await ctx.db
      .query('clientPayments')
      .withIndex('by_stripe_payment_intent_id', (q) =>
        q.eq('stripePaymentIntentId', stripePaymentIntentId)
      )
      .first();

    if (!payment) {
      throw new Error(`Payment not found for intent: ${stripePaymentIntentId}`);
    }

    await ctx.db.patch(payment._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return payment._id;
  },
});

// ============================================
// Event Mutations
// ============================================

/**
 * Log a Connect event
 * 🔒 Authentication: Not required (internal use)
 */
export const logConnectEvent = mutation({
  args: {
    connectedAccountId: v.optional(v.id('connectedAccounts')),
    paymentId: v.optional(v.id('clientPayments')),
    eventType: v.union(
      v.literal('account_created'),
      v.literal('account_updated'),
      v.literal('account_onboarded'),
      v.literal('payment_created'),
      v.literal('payment_succeeded'),
      v.literal('payment_failed'),
      v.literal('subscription_created'),
      v.literal('subscription_updated'),
      v.literal('subscription_cancelled'),
      v.literal('refund_created'),
      v.literal('webhook_received'),
      v.literal('api_error'),
      v.literal('other')
    ),
    stripeEventId: v.optional(v.string()),
    eventData: v.optional(v.any()),
    source: v.union(v.literal('stripe_webhook'), v.literal('api_call'), v.literal('manual')),
    processed: v.optional(v.boolean()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert('connectEvents', {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return eventId;
  },
});

/**
 * Mark event as processed
 * 🔒 Authentication: Not required (internal use)
 */
export const markEventProcessed = mutation({
  args: {
    eventId: v.id('connectEvents'),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { eventId, error }) => {
    await ctx.db.patch(eventId, {
      processed: true,
      error,
    });

    return eventId;
  },
});

// ============================================
// Batch Operations
// ============================================

/**
 * Sync account from Stripe (full update)
 * 🔒 Authentication: Not required (internal use)
 */
export const syncAccountFromStripe = mutation({
  args: {
    accountId: v.id('connectedAccounts'),
    stripeAccountData: v.any(),
  },
  handler: async (ctx, { accountId, stripeAccountData }) => {
    const account = stripeAccountData;

    let status: 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled' = 'pending';

    if (account.charges_enabled && account.payouts_enabled) {
      status = 'active';
    } else if (account.details_submitted) {
      status = 'onboarding';
    } else if (account.requirements?.disabled_reason) {
      status = 'restricted';
    }

    await ctx.db.patch(accountId, {
      accountStatus: status,
      charges_enabled: account.charges_enabled || false,
      payouts_enabled: account.payouts_enabled || false,
      details_submitted: account.details_submitted || false,
      onboarding_completed: account.charges_enabled && account.payouts_enabled,
      capabilities: {
        card_payments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
      },
      statement_descriptor: account.settings?.payments?.statement_descriptor || undefined,
      default_currency: account.default_currency || undefined,
      updatedAt: Date.now(),
    });

    // Log sync event
    await ctx.db.insert('connectEvents', {
      connectedAccountId: accountId,
      eventType: 'account_updated',
      source: 'api_call',
      processed: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return accountId;
  },
});