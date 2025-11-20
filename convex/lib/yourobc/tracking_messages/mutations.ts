// convex/lib/yourobc/tracking_messages/mutations.ts
// convex/lib/yourobc/trackingMessages/mutations.ts

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { TRACKING_MESSAGE_CONSTANTS } from './constants';
import { validateTrackingMessageData, sanitizeTemplate } from './utils';
import { quoteServiceTypeValidator, languageValidator, messageCategoryValidator } from '../../../schema/yourobc/base';

/**
 * Create a new tracking message template
 */
export const createTrackingMessage = mutation({
  args: {
    authUserId: v.string(),
    name: v.string(),
    serviceType: quoteServiceTypeValidator,
    status: v.union(
      v.literal('quoted'),
      v.literal('booked'),
      v.literal('pickup'),
      v.literal('in_transit'),
      v.literal('delivered'),
      v.literal('customs'),
      v.literal('document'),
      v.literal('invoiced'),
      v.literal('cancelled')
    ),
    language: languageValidator,
    subject: v.optional(v.string()),
    template: v.string(),
    variables: v.array(v.string()),
    category: v.optional(messageCategoryValidator),
    isActive: v.boolean(),
  },
  handler: async (ctx, { authUserId, ...args }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.CREATE);

    const errors = validateTrackingMessageData({ template: args.template, subject: args.subject });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();

    const messageId = await ctx.db.insert('yourobcTrackingMessages', {
      name: args.name,
      serviceType: args.serviceType,
      status: args.status,
      language: args.language,
      subject: args.subject?.trim(),
      template: sanitizeTemplate(args.template),
      variables: args.variables,
      category: args.category,
      isActive: args.isActive,
      ownerId: authUserId,
      tags: [],
      createdBy: authUserId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.created',
      entityType: 'yourobc_tracking_message',
      entityId: messageId,
      entityTitle: `${args.serviceType} - ${args.status} (${args.language})`,
      description: `Created tracking message template for ${args.serviceType} - ${args.status}`,
      createdAt: now,
    });

    return messageId;
  },
});

/**
 * Update an existing tracking message template
 */
export const updateTrackingMessage = mutation({
  args: {
    authUserId: v.string(),
    messageId: v.id('yourobcTrackingMessages'),
    name: v.optional(v.string()),
    serviceType: v.optional(v.union(v.literal('OBC'), v.literal('NFO'))),
    status: v.optional(v.union(
      v.literal('quoted'),
      v.literal('booked'),
      v.literal('pickup'),
      v.literal('in_transit'),
      v.literal('delivered'),
      v.literal('customs'),
      v.literal('document'),
      v.literal('invoiced'),
      v.literal('cancelled')
    )),
    language: v.optional(v.union(v.literal('en'), v.literal('de'))),
    subject: v.optional(v.string()),
    template: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
    category: v.optional(messageCategoryValidator),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { authUserId, messageId, ...updates }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.EDIT);

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Tracking message template not found');
    }

    const errors = validateTrackingMessageData({
      template: updates.template,
      subject: updates.subject
    });
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.subject) updateData.subject = updates.subject.trim();
    if (updates.template) updateData.template = sanitizeTemplate(updates.template);

    await ctx.db.patch(messageId, updateData);

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.updated',
      entityType: 'yourobc_tracking_message',
      entityId: messageId,
      entityTitle: `${message.serviceType} - ${message.status} (${message.language})`,
      description: `Updated tracking message template for ${message.serviceType} - ${message.status}`,
      createdAt: now,
    });

    return messageId;
  },
});

/**
 * Delete a tracking message template
 */
export const deleteTrackingMessage = mutation({
  args: {
    authUserId: v.string(),
    messageId: v.id('yourobcTrackingMessages'),
  },
  handler: async (ctx, { authUserId, messageId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.DELETE);

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Tracking message template not found');
    }

    const now = Date.now();
    // Soft delete: mark as deleted instead of removing
    await ctx.db.patch(messageId, {
      deletedAt: now,
      deletedBy: authUserId,
    });
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.deleted',
      entityType: 'yourobc_tracking_message',
      entityId: messageId,
      entityTitle: `${message.serviceType} - ${message.status} (${message.language})`,
      description: `Deleted tracking message template for ${message.serviceType} - ${message.status}`,
      createdAt: now,
    });

    return messageId;
  },
});

/**
 * Toggle active status
 */
export const toggleTrackingMessageActive = mutation({
  args: {
    authUserId: v.string(),
    messageId: v.id('yourobcTrackingMessages'),
  },
  handler: async (ctx, { authUserId, messageId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.EDIT);

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Tracking message template not found');
    }

    const now = Date.now();
    const newActiveStatus = !message.isActive;

    await ctx.db.patch(messageId, {
      isActive: newActiveStatus,
      updatedAt: now,
    });

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.toggled',
      entityType: 'yourobc_tracking_message',
      entityId: messageId,
      entityTitle: `${message.serviceType} - ${message.status} (${message.language})`,
      description: `${newActiveStatus ? 'Activated' : 'Deactivated'} tracking message template`,
      createdAt: now,
    });

    return messageId;
  },
});

/**
 * Initialize default templates (run once on setup)
 */
export const initializeDefaultTemplates = mutation({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    const user = await requireCurrentUser(ctx, authUserId);
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.CREATE);

    // Import default templates
    const { DEFAULT_TEMPLATES } = await import('./defaultTemplates');
    const now = Date.now();
    const createdIds: string[] = [];

    for (const template of DEFAULT_TEMPLATES) {
      const messageId = await ctx.db.insert('yourobcTrackingMessages', {
        ...template,
        name: `${template.serviceType} - ${template.status} (${template.language})`,
        isActive: true,
        ownerId: authUserId,
        tags: [],
        createdBy: authUserId,
        isOfficial: true,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(messageId);
    }

    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: authUserId,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_messages.initialized',
      entityType: 'yourobc_tracking_message',
      entityId: createdIds[0] || '', // Reference first template
      entityTitle: `${createdIds.length} default templates`,
      description: `Initialized ${createdIds.length} default tracking message templates`,
      createdAt: now,
    });

    return {
      count: createdIds.length,
      ids: createdIds,
    };
  },
});
