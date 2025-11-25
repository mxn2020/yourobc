// convex/lib/yourobc/supporting/exchange_rates/mutations.ts
// Write operations for exchange rates module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { exchangeRatesValidators } from '@/schema/yourobc/supporting/exchange_rates/validators';
import { EXCHANGE_RATES_CONSTANTS } from './constants';
import { trimExchangeRateData, validateExchangeRateData } from './utils';
import { requireEditExchangeRatesAccess, requireDeleteExchangeRatesAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create new exchange rate
 */
export const createExchangeRate = mutation({
  args: {
    data: v.object({
      fromCurrency: exchangeRatesValidators.currency,
      toCurrency: exchangeRatesValidators.currency,
      rate: v.number(),
      date: v.number(),
      source: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimExchangeRateData(data);
    const errors = validateExchangeRateData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Insert record
    const id = await ctx.db.insert('yourobcExchangeRates', {
      ...trimmed,
      isActive: trimmed.isActive ?? EXCHANGE_RATES_CONSTANTS.DEFAULTS.IS_ACTIVE,
      source: trimmed.source ?? EXCHANGE_RATES_CONSTANTS.DEFAULTS.SOURCE,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'exchange_rates.created',
      entityType: 'yourobcExchangeRates',
      entityId: trimmed.fromCurrency,
      entityTitle: `${trimmed.fromCurrency} to ${trimmed.toCurrency}`,
      description: `Created exchange rate: ${trimmed.fromCurrency} to ${trimmed.toCurrency} at ${trimmed.rate}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing exchange rate
 */
export const updateExchangeRate = mutation({
  args: {
    id: v.id('yourobcExchangeRates'),
    updates: v.object({
      rate: v.optional(v.number()),
      source: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    // Check permissions
    await requireEditExchangeRatesAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimExchangeRateData(updates);
    const errors = validateExchangeRateData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Update record
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'exchange_rates.updated',
      entityType: 'yourobcExchangeRates',
      entityId: existing.fromCurrency,
      entityTitle: `${existing.fromCurrency} to ${existing.toCurrency}`,
      description: `Updated exchange rate: ${existing.fromCurrency} to ${existing.toCurrency}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete an exchange rate
 */
export const deleteExchangeRate = mutation({
  args: { id: v.id('yourobcExchangeRates') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    // Check permissions
    await requireDeleteExchangeRatesAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'exchange_rates.deleted',
      entityType: 'yourobcExchangeRates',
      entityId: existing.fromCurrency,
      entityTitle: `${existing.fromCurrency} to ${existing.toCurrency}`,
      description: `Deleted exchange rate: ${existing.fromCurrency} to ${existing.toCurrency}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
