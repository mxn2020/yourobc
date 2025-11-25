// convex/lib/system/supporting/inquiry_sources/mutations.ts
// Write operations for system inquiry sources

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { inquirySourcesValidators } from '@/schema/system/supporting/inquiry_sources/validators';
import { SYSTEM_INQUIRY_SOURCES_CONSTANTS } from './constants';
import {
  trimSystemInquirySourceData,
  validateSystemInquirySourceData,
} from './utils';
import {
  requireDeleteSystemInquirySourceAccess,
  requireEditSystemInquirySourceAccess,
} from './permissions';

export const createSystemInquirySource = mutation({
  args: {
    data: v.object({
      name: v.string(),
      code: v.string(),
      type: inquirySourcesValidators.sourceType,
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);
    const trimmed = trimSystemInquirySourceData(data);
    const errors = validateSystemInquirySourceData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'inquirySources');

    const id = await ctx.db.insert('inquirySources', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      isActive: trimmed.isActive ?? SYSTEM_INQUIRY_SOURCES_CONSTANTS.DEFAULTS.IS_ACTIVE,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.inquiry_sources.created',
      entityType: 'inquirySources',
      entityId: publicId,
      entityTitle: trimmed.name,
      description: 'Created inquiry source',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const updateSystemInquirySource = mutation({
  args: {
    id: v.id('inquirySources'),
    updates: v.object({
      name: v.optional(v.string()),
      code: v.optional(v.string()),
      type: v.optional(inquirySourcesValidators.sourceType),
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    await requireEditSystemInquirySourceAccess(ctx, existing, user);

    const trimmed = trimSystemInquirySourceData(updates);
    const errors = validateSystemInquirySourceData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    });

    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'system.inquiry_sources.updated',
      entityType: 'inquirySources',
      entityId: existing.publicId,
      entityTitle: trimmed.name || existing.name,
      description: 'Updated inquiry source',
      metadata: { updates: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

export const deleteSystemInquirySource = mutation({
  args: { id: v.id('inquirySources') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    await requireDeleteSystemInquirySourceAccess(existing, user);

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
      action: 'system.inquiry_sources.deleted',
      entityType: 'inquirySources',
      entityId: existing.publicId,
      entityTitle: existing.name,
      description: 'Deleted inquiry source',
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return true;
  },
});
