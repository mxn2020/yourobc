// convex/lib/yourobc/supporting/inquiry_sources/mutations.ts
// convex/yourobc/supporting/inquirySources/mutations.ts
import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { validateInquirySourceData, generateSourceCode } from './utils';

export const createInquirySource = mutation({
  args: {
    authUserId: v.string(),
    data: v.object({
      name: v.string(),
      code: v.optional(v.string()),
      type: v.union(v.literal('website'), v.literal('referral'), v.literal('partner'), v.literal('advertising'), v.literal('direct')),
      description: v.optional(v.string()),
    })
  },
  handler: async (ctx, { authUserId, data }) => {
    await requireCurrentUser(ctx, authUserId);

    const errors = validateInquirySourceData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check for duplicate names
    const existingSource = await ctx.db
      .query('yourobcInquirySources')
      .filter((q) => q.eq(q.field('name'), data.name.trim()))
      .first();
    
    if (existingSource) {
      throw new Error('A source with this name already exists');
    }

    const now = Date.now();
    const code = data.code || generateSourceCode(data.name);

    const sourceData = {
      name: data.name.trim(),
      code,
      type: data.type,
      description: data.description?.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
    };

    return await ctx.db.insert('yourobcInquirySources', sourceData);
  },
});

export const updateInquirySource = mutation({
  args: {
    authUserId: v.string(),
    sourceId: v.id('yourobcInquirySources'),
    data: v.object({
      name: v.optional(v.string()),
      code: v.optional(v.string()),
      type: v.optional(v.union(v.literal('website'), v.literal('referral'), v.literal('partner'), v.literal('advertising'), v.literal('direct'))),
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, { authUserId, sourceId, data }) => {
    await requireCurrentUser(ctx, authUserId);
    
    const source = await ctx.db.get(sourceId);
    if (!source) {
      throw new Error('Inquiry source not found');
    }

    const errors = validateInquirySourceData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const updateData = {
      ...data,
      updatedAt: Date.now(),
    };

    if (data.name) {
      updateData.name = data.name.trim();
    }

    await ctx.db.patch(sourceId, updateData);
    return sourceId;
  },
});

