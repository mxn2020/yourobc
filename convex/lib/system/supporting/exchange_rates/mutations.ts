// convex/lib/system/supporting/exchange_rates/mutations.ts
// Write operations for system exchange rates

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { exchangeRatesValidators } from '@/schema/system/supporting/exchange_rates/validators';
import { SYSTEM_EXCHANGE_RATES_CONSTANTS } from './constants';
import {
  trimSystemExchangeRateData,
  validateSystemExchangeRateData,
  deriveInverseRate,
} from './utils';
import {
  requireDeleteSystemExchangeRateAccess,
  requireEditSystemExchangeRateAccess,
} from './permissions';

export const createSystemExchangeRate = mutation({
  args: {
    data: v.object({
      name: v.optional(v.string()),
      fromCurrency: exchangeRatesValidators.currency,
      toCurrency: exchangeRatesValidators.currency,
      rate: v.number(),
      inverseRate: v.optional(v.number()),
      validFrom: v.number(),
      validTo: v.optional(v.number()),
      source: v.optional(v.string()),
      isAutomatic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemExchangeRateData(data);
    const errors = validateSystemExchangeRateData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'exchangeRates');

    const rate = trimmed.rate;
    const inverseRate = deriveInverseRate(rate, trimmed.inverseRate);
    const name = trimmed.name?.trim() || `${trimmed.fromCurrency}/${trimmed.toCurrency}`;

    const id = await ctx.db.insert('exchangeRates', {
      name,
      publicId,
      ownerId: user._id,
      fromCurrency: trimmed.fromCurrency,
      toCurrency: trimmed.toCurrency,
      rate,
      inverseRate,
      validFrom: trimmed.validFrom,
      validTo: trimmed.validTo,
      source: trimmed.source,
      isAutomatic: trimmed.isAutomatic ?? SYSTEM_EXCHANGE_RATES_CONSTANTS.DEFAULTS.IS_AUTOMATIC,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.exchange_rates.created',
      entityType: 'exchangeRates',
      entityId: publicId,
      entityTitle: name,
      description: `Created exchange rate ${trimmed.fromCurrency}/${trimmed.toCurrency}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemExchangeRate = mutation({
  args: {
    id: v.id('exchangeRates'),
    updates: v.object({
      name: v.optional(v.string()),
      rate: v.optional(v.number()),
      inverseRate: v.optional(v.number()),
      validFrom: v.optional(v.number()),
      validTo: v.optional(v.number()),
      source: v.optional(v.string()),
      isAutomatic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    await requireEditSystemExchangeRateAccess(ctx, existing, user);

    const trimmed = trimSystemExchangeRateData(updates);
    const errors = validateSystemExchangeRateData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const nextRate = trimmed.rate ?? existing.rate;
    const nextInverseRate = deriveInverseRate(nextRate, trimmed.inverseRate ?? existing.inverseRate);

    await ctx.db.patch(id, {
      ...trimmed,
      rate: nextRate,
      inverseRate: nextInverseRate,
      name: trimmed.name?.trim() || existing.name,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.exchange_rates.updated',
      entityType: 'exchangeRates',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: `Updated exchange rate ${existing.fromCurrency}/${existing.toCurrency}`,
      metadata: { updates: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteSystemExchangeRate = mutation({
  args: { id: v.id('exchangeRates') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Exchange rate not found');
    }

    await requireDeleteSystemExchangeRateAccess(existing, user);

    const now = Date.now();
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.exchange_rates.deleted',
      entityType: 'exchangeRates',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: `Deleted exchange rate ${existing.fromCurrency}/${existing.toCurrency}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
