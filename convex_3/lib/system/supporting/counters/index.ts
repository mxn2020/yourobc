// convex/lib/system/supporting/counters.ts
// Supporting module: counters (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.counters:view',
  CREATE: 'supporting.counters:create',
  EDIT: 'supporting.counters:edit',
  DELETE: 'supporting.counters:delete',
} as const;

export const listCounters = query({
  args: { limit: v.optional(v.number()), cursor: v.optional(v.string()) },
  handler: async (ctx, { limit = 50, cursor }) => {
    await requireCurrentUser(ctx);
    const page = await ctx.db
      .query('counters')
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });
    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const incrementCounter = mutation({
  args: { type: supportingValidators.counterType, prefix: v.string(), year: v.number() },
  handler: async (ctx, { type, prefix, year }) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query('counters')
      .withIndex('by_type_year', (idx) => idx.eq('type', type).eq('year', year))
      .filter(notDeleted)
      .first();

    if (existing) {
      const nextNumber = existing.lastNumber + 1;
      await ctx.db.patch(existing._id, {
        lastNumber: nextNumber,
        updatedAt: now,
        updatedBy: user._id,
      });
      return `${prefix}${year}-${nextNumber}`;
    }

    const publicId = await generateUniquePublicId(ctx, 'counters');
    const initialNumber = 1;
    await ctx.db.insert('counters', {
      publicId,
      ownerId: user._id,
      name: `${type}-${year}`,
      type,
      prefix: prefix.trim(),
      year,
      lastNumber: initialNumber,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    return `${prefix}${year}-${initialNumber}`;
  },
});
