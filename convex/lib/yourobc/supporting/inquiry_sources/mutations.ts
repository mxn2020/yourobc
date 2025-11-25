// convex/lib/yourobc/supporting/inquiry_sources/mutations.ts
// Write operations for inquiry sources module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { inquirySourcesValidators } from '@/schema/yourobc/supporting/inquiry_sources/validators';
import { INQUIRY_SOURCES_CONSTANTS } from './constants';
import { trimInquirySourceData, validateInquirySourceData, generateInquirySourceCode } from './utils';
import { requireEditInquirySourcesAccess, requireDeleteInquirySourcesAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';

/**
 * Create new inquiry source
 */
export const createInquirySource = mutation({
  args: {
    data: v.object({
      name: v.string(),
      code: v.optional(v.string()),
      type: inquirySourcesValidators.sourceType,
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimInquirySourceData(data);
    const errors = validateInquirySourceData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Generate code if not provided
    const code = trimmed.code || generateInquirySourceCode(trimmed.name);

    // Insert record
    const id = await ctx.db.insert('yourobcInquirySources', {
      name: trimmed.name,
      code,
      type: trimmed.type,
      description: trimmed.description,
      isActive: trimmed.isActive ?? INQUIRY_SOURCES_CONSTANTS.DEFAULTS.IS_ACTIVE,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'inquiry_sources.created',
      entityType: 'yourobcInquirySources',
      entityId: code,
      entityTitle: trimmed.name,
      description: `Created inquiry source: ${trimmed.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Update an existing inquiry source
 */
export const updateInquirySource = mutation({
  args: {
    id: v.id('yourobcInquirySources'),
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

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    // Check permissions
    await requireEditInquirySourcesAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimInquirySourceData(updates);
    const errors = validateInquirySourceData(trimmed);
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
      action: 'inquiry_sources.updated',
      entityType: 'yourobcInquirySources',
      entityId: existing.code,
      entityTitle: existing.name,
      description: `Updated inquiry source: ${existing.name}`,
      metadata: { data: { changes: trimmed } },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Soft delete an inquiry source
 */
export const deleteInquirySource = mutation({
  args: { id: v.id('yourobcInquirySources') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    // Fetch and check existence
    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Inquiry source not found');
    }

    // Check permissions
    await requireDeleteInquirySourcesAccess(existing, user);

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
      action: 'inquiry_sources.deleted',
      entityType: 'yourobcInquirySources',
      entityId: existing.code,
      entityTitle: existing.name,
      description: `Deleted inquiry source: ${existing.name}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});
