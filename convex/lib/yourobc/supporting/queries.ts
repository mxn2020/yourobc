// convex/lib/yourobc/supporting/queries.ts
/**
 * Supporting Module Query Functions
 *
 * Query functions for all supporting entities.
 * Handles data retrieval, filtering, and aggregation.
 *
 * @module convex/lib/yourobc/supporting/queries
 */

import type { QueryCtx } from '../../../_generated/server'
import type { Id } from '../../../_generated/dataModel'
import type {
  ExchangeRate,
  InquirySource,
  WikiEntry,
  Comment,
  FollowupReminder,
  Document,
  Notification,
  Counter,
  CommentWithReplies,
  PaginatedResult,
} from './types'
import { buildCommentThread } from './utils'
import { PAGINATION } from './constants'

// ============================================================================
// Exchange Rates Queries
// ============================================================================

export async function getExchangeRateById(
  ctx: QueryCtx,
  id: Id<'yourobcExchangeRates'>,
): Promise<ExchangeRate | null> {
  return await ctx.db.get(id)
}

export async function getExchangeRate(
  ctx: QueryCtx,
  fromCurrency: string,
  toCurrency: string,
  date?: number,
): Promise<ExchangeRate | null> {
  const query = ctx.db
    .query('yourobcExchangeRates')
    .withIndex('by_currency_pair', q =>
      q.eq('fromCurrency', fromCurrency).eq('toCurrency', toCurrency),
    )
    .filter(q => q.eq(q.field('isActive'), true))
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (date) {
    const rates = await query
      .filter(q => q.lte(q.field('date'), date))
      .order('desc')
      .take(1)
    return rates[0] || null
  }

  const rates = await query.order('desc').take(1)
  return rates[0] || null
}

