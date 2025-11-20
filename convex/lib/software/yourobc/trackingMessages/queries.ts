// convex/lib/software/yourobc/trackingMessages/queries.ts
/**
 * Tracking Messages Query Helpers
 *
 * Reusable query functions for tracking messages.
 * These helpers can be used in Convex queries and mutations to retrieve tracking messages.
 *
 * @module convex/lib/software/yourobc/trackingMessages/queries
 */

import { QueryCtx } from '../../../../_generated/server'
import type { TrackingMessage, TrackingMessageId, TrackingMessageFilters } from './types'
import { DEFAULT_QUERY_LIMIT, MAX_QUERY_LIMIT } from './constants'

// ============================================================================
// Single Record Queries
// ============================================================================

/**
 * Gets a tracking message by internal ID
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {TrackingMessageId} id - The tracking message ID
 * @returns {Promise<TrackingMessage | null>} The tracking message or null
 *
 * @example
 * const message = await getTrackingMessageById(ctx, messageId)
 */
export async function getTrackingMessageById(
  ctx: QueryCtx,
  id: TrackingMessageId
): Promise<TrackingMessage | null> {
  return await ctx.db.get(id)
}

/**
 * Gets a tracking message by public ID
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} publicId - The public ID
 * @returns {Promise<TrackingMessage | null>} The tracking message or null
 *
 * @example
 * const message = await getTrackingMessageByPublicId(ctx, 'tmsg_abc123')
 */
export async function getTrackingMessageByPublicId(
  ctx: QueryCtx,
  publicId: string
): Promise<TrackingMessage | null> {
  return await ctx.db
    .query('trackingMessages')
    .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
    .first()
}

// ============================================================================
// List Queries
// ============================================================================

/**
 * Gets all tracking messages for a specific owner
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} ownerId - The owner's auth ID
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getTrackingMessagesByOwner(ctx, userId, { includeDeleted: false })
 */
