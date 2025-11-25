// convex/lib/system/supporting/exchangeRates.ts
// Supporting module: exchange rates (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.exchangeRates:view',
  CREATE: 'supporting.exchangeRates:create',
  EDIT: 'supporting.exchangeRates:edit',
  DELETE: 'supporting.exchangeRates:delete',
} as const;

export const listExchangeRates = query({
  args: {
    fromCurrency: v.optional(exchangeRatesValidators.currency),
    toCurrency: v.optional(exchangeRatesValidators.currency),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCurrentUser(ctx);
    const limit = Math.min(args.limit ?? 50, 100);

    let q = ctx.db.query('exchangeRates').filter(notDeleted);
    if (args.fromCurrency && args.toCurrency) {
      q = q.withIndex('by_currency_pair', (idx) =>
        idx.eq('fromCurrency', args.fromCurrency!).eq('toCurrency', args.toCurrency!)
      );
    }

    const page = await q.order('desc').paginate({ numItems: limit, cursor: args.cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const upsertExchangeRate = mutation({
  args: {
    fromCurrency: exchangeRatesValidators.currency,
    toCurrency: exchangeRatesValidators.currency,
    rate: v.number(),
    date: v.number(),
    source: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query('exchangeRates')
      .withIndex('by_currency_pair', (idx) =>
        idx.eq('fromCurrency', args.fromCurrency).eq('toCurrency', args.toCurrency)
      )
      .filter((q) => q.eq(q.field('date'), args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rate: args.rate,
        source: args.source,
        isActive: args.isActive,
        updatedAt: now,
        updatedBy: user._id,
      });
      return existing._id;
    }

    const publicId = await generateUniquePublicId(ctx, 'exchangeRates');
    return await ctx.db.insert('exchangeRates', {
      publicId,
      ownerId: user._id,
      name: `${args.fromCurrency}/${args.toCurrency}`,
      fromCurrency: args.fromCurrency,
      toCurrency: args.toCurrency,
      rate: args.rate,
      date: args.date,
      source: args.source,
      isActive: args.isActive,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});
