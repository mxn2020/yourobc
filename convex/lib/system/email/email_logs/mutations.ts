// convex/lib/system/email/email_logs/mutations.ts
// Write operations for email logs module

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { emailValidators, emailFields } from '@/schema/system/email/validators';
import { EMAIL_LOGS_CONSTANTS } from './constants';
import { trimEmailAddresses, truncatePreview, validateEmailLogData } from './utils';
import { requireDeleteEmailLogAccess } from './permissions';

// ============================================================================
// Email Log Mutations
// ============================================================================

/**
 * Log an email send
 * 🔒 Authentication: Required
 * 🔒 Authorization: Users can log emails they trigger, admins can log any
 */
export const logEmail = mutation({
  args: {
    provider: emailValidators.provider,
    to: v.array(v.string()),
    from: v.string(),
    replyTo: v.optional(v.string()),
    subject: v.string(),
    htmlPreview: v.optional(v.string()),
    textPreview: v.optional(v.string()),
    templateId: v.optional(v.id('emailTemplates')),
    templateData: v.optional(v.any()),
    deliveryStatus: emailValidators.deliveryStatus,
    messageId: v.optional(v.string()),
    error: v.optional(v.string()),
    providerResponse: v.optional(v.any()),
    context: v.optional(v.string()),
    triggeredBy: v.optional(v.id('userProfiles')),
    metadata: v.optional(emailFields.logMetadata),
  },
  handler: async (ctx, args) => {
    // 1. AUTH: Require authentication
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Require permission to create email logs
    await requirePermission(ctx, EMAIL_LOGS_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Trim string fields
    const trimmedTo = trimEmailAddresses(args.to);
    const trimmedFrom = args.from.trim();
    const trimmedReplyTo = args.replyTo?.trim();
    const trimmedSubject = args.subject.trim();
    const trimmedMessageId = args.messageId?.trim();
    const trimmedError = args.error?.trim();
    const trimmedContext = args.context?.trim();

    // Validate trimmed data
    const validationData = {
      provider: args.provider,
      to: trimmedTo,
      from: trimmedFrom,
      replyTo: trimmedReplyTo,
      subject: trimmedSubject,
      status: args.deliveryStatus,
      messageId: trimmedMessageId,
      error: trimmedError,
    };
    const errors = validateEmailLogData(validationData as any);
    if (errors.length) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    // 4. PROCESS: Generate publicId and truncate HTML/text previews
    const publicId = await generateUniquePublicId(ctx, 'emailLogs');
    const htmlPreview = truncatePreview(args.htmlPreview);
    const textPreview = truncatePreview(args.textPreview);

    // Determine status-specific timestamps
    const statusValue = args.deliveryStatus ?? 'pending';
    const sentAt = statusValue === 'sent' || statusValue === 'delivered' ? now : undefined;
    const failedAt = statusValue === 'failed' ? now : undefined;

    // 5. CREATE: Insert email log
    const logId = await ctx.db.insert('emailLogs', {
      // Required fields
      publicId,
      userId: user._id,
      subject: trimmedSubject,

      // Email details
      provider: args.provider,
      to: trimmedTo,
      from: trimmedFrom,
      replyTo: trimmedReplyTo,
      htmlPreview,
      textPreview,
      templateId: args.templateId,
      templateData: args.templateData,
      deliveryStatus: statusValue,
      messageId: trimmedMessageId,
      error: trimmedError,
      providerResponse: args.providerResponse,
      sentAt,
      failedAt,
      triggeredBy: args.triggeredBy ?? user._id,
      context: trimmedContext,
      metadata: args.metadata,

      // Audit fields
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    });

    // 6. AUDIT: Log the email log creation
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'email_log.created',
      entityType: 'emailLogs',
      entityId: publicId,
      entityTitle: trimmedSubject,
      description: `Logged email to ${trimmedTo.join(', ')}: ${trimmedSubject}`,
      metadata: {
        data: {
          provider: args.provider,
          status: statusValue,
          context: trimmedContext || 'none',
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return log ID
    return logId;
  },
});

/**
 * Update email log status
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admins or user who triggered the email
 *
 * Note: For webhook-only status updates, create a separate internal mutation
 */
export const updateEmailStatus = mutation({
  args: {
    messageId: v.string(),
    deliveryStatus: emailValidators.deliveryStatus,
    error: v.optional(v.string()),
    providerResponse: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. AUTH: Require authentication
    const user = await requireCurrentUser(ctx);

    // 2. VALIDATE: Trim string fields
    const trimmedMessageId = args.messageId.trim();
    const trimmedError = args.error?.trim();

    // 3. FETCH: Find email log by message ID
    const log = await ctx.db
      .query('emailLogs')
      .withIndex('by_message_id', q => q.eq('messageId', trimmedMessageId))
      .first();

    if (!log) {
      throw new Error('Email log not found');
    }

    if (log.deletedAt) {
      throw new Error('Cannot update deleted email log');
    }

    // 4. AUTHZ: Check if user can update this log
    // Admins can update any, users can only update their own
    const canUpdate =
      user.role === 'admin' ||
      user.role === 'superadmin' ||
      log.triggeredBy === user._id;

    if (!canUpdate) {
      throw new Error('Permission denied: Cannot update this email log');
    }

    const now = Date.now();

    // 5. PROCESS: Build updates object
    const updates: any = {
      deliveryStatus: args.deliveryStatus ?? 'pending',
      updatedAt: now,
      updatedBy: user._id,
      lastActivityAt: now,
    };

    const statusValue = args.deliveryStatus ?? 'pending';
    if (statusValue === 'delivered') {
      updates.deliveredAt = now;
    } else if (statusValue === 'failed' || statusValue === 'bounced') {
      updates.failedAt = now;
      updates.error = trimmedError;
    }

    if (args.providerResponse) {
      updates.providerResponse = args.providerResponse;
    }

    // 6. UPDATE: Update email log
    await ctx.db.patch(log._id, updates);

    // 7. AUDIT: Log the status update
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'email_log.updated',
      entityType: 'emailLogs',
      entityId: log.publicId,
      entityTitle: log.subject,
      description: `Updated email status to ${statusValue}: ${log.subject}`,
      metadata: {
        data: {
          oldStatus: log.deliveryStatus,
          newStatus: statusValue,
          error: trimmedError || 'none',
        }
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return success
    return { success: true };
  },
});

/**
 * Soft delete an email log
 * 🔒 Authentication: Required
 * 🔒 Authorization: Superadmin only (email logs are audit records)
 */
export const deleteEmailLog = mutation({
  args: {
    logId: v.id('emailLogs'),
  },
  handler: async (ctx, { logId }) => {
    // 1. AUTH: Require authentication
    const user = await requireCurrentUser(ctx);

    // 2. FETCH: Get the email log
    const log = await ctx.db.get(logId);
    if (!log) {
      throw new Error('Email log not found');
    }

    if (log.deletedAt) {
      throw new Error('Email log already deleted');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteEmailLogAccess(log, user);

    const now = Date.now();

    // 4. DELETE: Soft delete the log
    await ctx.db.patch(logId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Log the deletion
    await ctx.db.insert('auditLogs', {
      publicId: await generateUniquePublicId(ctx, 'auditLogs'),
      userId: user._id,
      userName: user.name || user.email || 'Unknown',
      action: 'email_log.deleted',
      entityType: 'emailLogs',
      entityId: log.publicId,
      entityTitle: log.subject,
      description: `Deleted email log: ${log.subject}`,
      metadata: {
        data: {
          provider: log.provider,
          to: log.to,
          status: log.deliveryStatus,
          context: log.context || 'none',
        },
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return success
    return { success: true };
  },
});