export async function getTrackingMessagesByOwner(
  ctx: QueryCtx,
  ownerId: string,
  options: {
    includeDeleted?: boolean
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { includeDeleted = false, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets active tracking messages by service type and status
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} serviceType - The service type
 * @param {string} status - The shipment status
 * @param {string} language - The language code
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getActiveTrackingMessages(ctx, 'OBC', 'booked', 'en')
 */
export async function getActiveTrackingMessages(
  ctx: QueryCtx,
  serviceType: string,
  status: string,
  language: string
): Promise<TrackingMessage[]> {
  return await ctx.db
    .query('trackingMessages')
    .withIndex('by_serviceType_status_language', (q) =>
      q.eq('serviceType', serviceType).eq('status', status).eq('language', language)
    )
    .filter((q) =>
      q.and(
        q.eq(q.field('isActive'), true),
        q.eq(q.field('deletedAt'), undefined)
      )
    )
    .collect()
}

/**
 * Gets official tracking message templates
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {Object} filters - Optional filters
 * @returns {Promise<TrackingMessage[]>} Array of official templates
 *
 * @example
 * const officialMessages = await getOfficialTrackingMessages(ctx, { serviceType: 'OBC' })
 */
export async function getOfficialTrackingMessages(
  ctx: QueryCtx,
  filters: {
    serviceType?: string
    status?: string
    language?: string
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { limit = DEFAULT_QUERY_LIMIT } = filters

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_official', (q) => q.eq('isOfficial', true))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  // Apply additional filters
  if (filters.serviceType) {
    query = query.filter((q) => q.eq(q.field('serviceType'), filters.serviceType))
  }
  if (filters.status) {
    query = query.filter((q) => q.eq(q.field('status'), filters.status))
  }
  if (filters.language) {
    query = query.filter((q) => q.eq(q.field('language'), filters.language))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets tracking messages by service type
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} serviceType - The service type
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getTrackingMessagesByServiceType(ctx, 'OBC')
 */
export async function getTrackingMessagesByServiceType(
  ctx: QueryCtx,
  serviceType: string,
  options: {
    activeOnly?: boolean
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { activeOnly = true, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_serviceType', (q) => q.eq('serviceType', serviceType))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (activeOnly) {
    query = query.filter((q) => q.eq(q.field('isActive'), true))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets tracking messages by status
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} status - The shipment status
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getTrackingMessagesByStatus(ctx, 'delivered')
 */
export async function getTrackingMessagesByStatus(
  ctx: QueryCtx,
  status: string,
  options: {
    activeOnly?: boolean
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { activeOnly = true, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_status', (q) => q.eq('status', status))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (activeOnly) {
    query = query.filter((q) => q.eq(q.field('isActive'), true))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets tracking messages by language
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} language - The language code
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getTrackingMessagesByLanguage(ctx, 'en')
 */
export async function getTrackingMessagesByLanguage(
  ctx: QueryCtx,
  language: string,
  options: {
    activeOnly?: boolean
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { activeOnly = true, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_language', (q) => q.eq('language', language))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (activeOnly) {
    query = query.filter((q) => q.eq(q.field('isActive'), true))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets tracking messages by category
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} category - The message category
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await getTrackingMessagesByCategory(ctx, 'booking')
 */
export async function getTrackingMessagesByCategory(
  ctx: QueryCtx,
  category: string,
  options: {
    activeOnly?: boolean
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { activeOnly = true, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_category', (q) => q.eq('category', category))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (activeOnly) {
    query = query.filter((q) => q.eq(q.field('isActive'), true))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

// ============================================================================
// Advanced Queries
// ============================================================================

/**
 * Searches tracking messages with filters
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {TrackingMessageFilters} filters - Search filters
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const messages = await searchTrackingMessages(ctx, {
 *   serviceType: 'OBC',
 *   status: 'booked',
 *   isActive: true
 * })
 */
export async function searchTrackingMessages(
  ctx: QueryCtx,
  filters: TrackingMessageFilters & { limit?: number } = {}
): Promise<TrackingMessage[]> {
  const {
    serviceType,
    status,
    language,
    isActive,
    isOfficial,
    category,
    ownerId,
    includeDeleted = false,
    limit = DEFAULT_QUERY_LIMIT,
  } = filters

  // Start with most selective index
  let query = serviceType && status && language
    ? ctx.db.query('trackingMessages').withIndex('by_serviceType_status_language', (q) =>
        q.eq('serviceType', serviceType).eq('status', status).eq('language', language)
      )
    : serviceType && status
    ? ctx.db.query('trackingMessages').withIndex('by_serviceType_status', (q) =>
        q.eq('serviceType', serviceType).eq('status', status)
      )
    : serviceType
    ? ctx.db.query('trackingMessages').withIndex('by_serviceType', (q) => q.eq('serviceType', serviceType))
    : status
    ? ctx.db.query('trackingMessages').withIndex('by_status', (q) => q.eq('status', status))
    : language
    ? ctx.db.query('trackingMessages').withIndex('by_language', (q) => q.eq('language', language))
    : ownerId
    ? ctx.db.query('trackingMessages').withIndex('by_owner', (q) => q.eq('ownerId', ownerId))
    : ctx.db.query('trackingMessages')

  // Apply filters
  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined))
  }

  if (isActive !== undefined) {
    query = query.filter((q) => q.eq(q.field('isActive'), isActive))
  }

  if (isOfficial !== undefined) {
    query = query.filter((q) => q.eq(q.field('isOfficial'), isOfficial))
  }

  if (category) {
    query = query.filter((q) => q.eq(q.field('category'), category))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets recently created tracking messages
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of tracking messages
 *
 * @example
 * const recent = await getRecentTrackingMessages(ctx, { limit: 10 })
 */
export async function getRecentTrackingMessages(
  ctx: QueryCtx,
  options: {
    ownerId?: string
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { ownerId, limit = DEFAULT_QUERY_LIMIT } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_created')
    .order('desc')
    .filter((q) => q.eq(q.field('deletedAt'), undefined))

  if (ownerId) {
    query = query.filter((q) => q.eq(q.field('ownerId'), ownerId))
  }

  return await query.take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Gets deleted tracking messages (soft-deleted)
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} ownerId - The owner's auth ID
 * @param {Object} options - Query options
 * @returns {Promise<TrackingMessage[]>} Array of deleted tracking messages
 *
 * @example
 * const deleted = await getDeletedTrackingMessages(ctx, userId)
 */
export async function getDeletedTrackingMessages(
  ctx: QueryCtx,
  ownerId: string,
  options: {
    limit?: number
  } = {}
): Promise<TrackingMessage[]> {
  const { limit = DEFAULT_QUERY_LIMIT } = options

  return await ctx.db
    .query('trackingMessages')
    .withIndex('by_owner_deleted', (q) => q.eq('ownerId', ownerId))
    .filter((q) => q.neq(q.field('deletedAt'), undefined))
    .take(Math.min(limit, MAX_QUERY_LIMIT))
}

/**
 * Counts tracking messages by owner
 *
 * @param {QueryCtx} ctx - Convex query context
 * @param {string} ownerId - The owner's auth ID
 * @param {Object} options - Count options
 * @returns {Promise<number>} Count of tracking messages
 *
 * @example
 * const count = await countTrackingMessagesByOwner(ctx, userId)
 */
export async function countTrackingMessagesByOwner(
  ctx: QueryCtx,
  ownerId: string,
  options: {
    includeDeleted?: boolean
    activeOnly?: boolean
  } = {}
): Promise<number> {
  const { includeDeleted = false, activeOnly = false } = options

  let query = ctx.db
    .query('trackingMessages')
    .withIndex('by_owner', (q) => q.eq('ownerId', ownerId))

  if (!includeDeleted) {
    query = query.filter((q) => q.eq(q.field('deletedAt'), undefined))
  }

  if (activeOnly) {
    query = query.filter((q) => q.eq(q.field('isActive'), true))
  }

  const messages = await query.collect()
  return messages.length
}
