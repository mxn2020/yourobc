// convex/lib/software/yourobc/supporting/mutations.ts
/**
 * Supporting Module Mutation Functions
 *
 * Mutation functions for all supporting entities.
 * Handles data creation, updates, and deletion with validation.
 *
 * @module convex/lib/software/yourobc/supporting/mutations
 */

import type { MutationCtx } from '../../../../_generated/server'
import type { Id } from '../../../../_generated/dataModel'
import type {
  CreateExchangeRateArgs,
  UpdateExchangeRateArgs,
  CreateInquirySourceArgs,
  UpdateInquirySourceArgs,
  CreateWikiEntryArgs,
  UpdateWikiEntryArgs,
  CreateCommentArgs,
  UpdateCommentArgs,
  AddCommentReactionArgs,
  RemoveCommentReactionArgs,
  CreateFollowupReminderArgs,
  UpdateFollowupReminderArgs,
  CompleteReminderArgs,
  SnoozeReminderArgs,
  CreateDocumentArgs,
  UpdateDocumentArgs,
  CreateNotificationArgs,
  MarkNotificationReadArgs,
  MarkAllNotificationsReadArgs,
  GetNextCounterArgs,
  CounterResult,
} from './types'
import {
  validateExchangeRate,
  validateInquirySource,
  validateWikiEntry,
  validateComment,
  validateFollowupReminder,
  validateDocument,
  validateNotification,
  formatCounterNumber,
} from './utils'
import {
  EXCHANGE_RATE_DEFAULTS,
  INQUIRY_SOURCE_DEFAULTS,
  WIKI_DEFAULTS,
  COMMENT_DEFAULTS,
  REMINDER_DEFAULTS,
  DOCUMENT_DEFAULTS,
  NOTIFICATION_DEFAULTS,
  COUNTER_DEFAULTS,
} from './constants'

// ============================================================================
// Exchange Rates Mutations
// ============================================================================

