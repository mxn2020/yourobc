// convex/lib/yourobc/trackingMessages/mutations.ts
// Write operations for trackingMessages module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission, generateUniquePublicId } from '@/lib/auth.helper';
import { trackingMessagesValidators } from '@/schema/yourobc/trackingMessages/validators';
import { TRACKING_MESSAGES_CONSTANTS } from './constants';
import { validateTrackingMessageData, generateMessageId } from './utils';
import { requireEditTrackingMessageAccess, requireDeleteTrackingMessageAccess } from './permissions';
import type { TrackingMessageId } from './types';

/**
 * Create new tracking message
 */
export const createTrackingMessage = mutation({
  args: {
    data: v.object({
      messageId: v.optional(v.string()),
      subject: v.optional(v.string()),
      content: v.string(),
      status: v.optional(trackingMessagesValidators.status),
      messageType: trackingMessagesValidators.messageType,
      priority: v.optional(trackingMessagesValidators.priority),
      templateId: v.optional(v.string()),
      shipmentId: v.optional(v.id('yourobcShipments')),
      shipmentNumber: v.optional(v.string()),
      recipients: v.array(v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        name: v.optional(v.string()),
        userId: v.optional(v.id('userProfiles')),
      })),
      deliveryChannel: v.optional(trackingMessagesValidators.deliveryChannel),
      attachments: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        type: v.string(),
        size: v.optional(v.number()),
      }))),
      routingInfo: v.optional(v.object({
        origin: v.optional(v.string()),
        destination: v.optional(v.string()),
        currentLocation: v.optional(v.string()),
        estimatedDelivery: v.optional(v.number()),
      })),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { data }): Promise<TrackingMessageId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. AUTHZ: Check create permission
    await requirePermission(ctx, TRACKING_MESSAGES_CONSTANTS.PERMISSIONS.CREATE, {
      allowAdmin: true,
    });

    // 3. VALIDATE: Check data validity
    const errors = validateTrackingMessageData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 4. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'softwareYourObcTrackingMessages');
    const messageId = data.messageId?.trim() || generateMessageId();
    const now = Date.now();

    // 5. CREATE: Insert into database
    const trackingMessageId = await ctx.db.insert('softwareYourObcTrackingMessages', {
      publicId,
      messageId,
      subject: data.subject?.trim(),
      content: data.content.trim(),
      status: data.status || 'draft',
      messageType: data.messageType,
      priority: data.priority,
      templateId: data.templateId?.trim(),
      shipmentId: data.shipmentId,
      shipmentNumber: data.shipmentNumber?.trim(),
      recipients: data.recipients,
      deliveryChannel: data.deliveryChannel,
      attachments: data.attachments,
      routingInfo: data.routingInfo,
      tags: data.tags?.map(tag => tag.trim()),
      category: data.category?.trim(),
      ownerId: user._id,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // 6. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.created',
      entityType: 'system_tracking_message',
      entityId: publicId,
      entityTitle: messageId,
      description: `Created tracking message: ${messageId}`,
      metadata: {
        status: data.status || 'draft',
        messageType: data.messageType,
        recipientCount: data.recipients.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 7. RETURN: Return entity ID
    return trackingMessageId;
  },
});

/**
 * Update existing tracking message
 */
export const updateTrackingMessage = mutation({
  args: {
    messageId: v.id('softwareYourObcTrackingMessages'),
    updates: v.object({
      subject: v.optional(v.string()),
      content: v.optional(v.string()),
      status: v.optional(trackingMessagesValidators.status),
      messageType: v.optional(trackingMessagesValidators.messageType),
      priority: v.optional(trackingMessagesValidators.priority),
      recipients: v.optional(v.array(v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        name: v.optional(v.string()),
        userId: v.optional(v.id('userProfiles')),
      }))),
      deliveryChannel: v.optional(trackingMessagesValidators.deliveryChannel),
      attachments: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        url: v.string(),
        type: v.string(),
        size: v.optional(v.number()),
      }))),
      routingInfo: v.optional(v.object({
        origin: v.optional(v.string()),
        destination: v.optional(v.string()),
        currentLocation: v.optional(v.string()),
        estimatedDelivery: v.optional(v.number()),
      })),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { messageId, updates }): Promise<TrackingMessageId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const message = await ctx.db.get(messageId);
    if (!message || message.deletedAt) {
      throw new Error('Tracking message not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditTrackingMessageAccess(ctx, message, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateTrackingMessageData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.subject !== undefined) {
      updateData.subject = updates.subject?.trim();
    }
    if (updates.content !== undefined) {
      updateData.content = updates.content.trim();
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      // Auto-track status changes
      if (updates.status === 'sent' && !message.sentAt) {
        updateData.sentAt = now;
      }
      if (updates.status === 'delivered' && !message.deliveredAt) {
        updateData.deliveredAt = now;
      }
      if (updates.status === 'read' && !message.readAt) {
        updateData.readAt = now;
        updateData.readBy = user._id;
      }
    }
    if (updates.messageType !== undefined) {
      updateData.messageType = updates.messageType;
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.recipients !== undefined) {
      updateData.recipients = updates.recipients;
    }
    if (updates.deliveryChannel !== undefined) {
      updateData.deliveryChannel = updates.deliveryChannel;
    }
    if (updates.attachments !== undefined) {
      updateData.attachments = updates.attachments;
    }
    if (updates.routingInfo !== undefined) {
      updateData.routingInfo = updates.routingInfo;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map(tag => tag.trim());
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category?.trim();
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(messageId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.updated',
      entityType: 'system_tracking_message',
      entityId: message.publicId,
      entityTitle: message.messageId,
      description: `Updated tracking message: ${message.messageId}`,
      metadata: { changes: updates },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return messageId;
  },
});

/**
 * Delete tracking message (soft delete)
 */
export const deleteTrackingMessage = mutation({
  args: {
    messageId: v.id('softwareYourObcTrackingMessages'),
  },
  handler: async (ctx, { messageId }): Promise<TrackingMessageId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const message = await ctx.db.get(messageId);
    if (!message || message.deletedAt) {
      throw new Error('Tracking message not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteTrackingMessageAccess(message, user);

    // 4. SOFT DELETE: Mark as deleted
    const now = Date.now();
    await ctx.db.patch(messageId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.deleted',
      entityType: 'system_tracking_message',
      entityId: message.publicId,
      entityTitle: message.messageId,
      description: `Deleted tracking message: ${message.messageId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return messageId;
  },
});

/**
 * Restore soft-deleted tracking message
 */
export const restoreTrackingMessage = mutation({
  args: {
    messageId: v.id('softwareYourObcTrackingMessages'),
  },
  handler: async (ctx, { messageId }): Promise<TrackingMessageId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Tracking message not found');
    }
    if (!message.deletedAt) {
      throw new Error('Tracking message is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      message.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this tracking message');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(messageId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'tracking_message.restored',
      entityType: 'system_tracking_message',
      entityId: message.publicId,
      entityTitle: message.messageId,
      description: `Restored tracking message: ${message.messageId}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return messageId;
  },
});

/**
 * Mark tracking message as read
 */
export const markTrackingMessageAsRead = mutation({
  args: {
    messageId: v.id('softwareYourObcTrackingMessages'),
  },
  handler: async (ctx, { messageId }): Promise<TrackingMessageId> => {
    const user = await requireCurrentUser(ctx);

    const message = await ctx.db.get(messageId);
    if (!message || message.deletedAt) {
      throw new Error('Tracking message not found');
    }

    const now = Date.now();
    await ctx.db.patch(messageId, {
      status: 'read',
      readAt: now,
      readBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    return messageId;
  },
});
