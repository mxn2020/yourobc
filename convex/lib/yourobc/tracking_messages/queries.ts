// convex/lib/yourobc/tracking_messages/queries.ts
// convex/lib/yourobc/trackingMessages/queries.ts

import { v } from 'convex/values'
import { query } from '@/generated/server'
import { requirePermission } from '@/shared/auth.helper'
import { TRACKING_MESSAGE_CONSTANTS } from './constants'
import { shipmentStatusValidator } from '../../../schema/yourobc/base'

/**
 * Get all tracking message templates
 */
export const getAllTrackingMessages = query({
  args: {
    authUserId: v.string(),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const messages = await ctx.db.query('yourobcTrackingMessages').collect()

    if (args.activeOnly) {
      return messages.filter((m) => m.isActive)
    }

    return messages
  },
})

/**
 * Get tracking messages by service type
 */
export const getTrackingMessagesByService = query({
  args: {
    authUserId: v.string(),
    serviceType: v.union(v.literal('OBC'), v.literal('NFO')),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_serviceType', (q) => q.eq('serviceType', args.serviceType))
      .collect()

    if (args.activeOnly) {
      return messages.filter((m) => m.isActive)
    }

    return messages
  },
})

/**
 * Get tracking messages by status
 */
export const getTrackingMessagesByStatus = query({
  args: {
    authUserId: v.string(),
    status: shipmentStatusValidator,
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_status', (q) => q.eq('status', args.status))
      .collect()

    if (args.activeOnly) {
      return messages.filter((m) => m.isActive)
    }

    return messages
  },
})

/**
 * Get tracking message for specific service type and status
 */
export const getTrackingMessageForServiceAndStatus = query({
  args: {
    authUserId: v.string(),
    serviceType: v.union(v.literal('OBC'), v.literal('NFO')),
    status: shipmentStatusValidator,
    language: v.optional(v.union(v.literal('en'), v.literal('de'))),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const lang = args.language || TRACKING_MESSAGE_CONSTANTS.LANGUAGE.EN

    const messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_serviceType_status_language', (q) =>
        q.eq('serviceType', args.serviceType).eq('status', args.status).eq('language', lang)
      )
      .collect()

    // Return first active template
    return messages.find((m) => m.isActive) || messages[0] || null
  },
})

/**
 * Get tracking messages by language
 */
export const getTrackingMessagesByLanguage = query({
  args: {
    authUserId: v.string(),
    language: v.union(v.literal('en'), v.literal('de')),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const messages = await ctx.db
      .query('yourobcTrackingMessages')
      .withIndex('by_language', (q) => q.eq('language', args.language))
      .collect()

    if (args.activeOnly) {
      return messages.filter((m) => m.isActive)
    }

    return messages
  },
})

/**
 * Get a single tracking message by ID
 */
export const getTrackingMessage = query({
  args: {
    authUserId: v.string(),
    messageId: v.id('yourobcTrackingMessages'),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    return await ctx.db.get(args.messageId)
  },
})

/**
 * Search tracking messages
 */
export const searchTrackingMessages = query({
  args: {
    authUserId: v.string(),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const allMessages = await ctx.db.query('yourobcTrackingMessages').collect()
    const searchLower = args.searchTerm.toLowerCase()

    return allMessages.filter(
      (msg) =>
        msg.template.toLowerCase().includes(searchLower) ||
        msg.status.toLowerCase().includes(searchLower) ||
        msg.subject?.toLowerCase().includes(searchLower)
    )
  },
})

/**
 * Get tracking message statistics
 */
export const getTrackingMessageStats = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, { authUserId }) => {
    await requirePermission(ctx, authUserId, TRACKING_MESSAGE_CONSTANTS.PERMISSIONS.VIEW);

    const allMessages = await ctx.db.query('yourobcTrackingMessages').collect()

    return {
      total: allMessages.length,
      active: allMessages.filter((m) => m.isActive).length,
      inactive: allMessages.filter((m) => !m.isActive).length,
      byServiceType: {
        OBC: allMessages.filter((m) => m.serviceType === TRACKING_MESSAGE_CONSTANTS.SERVICE_TYPE.OBC).length,
        NFO: allMessages.filter((m) => m.serviceType === TRACKING_MESSAGE_CONSTANTS.SERVICE_TYPE.NFO).length,
      },
      byLanguage: {
        en: allMessages.filter((m) => m.language === TRACKING_MESSAGE_CONSTANTS.LANGUAGE.EN).length,
        de: allMessages.filter((m) => m.language === TRACKING_MESSAGE_CONSTANTS.LANGUAGE.DE).length,
      },
      byStatus: allMessages.reduce((acc, msg) => {
        acc[msg.status] = (acc[msg.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  },
})
