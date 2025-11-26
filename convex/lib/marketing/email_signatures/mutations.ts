// convex/lib/marketing/email_signatures/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { EMAIL_SIGNATURE_CONSTANTS } from './constants';
import { validateEmailSignatureData, generateSignatureHTML } from './utils';
import { requireEditAccess, requireDeleteAccess } from './permissions';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { statusTypes } from '@/schema/base';
import { emailSignaturesValidators } from '@/schema/marketing/email_signatures/validators';

/**
 * Create a new email signature
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'email_signature.create' permission
 */
export const createEmailSignature = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      fullName: v.string(),
      jobTitle: v.optional(v.string()),
      company: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      template: v.optional(v.string()),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }): Promise<{ _id: string; publicId: string }> => {
    // 🔒 Authenticate & check permission
    const user = await requirePermission(
      ctx,
      EMAIL_SIGNATURE_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // Validate input
    const errors = validateEmailSignatureData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'marketingEmailSignatures');

    const now = Date.now();
    const signatureData = {
      publicId,
      ownerId: user._id,
      title: data.title.trim(),
      description: data.description?.trim(),
      fullName: data.fullName.trim(),
      jobTitle: data.jobTitle?.trim(),
      company: data.company?.trim(),
      email: data.email?.trim(),
      phone: data.phone?.trim(),
      website: data.website?.trim(),
      template: data.template,
      status: EMAIL_SIGNATURE_CONSTANTS.STATUS.ACTIVE,
      priority: data.priority || EMAIL_SIGNATURE_CONSTANTS.PRIORITY.MEDIUM,
      visibility: data.visibility || EMAIL_SIGNATURE_CONSTANTS.VISIBILITY.PRIVATE,
      lastActivityAt: now,
      tags: data.tags || [],
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    };

    const signatureId = await ctx.db.insert('marketingEmailSignatures', signatureData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'email_signature.created',
      entityType: 'system_marketing_email_signature',
      entityId: publicId,
      entityTitle: data.title,
      description: `Created email signature '${data.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: signatureId, publicId };
  },
});

/**
 * Update an existing email signature
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const updateEmailSignature = mutation({
  args: {
    signatureId: v.id('marketingEmailSignatures'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      fullName: v.optional(v.string()),
      jobTitle: v.optional(v.string()),
      company: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      status: v.optional(emailSignaturesValidators.status),
      priority: v.optional(statusTypes.priority),
      visibility: v.optional(
        v.union(v.literal('private'), v.literal('team'), v.literal('public'))
      ),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { signatureId, updates }) => {
    const user = await requireCurrentUser(ctx);

    const signature = await ctx.db.get(signatureId);
    if (!signature || signature.deletedAt) {
      throw new Error('Signature not found');
    }

    await requireEditAccess(ctx, signature, user);

    // Validate
    const errors = validateEmailSignatureData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    await ctx.db.patch(signatureId, {
      ...updates,
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'email_signature.updated',
      entityType: 'system_marketing_email_signature',
      entityId: signature.publicId,
      entityTitle: signature.title,
      description: `Updated email signature '${signature.title}'`,
      metadata: {
        source: 'email_signature.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: signatureId, publicId: signature.publicId };
  },
});

/**
 * Delete an email signature
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must be owner or admin
 */
export const deleteEmailSignature = mutation({
  args: {
    signatureId: v.id('marketingEmailSignatures'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { signatureId, hardDelete = false }) => {
    const user = await requireCurrentUser(ctx);

    const signature = await ctx.db.get(signatureId);
    if (!signature) {
      throw new Error('Signature not found');
    }

    requireDeleteAccess(signature, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      await ctx.db.delete(signatureId);
    } else {
      await ctx.db.patch(signatureId, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
        updatedBy: user._id,
        lastActivityAt: now,
      });
    }

    // Audit log
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: hardDelete ? 'email_signature.hard_deleted' : 'email_signature.deleted',
      entityType: 'system_marketing_email_signature',
      entityId: signature.publicId,
      entityTitle: signature.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} email signature '${signature.title}'`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return { _id: signatureId, publicId: signature.publicId };
  },
});
