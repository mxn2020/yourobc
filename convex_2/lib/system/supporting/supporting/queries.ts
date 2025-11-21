// convex/lib/system/supporting/supporting/queries.ts
// Query operations for supporting module

import type { QueryCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import {
  canViewWikiEntry,
  canViewComment,
  canViewReminder,
  canViewDocument,
  canViewScheduledEvent,
  canViewAvailability,
} from './permissions';
import type {
  WikiEntry,
  Comment,
  Reminder,
  Document,
  ScheduledEvent,
  AvailabilityPreference,
} from './types';

// ============================================================================
// Wiki Entries Queries
// ============================================================================

/**
 * Get wiki entry by ID
 */
export async function getWikiEntry(
  ctx: QueryCtx,
  wikiEntryId: Id<'wikiEntries'>,
  userId: Id<'userProfiles'>
): Promise<WikiEntry | null> {
  const wikiEntry = await ctx.db.get(wikiEntryId);

  if (!wikiEntry || wikiEntry.deletedAt) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewWikiEntry(ctx, wikiEntry, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this wiki entry');
  }

  return wikiEntry;
}

/**
 * Get wiki entry by public ID
 */
export async function getWikiEntryByPublicId(
  ctx: QueryCtx,
  publicId: string,
  userId: Id<'userProfiles'>
): Promise<WikiEntry | null> {
  const wikiEntry = await ctx.db
    .query('wikiEntries')
    .withIndex('by_public_id', (q) => q.eq('publicId', publicId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (!wikiEntry) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewWikiEntry(ctx, wikiEntry, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this wiki entry');
  }

  return wikiEntry;
}

/**
 * List wiki entries with access control
 */
export async function listWikiEntries(
  ctx: QueryCtx,
  userId: Id<'userProfiles'>,
  options?: { limit?: number; category?: string }
): Promise<WikiEntry[]> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let query = ctx.db.query('wikiEntries');

  if (options?.category) {
    query = query.withIndex('by_category', (q) => q.eq('category', options.category));
  }

  const wikiEntries = await query
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .take(options?.limit || 100);

  // Filter by access
  const accessibleEntries: WikiEntry[] = [];
  for (const entry of wikiEntries) {
    const hasAccess = await canViewWikiEntry(ctx, entry, user);
    if (hasAccess) {
      accessibleEntries.push(entry);
    }
  }

  return accessibleEntries;
}

// ============================================================================
// Comments Queries
// ============================================================================

/**
 * Get comment by ID
 */
export async function getComment(
  ctx: QueryCtx,
  commentId: Id<'comments'>,
  userId: Id<'userProfiles'>
): Promise<Comment | null> {
  const comment = await ctx.db.get(commentId);

  if (!comment || comment.deletedAt) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewComment(ctx, comment, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this comment');
  }

  return comment;
}

/**
 * List comments for an entity
 */
export async function listCommentsForEntity(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  userId: Id<'userProfiles'>
): Promise<Comment[]> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const comments = await ctx.db
    .query('comments')
    .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  // Filter by access
  const accessibleComments: Comment[] = [];
  for (const comment of comments) {
    const hasAccess = await canViewComment(ctx, comment, user);
    if (hasAccess) {
      accessibleComments.push(comment);
    }
  }

  return accessibleComments;
}

// ============================================================================
// Reminders Queries
// ============================================================================

/**
 * Get reminder by ID
 */
export async function getReminder(
  ctx: QueryCtx,
  reminderId: Id<'reminders'>,
  userId: Id<'userProfiles'>
): Promise<Reminder | null> {
  const reminder = await ctx.db.get(reminderId);

  if (!reminder || reminder.deletedAt) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewReminder(ctx, reminder, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this reminder');
  }

  return reminder;
}

/**
 * List reminders assigned to user
 */
export async function listUserReminders(
  ctx: QueryCtx,
  userId: Id<'userProfiles'>,
  options?: { limit?: number; status?: string }
): Promise<Reminder[]> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let query = ctx.db
    .query('reminders')
    .withIndex('by_assignedTo', (q) => q.eq('assignedTo', userId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined));

  if (options?.status) {
    query = query.filter((q) => q.eq(q.field('status'), options.status));
  }

  return await query.take(options?.limit || 100);
}

// ============================================================================
// Documents Queries
// ============================================================================

/**
 * Get document by ID
 */
export async function getDocument(
  ctx: QueryCtx,
  documentId: Id<'documents'>,
  userId: Id<'userProfiles'>
): Promise<Document | null> {
  const document = await ctx.db.get(documentId);

  if (!document || document.deletedAt) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewDocument(ctx, document, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this document');
  }

  return document;
}

/**
 * List documents for an entity
 */
export async function listDocumentsForEntity(
  ctx: QueryCtx,
  entityType: string,
  entityId: string,
  userId: Id<'userProfiles'>
): Promise<Document[]> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const documents = await ctx.db
    .query('documents')
    .withIndex('by_entity', (q) => q.eq('entityType', entityType).eq('entityId', entityId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .collect();

  // Filter by access
  const accessibleDocuments: Document[] = [];
  for (const document of documents) {
    const hasAccess = await canViewDocument(ctx, document, user);
    if (hasAccess) {
      accessibleDocuments.push(document);
    }
  }

  return accessibleDocuments;
}

// ============================================================================
// Scheduled Events Queries
// ============================================================================

/**
 * Get scheduled event by ID
 */
export async function getScheduledEvent(
  ctx: QueryCtx,
  eventId: Id<'scheduledEvents'>,
  userId: Id<'userProfiles'>
): Promise<ScheduledEvent | null> {
  const event = await ctx.db.get(eventId);

  if (!event || event.deletedAt) {
    return null;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hasAccess = await canViewScheduledEvent(ctx, event, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this event');
  }

  return event;
}

/**
 * List scheduled events for user
 */
export async function listUserScheduledEvents(
  ctx: QueryCtx,
  userId: Id<'userProfiles'>,
  options?: { limit?: number; startTime?: number; endTime?: number }
): Promise<ScheduledEvent[]> {
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  let query = ctx.db
    .query('scheduledEvents')
    .withIndex('by_organizer', (q) => q.eq('organizerId', userId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined));

  const events = await query.take(options?.limit || 100);

  // Filter by time range if provided
  let filteredEvents = events;
  if (options?.startTime || options?.endTime) {
    filteredEvents = events.filter((event) => {
      if (options.startTime && event.endTime < options.startTime) {
        return false;
      }
      if (options.endTime && event.startTime > options.endTime) {
        return false;
      }
      return true;
    });
  }

  return filteredEvents;
}

// ============================================================================
// Availability Preferences Queries
// ============================================================================

/**
 * Get availability preferences for user
 */
export async function getUserAvailability(
  ctx: QueryCtx,
  targetUserId: Id<'userProfiles'>,
  requestingUserId: Id<'userProfiles'>
): Promise<AvailabilityPreference | null> {
  const user = await ctx.db.get(requestingUserId);
  if (!user) {
    throw new Error('User not found');
  }

  const availability = await ctx.db
    .query('availabilityPreferences')
    .withIndex('by_user_id', (q) => q.eq('userId', targetUserId))
    .filter((q) => q.eq(q.field('deletedAt'), undefined))
    .first();

  if (!availability) {
    return null;
  }

  const hasAccess = await canViewAvailability(ctx, availability, user);
  if (!hasAccess) {
    throw new Error('You do not have permission to view this availability');
  }

  return availability;
}