export async function createExchangeRate(
  ctx: MutationCtx,
  args: CreateExchangeRateArgs,
  userId: string,
): Promise<Id<'yourobcExchangeRates'>> {
  const error = validateExchangeRate(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcExchangeRates', {
    fromCurrency: args.fromCurrency,
    toCurrency: args.toCurrency,
    rate: args.rate,
    date: args.date,
    source: args.source || EXCHANGE_RATE_DEFAULTS.SOURCE,
    isActive: args.isActive ?? EXCHANGE_RATE_DEFAULTS.IS_ACTIVE,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function updateExchangeRate(
  ctx: MutationCtx,
  args: UpdateExchangeRateArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Exchange rate not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted exchange rate')
  }

  const updates: Partial<typeof existing> = {
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  if (args.rate !== undefined) {
    updates.rate = args.rate
  }
  if (args.isActive !== undefined) {
    updates.isActive = args.isActive
  }
  if (args.source !== undefined) {
    updates.source = args.source
  }

  await ctx.db.patch(args.id, updates)
}

export async function deleteExchangeRate(
  ctx: MutationCtx,
  id: Id<'yourobcExchangeRates'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Exchange rate not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Inquiry Sources Mutations
// ============================================================================

export async function createInquirySource(
  ctx: MutationCtx,
  args: CreateInquirySourceArgs,
  userId: string,
): Promise<Id<'yourobcInquirySources'>> {
  const error = validateInquirySource(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcInquirySources', {
    name: args.name,
    code: args.code,
    type: args.type,
    description: args.description,
    isActive: args.isActive ?? INQUIRY_SOURCE_DEFAULTS.IS_ACTIVE,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function updateInquirySource(
  ctx: MutationCtx,
  args: UpdateInquirySourceArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Inquiry source not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted inquiry source')
  }

  const updates: Partial<typeof existing> = {
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  if (args.name !== undefined) {
    updates.name = args.name
  }
  if (args.code !== undefined) {
    updates.code = args.code
  }
  if (args.type !== undefined) {
    updates.type = args.type
  }
  if (args.description !== undefined) {
    updates.description = args.description
  }
  if (args.isActive !== undefined) {
    updates.isActive = args.isActive
  }

  await ctx.db.patch(args.id, updates)
}

export async function deleteInquirySource(
  ctx: MutationCtx,
  id: Id<'yourobcInquirySources'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Inquiry source not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Wiki Entries Mutations
// ============================================================================

export async function createWikiEntry(
  ctx: MutationCtx,
  args: CreateWikiEntryArgs,
  userId: string,
): Promise<Id<'yourobcWikiEntries'>> {
  const error = validateWikiEntry(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcWikiEntries', {
    title: args.title,
    slug: args.slug,
    content: args.content,
    type: args.type,
    category: args.category,
    isPublic: args.isPublic ?? WIKI_DEFAULTS.IS_PUBLIC,
    status: args.status ?? WIKI_DEFAULTS.STATUS,
    viewCount: WIKI_DEFAULTS.VIEW_COUNT,
    tags: args.tags ?? WIKI_DEFAULTS.TAGS,
    customFields: args.customFields,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function updateWikiEntry(
  ctx: MutationCtx,
  args: UpdateWikiEntryArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Wiki entry not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted wiki entry')
  }

  const updates: Partial<typeof existing> = {
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  if (args.title !== undefined) {
    updates.title = args.title
  }
  if (args.slug !== undefined) {
    updates.slug = args.slug
  }
  if (args.content !== undefined) {
    updates.content = args.content
  }
  if (args.type !== undefined) {
    updates.type = args.type
  }
  if (args.category !== undefined) {
    updates.category = args.category
  }
  if (args.isPublic !== undefined) {
    updates.isPublic = args.isPublic
  }
  if (args.status !== undefined) {
    updates.status = args.status
  }
  if (args.tags !== undefined) {
    updates.tags = args.tags
  }
  if (args.customFields !== undefined) {
    updates.customFields = args.customFields
  }

  await ctx.db.patch(args.id, updates)
}

export async function incrementWikiViewCount(
  ctx: MutationCtx,
  id: Id<'yourobcWikiEntries'>,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    return
  }

  await ctx.db.patch(id, {
    viewCount: (existing.viewCount || 0) + 1,
    lastViewedAt: Date.now(),
  })
}

export async function deleteWikiEntry(
  ctx: MutationCtx,
  id: Id<'yourobcWikiEntries'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Wiki entry not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Comments Mutations
// ============================================================================

export async function createComment(
  ctx: MutationCtx,
  args: CreateCommentArgs,
  userId: string,
): Promise<Id<'yourobcComments'>> {
  const error = validateComment(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  const commentId = await ctx.db.insert('yourobcComments', {
    entityType: args.entityType,
    entityId: args.entityId,
    content: args.content,
    type: args.type,
    isInternal: args.isInternal ?? COMMENT_DEFAULTS.IS_INTERNAL,
    mentions: args.mentions,
    attachments: args.attachments,
    parentCommentId: args.parentCommentId,
    isEdited: COMMENT_DEFAULTS.IS_EDITED,
    replyCount: COMMENT_DEFAULTS.REPLY_COUNT,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })

  // Update parent comment reply count
  if (args.parentCommentId) {
    const parent = await ctx.db.get(args.parentCommentId)
    if (parent) {
      await ctx.db.patch(args.parentCommentId, {
        replyCount: (parent.replyCount || 0) + 1,
      })
    }
  }

  return commentId
}

export async function updateComment(
  ctx: MutationCtx,
  args: UpdateCommentArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Comment not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted comment')
  }

  if (!args.content) {
    return
  }

  // Add to edit history
  const editHistory = existing.editHistory || []
  editHistory.push({
    content: existing.content,
    editedAt: Date.now(),
    reason: args.reason,
  })

  await ctx.db.patch(args.id, {
    content: args.content,
    isEdited: true,
    editHistory,
    updatedAt: Date.now(),
    updatedBy: userId,
  })
}

export async function addCommentReaction(
  ctx: MutationCtx,
  args: AddCommentReactionArgs,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Comment not found')
  }

  const reactions = existing.reactions || []

  // Check if user already reacted with this emoji
  const existingReaction = reactions.find(
    r => r.userId === args.userId && r.reaction === args.reaction,
  )

  if (existingReaction) {
    return // Already reacted
  }

  reactions.push({
    userId: args.userId,
    reaction: args.reaction,
    createdAt: Date.now(),
  })

  await ctx.db.patch(args.id, { reactions })
}

export async function removeCommentReaction(
  ctx: MutationCtx,
  args: RemoveCommentReactionArgs,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Comment not found')
  }

  const reactions = existing.reactions || []
  const filtered = reactions.filter(
    r => !(r.userId === args.userId && r.reaction === args.reaction),
  )

  await ctx.db.patch(args.id, { reactions: filtered })
}

export async function deleteComment(
  ctx: MutationCtx,
  id: Id<'yourobcComments'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Comment not found')
  }

  // Update parent comment reply count
  if (existing.parentCommentId) {
    const parent = await ctx.db.get(existing.parentCommentId)
    if (parent && parent.replyCount && parent.replyCount > 0) {
      await ctx.db.patch(existing.parentCommentId, {
        replyCount: parent.replyCount - 1,
      })
    }
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Followup Reminders Mutations
// ============================================================================

export async function createFollowupReminder(
  ctx: MutationCtx,
  args: CreateFollowupReminderArgs,
  userId: string,
): Promise<Id<'yourobcFollowupReminders'>> {
  const error = validateFollowupReminder(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcFollowupReminders', {
    title: args.title,
    description: args.description,
    type: args.type,
    entityType: args.entityType,
    entityId: args.entityId,
    dueDate: args.dueDate,
    reminderDate: args.reminderDate,
    priority: args.priority,
    assignedTo: args.assignedTo,
    assignedBy: args.assignedBy,
    status: REMINDER_DEFAULTS.STATUS,
    emailReminder: args.emailReminder ?? REMINDER_DEFAULTS.EMAIL_REMINDER,
    isRecurring: args.isRecurring ?? REMINDER_DEFAULTS.IS_RECURRING,
    recurrencePattern: args.recurrencePattern,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function updateFollowupReminder(
  ctx: MutationCtx,
  args: UpdateFollowupReminderArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Reminder not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted reminder')
  }

  const updates: Partial<typeof existing> = {
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  if (args.title !== undefined) {
    updates.title = args.title
  }
  if (args.description !== undefined) {
    updates.description = args.description
  }
  if (args.type !== undefined) {
    updates.type = args.type
  }
  if (args.dueDate !== undefined) {
    updates.dueDate = args.dueDate
  }
  if (args.reminderDate !== undefined) {
    updates.reminderDate = args.reminderDate
  }
  if (args.priority !== undefined) {
    updates.priority = args.priority
  }
  if (args.assignedTo !== undefined) {
    updates.assignedTo = args.assignedTo
  }
  if (args.status !== undefined) {
    updates.status = args.status
  }
  if (args.emailReminder !== undefined) {
    updates.emailReminder = args.emailReminder
  }

  await ctx.db.patch(args.id, updates)
}

export async function completeReminder(
  ctx: MutationCtx,
  args: CompleteReminderArgs,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Reminder not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot complete deleted reminder')
  }

  await ctx.db.patch(args.id, {
    status: 'completed',
    completedAt: Date.now(),
    completedBy: args.completedBy,
    completionNotes: args.completionNotes,
    updatedAt: Date.now(),
    updatedBy: args.completedBy,
  })
}

export async function snoozeReminder(
  ctx: MutationCtx,
  args: SnoozeReminderArgs,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Reminder not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot snooze deleted reminder')
  }

  await ctx.db.patch(args.id, {
    snoozeUntil: args.snoozeUntil,
    snoozeReason: args.snoozeReason,
    snoozedBy: args.snoozedBy,
    snoozedAt: Date.now(),
    updatedAt: Date.now(),
    updatedBy: args.snoozedBy,
  })
}

export async function deleteFollowupReminder(
  ctx: MutationCtx,
  id: Id<'yourobcFollowupReminders'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Reminder not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Documents Mutations
// ============================================================================

export async function createDocument(
  ctx: MutationCtx,
  args: CreateDocumentArgs,
  userId: string,
): Promise<Id<'yourobcDocuments'>> {
  const error = validateDocument(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcDocuments', {
    entityType: args.entityType,
    entityId: args.entityId,
    documentType: args.documentType,
    filename: args.filename,
    originalFilename: args.originalFilename,
    fileSize: args.fileSize,
    mimeType: args.mimeType,
    fileUrl: args.fileUrl,
    title: args.title,
    description: args.description,
    isPublic: args.isPublic ?? DOCUMENT_DEFAULTS.IS_PUBLIC,
    isConfidential: args.isConfidential ?? DOCUMENT_DEFAULTS.IS_CONFIDENTIAL,
    status: DOCUMENT_DEFAULTS.STATUS,
    uploadedBy: args.uploadedBy,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function updateDocument(
  ctx: MutationCtx,
  args: UpdateDocumentArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Document not found')
  }

  if (existing.deletedAt) {
    throw new Error('Cannot update deleted document')
  }

  const updates: Partial<typeof existing> = {
    updatedAt: Date.now(),
    updatedBy: userId,
  }

  if (args.title !== undefined) {
    updates.title = args.title
  }
  if (args.description !== undefined) {
    updates.description = args.description
  }
  if (args.isPublic !== undefined) {
    updates.isPublic = args.isPublic
  }
  if (args.isConfidential !== undefined) {
    updates.isConfidential = args.isConfidential
  }
  if (args.status !== undefined) {
    updates.status = args.status
  }
  if (args.documentType !== undefined) {
    updates.documentType = args.documentType
  }

  await ctx.db.patch(args.id, updates)
}

export async function deleteDocument(
  ctx: MutationCtx,
  id: Id<'yourobcDocuments'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Document not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Notifications Mutations
// ============================================================================

export async function createNotification(
  ctx: MutationCtx,
  args: CreateNotificationArgs,
  userId: string,
): Promise<Id<'yourobcNotifications'>> {
  const error = validateNotification(args)
  if (error) {
    throw new Error(error)
  }

  const now = Date.now()

  return await ctx.db.insert('yourobcNotifications', {
    userId: args.userId,
    type: args.type,
    title: args.title,
    message: args.message,
    entityType: args.entityType,
    entityId: args.entityId,
    priority: args.priority ?? NOTIFICATION_DEFAULTS.PRIORITY,
    isRead: NOTIFICATION_DEFAULTS.IS_READ,
    actionUrl: args.actionUrl,
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
    updatedBy: userId,
  })
}

export async function markNotificationRead(
  ctx: MutationCtx,
  args: MarkNotificationReadArgs,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(args.id)
  if (!existing) {
    throw new Error('Notification not found')
  }

  // Users can only mark their own notifications
  if (existing.userId !== userId) {
    throw new Error('Cannot mark another user\'s notification')
  }

  await ctx.db.patch(args.id, {
    isRead: args.isRead,
    updatedAt: Date.now(),
    updatedBy: userId,
  })
}

export async function markAllNotificationsRead(
  ctx: MutationCtx,
  args: MarkAllNotificationsReadArgs,
  userId: string,
): Promise<void> {
  const notifications = await ctx.db
    .query('yourobcNotifications')
    .withIndex('by_user_read', q =>
      q.eq('userId', args.userId).eq('isRead', false),
    )
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .collect()

  const now = Date.now()

  for (const notification of notifications) {
    await ctx.db.patch(notification._id, {
      isRead: true,
      updatedAt: now,
      updatedBy: userId,
    })
  }
}

export async function deleteNotification(
  ctx: MutationCtx,
  id: Id<'yourobcNotifications'>,
  userId: string,
): Promise<void> {
  const existing = await ctx.db.get(id)
  if (!existing) {
    throw new Error('Notification not found')
  }

  await ctx.db.patch(id, {
    deletedAt: Date.now(),
    deletedBy: userId,
  })
}

// ============================================================================
// Counters Mutations
// ============================================================================

export async function getNextCounter(
  ctx: MutationCtx,
  args: GetNextCounterArgs,
  userId: string,
): Promise<CounterResult> {
  const year = args.year || new Date().getFullYear()

  // Try to find existing counter
  const existingCounters = await ctx.db
    .query('yourobcCounters')
    .withIndex('by_type_year', q => q.eq('type', args.type).eq('year', year))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .take(1)

  let counter = existingCounters[0]

  if (!counter) {
    // Create new counter for this year
    const now = Date.now()
    const counterId = await ctx.db.insert('yourobcCounters', {
      type: args.type,
      prefix: args.prefix,
      year,
      lastNumber: COUNTER_DEFAULTS.LAST_NUMBER,
      createdAt: now,
      createdBy: userId,
      updatedAt: now,
      updatedBy: userId,
    })

    counter = (await ctx.db.get(counterId))!
  }

  // Increment counter
  const nextNumber = counter.lastNumber + 1

  await ctx.db.patch(counter._id, {
    lastNumber: nextNumber,
    updatedAt: Date.now(),
    updatedBy: userId,
  })

  return {
    number: nextNumber,
    formattedNumber: formatCounterNumber(args.prefix, year, nextNumber),
  }
}

export async function resetCounter(
  ctx: MutationCtx,
  type: string,
  year: number,
  userId: string,
): Promise<void> {
  const counters = await ctx.db
    .query('yourobcCounters')
    .withIndex('by_type_year', q => q.eq('type', type).eq('year', year))
    .filter(q => q.eq(q.field('deletedAt'), undefined))
    .take(1)

  const counter = counters[0]

  if (!counter) {
    throw new Error('Counter not found')
  }

  await ctx.db.patch(counter._id, {
    lastNumber: COUNTER_DEFAULTS.LAST_NUMBER,
    updatedAt: Date.now(),
    updatedBy: userId,
  })
}