export async function listExchangeRates(
  ctx: QueryCtx,
  options: {
    isActive?: boolean
    limit?: number
  } = {},
): Promise<ExchangeRate[]> {
  const { isActive, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db.query('yourobcExchangeRates')

  if (isActive !== undefined) {
    query = query
      .withIndex('by_active', q => q.eq('isActive', isActive))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else {
    query = query
      .withIndex('by_created')
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  }

  return await query.order('desc').take(limit)
}

// ============================================================================
// Inquiry Sources Queries
// ============================================================================

export async function getInquirySourceById(
  ctx: QueryCtx,
  id: Id<'yourobcInquirySources'>,
): Promise<InquirySource | null> {
  return await ctx.db.get(id)
}

export async function getInquirySourceByName(
  ctx: QueryCtx,
  name: string,
): Promise<InquirySource | null> {
  const sources = await ctx.db
    .query('yourobcInquirySources')
    .withIndex('by_name', q => q.eq('name', name))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .take(1)

  return sources[0] || null
}

export async function listInquirySources(
  ctx: QueryCtx,
  options: {
    type?: string
    isActive?: boolean
    limit?: number
  } = {},
): Promise<InquirySource[]> {
  const { type, isActive, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db.query('yourobcInquirySources')

  if (type) {
    query = query
      .withIndex('by_type', q => q.eq('type', type))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else if (isActive !== undefined) {
    query = query
      .withIndex('by_active', q => q.eq('isActive', isActive))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else {
    query = query
      .withIndex('by_created')
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  }

  return await query.order('desc').take(limit)
}

// ============================================================================
// Wiki Entries Queries
// ============================================================================

export async function getWikiEntryById(
  ctx: QueryCtx,
  id: Id<'yourobcWikiEntries'>,
): Promise<WikiEntry | null> {
  return await ctx.db.get(id)
}

export async function getWikiEntryBySlug(
  ctx: QueryCtx,
  slug: string,
): Promise<WikiEntry | null> {
  const entries = await ctx.db
    .query('yourobcWikiEntries')
    .withIndex('by_slug', q => q.eq('slug', slug))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .take(1)

  return entries[0] || null
}

export async function listWikiEntries(
  ctx: QueryCtx,
  options: {
    category?: string
    type?: string
    status?: string
    isPublic?: boolean
    limit?: number
  } = {},
): Promise<WikiEntry[]> {
  const {
    category,
    type,
    status,
    isPublic,
    limit = PAGINATION.DEFAULT_LIMIT,
  } = options

  let query = ctx.db.query('yourobcWikiEntries')

  if (category) {
    query = query
      .withIndex('by_category', q => q.eq('category', category))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else if (type) {
    query = query
      .withIndex('by_type', q => q.eq('type', type))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else if (status) {
    query = query
      .withIndex('by_status', q => q.eq('status', status))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else if (isPublic !== undefined) {
    query = query
      .withIndex('by_public', q => q.eq('isPublic', isPublic))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else {
    query = query
      .withIndex('by_created')
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  }

  return await query.order('desc').take(limit)
}

export async function searchWikiEntries(
  ctx: QueryCtx,
  searchQuery: string,
  options: {
    category?: string
    type?: string
    status?: string
    limit?: number
  } = {},
): Promise<WikiEntry[]> {
  const { category, type, status, limit = PAGINATION.DEFAULT_LIMIT } = options

  let entries = await listWikiEntries(ctx, {
    category,
    type,
    status,
    limit: PAGINATION.MAX_LIMIT,
  })

  // Simple search implementation - filter by title and content
  const searchLower = searchQuery.toLowerCase()
  entries = entries.filter(
    entry =>
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchLower)),
  )

  return entries.slice(0, limit)
}

// ============================================================================
// Comments Queries
// ============================================================================

export async function getCommentById(
  ctx: QueryCtx,
  id: Id<'yourobcComments'>,
): Promise<Comment | null> {
  return await ctx.db.get(id)
}

export async function listCommentsByEntity(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  options: {
    isInternal?: boolean
    limit?: number
  } = {},
): Promise<Comment[]> {
  const { isInternal, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db
    .query('yourobcComments')
    .withIndex('by_entity', q =>
      q.eq('entityType', entityType).eq('entityId', entityId),
    )
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (isInternal !== undefined) {
    query = query.filter(q => q.eq(q.field('isInternal'), isInternal))
  }

  return await query.order('desc').take(limit)
}

export async function getCommentThread(
  ctx: QueryCtx,
  parentCommentId: Id<'yourobcComments'>,
): Promise<CommentWithReplies | null> {
  const parent = await ctx.db.get(parentCommentId)
  if (!parent) {
    return null
  }

  const replies = await ctx.db
    .query('yourobcComments')
    .withIndex('by_parent', q => q.eq('parentCommentId', parentCommentId))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .collect()

  const thread = buildCommentThread([parent, ...replies], parent._id)
  return thread[0] || null
}

export async function listCommentsWithReplies(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  options: {
    isInternal?: boolean
    limit?: number
  } = {},
): Promise<CommentWithReplies[]> {
  const comments = await listCommentsByEntity(ctx, entityType, entityId, options)
  return buildCommentThread(comments)
}

// ============================================================================
// Followup Reminders Queries
// ============================================================================

export async function getFollowupReminderById(
  ctx: QueryCtx,
  id: Id<'yourobcFollowupReminders'>,
): Promise<FollowupReminder | null> {
  return await ctx.db.get(id)
}

export async function listRemindersByAssignee(
  ctx: QueryCtx,
  assignedTo: string,
  options: {
    status?: string
    limit?: number
  } = {},
): Promise<FollowupReminder[]> {
  const { status, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db
    .query('yourobcFollowupReminders')
    .withIndex('by_assignedTo', q => q.eq('assignedTo', assignedTo))
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (status) {
    query = query.filter(q => q.eq(q.field('status'), status))
  }

  return await query.order('desc').take(limit)
}

export async function listRemindersByEntity(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  options: {
    status?: string
    limit?: number
  } = {},
): Promise<FollowupReminder[]> {
  const { status, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db
    .query('yourobcFollowupReminders')
    .withIndex('by_entity', q =>
      q.eq('entityType', entityType).eq('entityId', entityId),
    )
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (status) {
    query = query.filter(q => q.eq(q.field('status'), status))
  }

  return await query.order('desc').take(limit)
}

export async function listOverdueReminders(
  ctx: QueryCtx,
  options: {
    assignedTo?: string
    limit?: number
  } = {},
): Promise<FollowupReminder[]> {
  const { assignedTo, limit = PAGINATION.DEFAULT_LIMIT } = options
  const now = Date.now()

  let query = ctx.db
    .query('yourobcFollowupReminders')
    .withIndex('by_dueDate')
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .filter(q => q.eq(q.field('status'), 'pending'))
    .filter(q => q.lt(q.field('dueDate'), now))

  if (assignedTo) {
    query = query.filter(q => q.eq(q.field('assignedTo'), assignedTo))
  }

  return await query.order('asc').take(limit)
}

export async function listUpcomingReminders(
  ctx: QueryCtx,
  options: {
    assignedTo?: string
    days?: number
    limit?: number
  } = {},
): Promise<FollowupReminder[]> {
  const { assignedTo, days = 7, limit = PAGINATION.DEFAULT_LIMIT } = options
  const now = Date.now()
  const futureDate = now + days * 24 * 60 * 60 * 1000

  let query = ctx.db
    .query('yourobcFollowupReminders')
    .withIndex('by_dueDate')
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .filter(q => q.eq(q.field('status'), 'pending'))
    .filter(q => q.gte(q.field('dueDate'), now))
    .filter(q => q.lte(q.field('dueDate'), futureDate))

  if (assignedTo) {
    query = query.filter(q => q.eq(q.field('assignedTo'), assignedTo))
  }

  return await query.order('asc').take(limit)
}

// ============================================================================
// Documents Queries
// ============================================================================

export async function getDocumentById(
  ctx: QueryCtx,
  id: Id<'yourobcDocuments'>,
): Promise<Document | null> {
  return await ctx.db.get(id)
}

export async function listDocumentsByEntity(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  options: {
    documentType?: string
    isPublic?: boolean
    isConfidential?: boolean
    limit?: number
  } = {},
): Promise<Document[]> {
  const {
    documentType,
    isPublic,
    isConfidential,
    limit = PAGINATION.DEFAULT_LIMIT,
  } = options

  let query = ctx.db
    .query('yourobcDocuments')
    .withIndex('by_entity', q =>
      q.eq('entityType', entityType).eq('entityId', entityId),
    )
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (documentType) {
    query = query.filter(q => q.eq(q.field('documentType'), documentType))
  }

  if (isPublic !== undefined) {
    query = query.filter(q => q.eq(q.field('isPublic'), isPublic))
  }

  if (isConfidential !== undefined) {
    query = query.filter(q => q.eq(q.field('isConfidential'), isConfidential))
  }

  return await query.order('desc').take(limit)
}

export async function listDocumentsByUploader(
  ctx: QueryCtx,
  uploadedBy: string,
  options: {
    limit?: number
  } = {},
): Promise<Document[]> {
  const { limit = PAGINATION.DEFAULT_LIMIT } = options

  return await ctx.db
    .query('yourobcDocuments')
    .withIndex('by_uploadedBy', q => q.eq('uploadedBy', uploadedBy))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .order('desc')
    .take(limit)
}

// ============================================================================
// Notifications Queries
// ============================================================================

export async function getNotificationById(
  ctx: QueryCtx,
  id: Id<'yourobcNotifications'>,
): Promise<Notification | null> {
  return await ctx.db.get(id)
}

export async function listNotificationsByUser(
  ctx: QueryCtx,
  userId: string,
  options: {
    isRead?: boolean
    type?: string
    limit?: number
  } = {},
): Promise<Notification[]> {
  const { isRead, type, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db.query('yourobcNotifications')

  if (isRead !== undefined) {
    query = query
      .withIndex('by_user_read', q =>
        q.eq('userId', userId).eq('isRead', isRead),
      )
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  } else {
    query = query
      .withIndex('by_user', q => q.eq('userId', userId))
      .filter(q => q.eq(q.field('deletedAt'), undefined))
  }

  if (type) {
    query = query.filter(q => q.eq(q.field('type'), type))
  }

  return await query.order('desc').take(limit)
}

export async function getUnreadNotificationCount(
  ctx: QueryCtx,
  userId: string,
): Promise<number> {
  const notifications = await ctx.db
    .query('yourobcNotifications')
    .withIndex('by_user_read', q => q.eq('userId', userId).eq('isRead', false))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .collect()

  return notifications.length
}

// ============================================================================
// Counters Queries
// ============================================================================

export async function getCounterById(
  ctx: QueryCtx,
  id: Id<'yourobcCounters'>,
): Promise<Counter | null> {
  return await ctx.db.get(id)
}

export async function getCounter(
  ctx: QueryCtx,
  type: string,
  year: number,
): Promise<Counter | null> {
  const counters = await ctx.db
    .query('yourobcCounters')
    .withIndex('by_type_year', q => q.eq('type', type).eq('year', year))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .take(1)

  return counters[0] || null
}

export async function listCounters(
  ctx: QueryCtx,
  options: {
    type?: string
    limit?: number
  } = {},
): Promise<Counter[]> {
  const { type, limit = PAGINATION.DEFAULT_LIMIT } = options

  let query = ctx.db
    .query('yourobcCounters')
    .filter(q => q.eq(q.field('deletedAt'), undefined))

  if (type) {
    query = query.filter(q => q.eq(q.field('type'), type))
  }

  return await query.order('desc').take(limit)
}

// ============================================================================
// Aggregate Queries
// ============================================================================

export async function getEntityStats(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
): Promise<{
  totalComments: number
  totalDocuments: number
  totalReminders: number
  pendingReminders: number
}> {
  const [comments, documents, reminders] = await Promise.all([
    listCommentsByEntity(ctx, entityType, entityId, {
      limit: PAGINATION.MAX_LIMIT,
    }),
    listDocumentsByEntity(ctx, entityType, entityId, {
      limit: PAGINATION.MAX_LIMIT,
    }),
    listRemindersByEntity(ctx, entityType, entityId, {
      limit: PAGINATION.MAX_LIMIT,
    }),
  ])

  const pendingReminders = reminders.filter(r => r.status === 'pending').length

  return {
    totalComments: comments.length,
    totalDocuments: documents.length,
    totalReminders: reminders.length,
    pendingReminders,
  }
}
