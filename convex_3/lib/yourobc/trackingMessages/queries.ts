// convex/lib/yourobc/trackingMessages/queries.ts
// Read operations for trackingMessages module

import { query } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import {
  trackingMessagesValidators,
} from '@/schema/yourobc/trackingMessages/validators';
import { filterTrackingMessagesByAccess, requireViewTrackingMessageAccess } from './permissions';
import type { TrackingMessageListResponse } from './types';

/**
 * Get paginated list of tracking messages with filtering
 */
export const getTrackingMessages = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    filters: v.optional(v.object({
      status: v.optional(v.array(trackingMessagesValidators.status)),
      messageType: v.optional(v.array(trackingMessagesValidators.messageType)),
      priority: v.optional(v.array(trackingMessagesValidators.priority)),
      shipmentId: v.optional(v.id('yourobcShipments')),
      search: v.optional(v.string()),
      unreadOnly: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args): Promise<TrackingMessageListResponse> => {
    const user = await requireCurrentUser(ctx);
    const { limit = 50, offset = 0, filters = {} } = args;

    // Query with index
    let messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Apply access filtering
    messages = await filterTrackingMessagesByAccess(ctx, messages, user);

    // Apply status filter
    if (filters.status?.length) {
      messages = messages.filter(item =>
        filters.status!.includes(item.status)
      );
    }

    // Apply message type filter
    if (filters.messageType?.length) {
      messages = messages.filter(item =>
        filters.messageType!.includes(item.messageType)
      );
    }

    // Apply priority filter
    if (filters.priority?.length) {
      messages = messages.filter(item =>
        item.priority && filters.priority!.includes(item.priority)
      );
    }

    // Apply shipment filter
    if (filters.shipmentId) {
      messages = messages.filter(item => item.shipmentId === filters.shipmentId);
    }

    // Apply unread filter
    if (filters.unreadOnly) {
      messages = messages.filter(item => !item.readAt);
    }

    // Apply search filter
    if (filters.search) {
      const term = filters.search.toLowerCase();
      messages = messages.filter(item =>
        item.messageId.toLowerCase().includes(term) ||
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        item.content.toLowerCase().includes(term)
      );
    }

    // Paginate
    const total = messages.length;
    const items = messages.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single tracking message by ID
 */
export const getTrackingMessage = query({
  args: {
    messageId: v.id('yourobcTrackingMessages'),
  },
  handler: async (ctx, { messageId }) => {
    const user = await requireCurrentUser(ctx);

    const message = await ctx.db.get(messageId);
    if (!message || message.deletedAt) {
      throw new Error('Tracking message not found');
    }

    await requireViewTrackingMessageAccess(ctx, message, user);

    return message;
  },
});

/**
 * Get tracking message by public ID
 */
export const getTrackingMessageByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const user = await requireCurrentUser(ctx);

    const message = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_public_id', q => q.eq('publicId', publicId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!message) {
      throw new Error('Tracking message not found');
    }

    await requireViewTrackingMessageAccess(ctx, message, user);

    return message;
  },
});

/**
 * Get tracking message by message ID
 */
export const getTrackingMessageByMessageId = query({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, { messageId }) => {
    const user = await requireCurrentUser(ctx);

    const message = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_message_id', q => q.eq('messageId', messageId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!message) {
      throw new Error('Tracking message not found');
    }

    await requireViewTrackingMessageAccess(ctx, message, user);

    return message;
  },
});

/**
 * Get tracking message statistics
 */
export const getTrackingMessageStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx);

    const messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_owner', q => q.eq('ownerId', user._id))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .collect();

    const accessible = await filterTrackingMessagesByAccess(ctx, messages, user);

    return {
      total: accessible.length,
      byStatus: {
        draft: accessible.filter(item => item.status === 'draft').length,
        sent: accessible.filter(item => item.status === 'sent').length,
        delivered: accessible.filter(item => item.status === 'delivered').length,
        read: accessible.filter(item => item.status === 'read').length,
        archived: accessible.filter(item => item.status === 'archived').length,
      },
      byType: {
        event: accessible.filter(item => item.messageType === 'event').length,
        note: accessible.filter(item => item.messageType === 'note').length,
        alert: accessible.filter(item => item.messageType === 'alert').length,
        update: accessible.filter(item => item.messageType === 'update').length,
        notification: accessible.filter(item => item.messageType === 'notification').length,
      },
      unread: accessible.filter(item => !item.readAt).length,
    };
  },
});
