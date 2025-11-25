// convex/lib/system/supporting/inquirySources.ts
// Supporting module: inquiry sources (template-compliant minimal implementation)

import { query, mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { notDeleted } from '@/shared/db.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { supportingValidators } from '@/schema/system/supporting/validators';

const PERMISSIONS = {
  VIEW: 'supporting.inquirySources:view',
  CREATE: 'supporting.inquirySources:create',
  EDIT: 'supporting.inquirySources:edit',
  DELETE: 'supporting.inquirySources:delete',
} as const;

export const listInquirySources = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, cursor }) => {
    await requireCurrentUser(ctx);
    const page = await ctx.db
      .query('inquirySources')
      .filter(notDeleted)
      .order('desc')
      .paginate({ numItems: Math.min(limit, 100), cursor: cursor ?? null });

    return { items: page.page, cursor: page.continueCursor, hasMore: !page.isDone };
  },
});

export const createInquirySource = mutation({
  args: {
    name: v.string(),
    code: v.optional(v.string()),
    type: supportingValidators.inquirySourceType,
    description: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'inquirySources');

    return await ctx.db.insert('inquirySources', {
      publicId,
      ownerId: user._id,
      name: args.name.trim(),
      code: args.code?.trim(),
      type: args.type,
      description: args.description?.trim(),
      isActive: args.isActive,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
  },
});
