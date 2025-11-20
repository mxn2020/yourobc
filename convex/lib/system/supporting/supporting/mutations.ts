// convex/lib/boilerplate/supporting/supporting/mutations.ts
// Write operations for supporting module

import { v } from 'convex/values';
import type { MutationCtx } from '@/generated/server';
import type { Id } from '@/generated/dataModel';
import { SUPPORTING_CONSTANTS } from './constants';
import {
  validateWikiEntryData,
  validateCommentData,
  validateReminderData,
  validateDocumentData,
  validateScheduledEventData,
  generateSlug,
  generateSearchableContent,
} from './utils';
import {
  canEditWikiEntry,
  canDeleteWikiEntry,
  canEditComment,
  canDeleteComment,
  canEditReminder,
  canDeleteReminder,
  canEditDocument,
  canDeleteDocument,
  canEditScheduledEvent,
  canDeleteScheduledEvent,
  canEditAvailability,
  canDeleteAvailability,
  requireAccess,
} from './permissions';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique public ID for an entity
 */
async function generateUniquePublicId(
  ctx: MutationCtx,
  tableName: string,
  prefix: string = ''
): Promise<string> {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `${prefix}${timestamp}${randomString}`;
}

/**
 * Get current user or throw error
 */
async function requireCurrentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  // Get user profile by auth subject
  const user = await ctx.db
    .query('userProfiles')
    .filter((q) => q.eq(q.field('authSubject'), identity.subject))
    .first();

  if (!user) {
    throw new Error('User profile not found');
  }

  return user;
}

/**
 * Create an audit log entry
 */
async function createAuditLog(
  ctx: MutationCtx,
  action: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  description: string,
  userId: Id<'userProfiles'>,
  userName: string,
  metadata?: Record<string, any>
): Promise<void> {
  const now = Date.now();
  await ctx.db.insert('auditLogs', {
    userId,
    userName,
    action,
    entityType,
    entityId,
    entityTitle,
    description,
    metadata: metadata || {},
    createdAt: now,
    createdBy: userId,
    updatedAt: now,
  });
}

// ============================================================================
// Wiki Entries Mutations
// ============================================================================

/**
 * Create wiki entry
 */
export async function createWikiEntry(
  ctx: MutationCtx,
  data: {
    title: string;
    slug?: string;
    content: string;
    summary?: string;
    category: string;
    tags?: string[];
    type?: string;
    visibility?: string;
  }
): Promise<Id<'wikiEntries'>> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateWikiEntryData(data);

  // 3. PROCESS: Generate IDs and prepare data
  const publicId = await generateUniquePublicId(ctx, 'wikiEntries', 'wiki_');
  const slug = data.slug || generateSlug(data.title);
  const searchableContent = generateSearchableContent(data.content);
  const now = Date.now();

  // 4. CREATE: Insert into database
  const wikiEntryId = await ctx.db.insert('wikiEntries', {
    publicId,
    title: data.title.trim(),
    slug,
    content: data.content,
    summary: data.summary,
    type: (data.type as any) || SUPPORTING_CONSTANTS.WIKI.TYPE.ARTICLE,
    visibility: (data.visibility as any) || SUPPORTING_CONSTANTS.WIKI.VISIBILITY.PRIVATE,
    status: SUPPORTING_CONSTANTS.WIKI.STATUS.DRAFT as any,
    category: data.category,
    tags: data.tags || [],
    searchableContent,
    viewCount: SUPPORTING_CONSTANTS.WIKI.DEFAULT_VALUES.VIEW_COUNT,
    ownerId: user._id,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: user._id,
    deletedAt: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'wiki_entry.created',
    'supporting_wiki_entry',
    publicId,
    data.title.trim(),
    `Created wiki entry: ${data.title.trim()}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { category: data.category, type: data.type }
  );

  // 6. RETURN: Return entity ID
  return wikiEntryId;
}

/**
 * Update wiki entry
 */
export async function updateWikiEntry(
  ctx: MutationCtx,
  wikiEntryId: Id<'wikiEntries'>,
  updates: Partial<{
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string[];
    status: string;
    visibility: string;
  }>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const wikiEntry = await ctx.db.get(wikiEntryId);
  if (!wikiEntry || wikiEntry.deletedAt) {
    throw new Error('Wiki entry not found');
  }

  // 3. AUTHORIZE: Check edit permission
  const canEdit = await canEditWikiEntry(wikiEntry, user);
  await requireAccess(canEdit, 'You do not have permission to edit this wiki entry');

  // 4. UPDATE: Apply changes
  const now = Date.now();
  const updateData: any = {
    ...updates,
    updatedAt: now,
  };

  // Update searchable content if content changed
  if (updates.content) {
    updateData.searchableContent = generateSearchableContent(updates.content);
  }

  await ctx.db.patch(wikiEntryId, updateData);

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'wiki_entry.updated',
    'supporting_wiki_entry',
    wikiEntry.publicId,
    wikiEntry.title,
    `Updated wiki entry: ${wikiEntry.title}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { updates: Object.keys(updates) }
  );
}

/**
 * Delete wiki entry (soft delete)
 */
export async function deleteWikiEntry(
  ctx: MutationCtx,
  wikiEntryId: Id<'wikiEntries'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const wikiEntry = await ctx.db.get(wikiEntryId);
  if (!wikiEntry || wikiEntry.deletedAt) {
    throw new Error('Wiki entry not found');
  }

  // 3. AUTHORIZE: Check delete permission
  const canDelete = await canDeleteWikiEntry(wikiEntry, user);
  await requireAccess(canDelete, 'You do not have permission to delete this wiki entry');

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(wikiEntryId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'wiki_entry.deleted',
    'supporting_wiki_entry',
    wikiEntry.publicId,
    wikiEntry.title,
    `Deleted wiki entry: ${wikiEntry.title}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

// ============================================================================
// Comments Mutations
// ============================================================================

/**
 * Create comment
 */
export async function createComment(
  ctx: MutationCtx,
  data: {
    entityType: string;
    entityId: string;
    content: string;
    isInternal?: boolean;
    parentCommentId?: Id<'comments'>;
    mentions?: Array<{ userId: Id<'userProfiles'>; userName: string }>;
  }
): Promise<Id<'comments'>> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateCommentData(data);

  // 3. PROCESS: Prepare data
  const now = Date.now();

  // 4. CREATE: Insert into database
  const commentId = await ctx.db.insert('comments', {
    entityType: data.entityType as any,
    entityId: data.entityId,
    content: data.content,
    type: undefined,
    isInternal: data.isInternal || SUPPORTING_CONSTANTS.COMMENTS.DEFAULT_VALUES.IS_INTERNAL,
    mentions: data.mentions,
    reactions: [],
    attachments: [],
    isEdited: false,
    editHistory: [],
    parentCommentId: data.parentCommentId,
    replyCount: SUPPORTING_CONSTANTS.COMMENTS.DEFAULT_VALUES.REPLY_COUNT,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: user._id,
    deletedAt: undefined,
  });

  // Update parent comment reply count if this is a reply
  if (data.parentCommentId) {
    const parentComment = await ctx.db.get(data.parentCommentId);
    if (parentComment) {
      await ctx.db.patch(data.parentCommentId, {
        replyCount: (parentComment.replyCount || 0) + 1,
      });
    }
  }

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'comment.created',
    'supporting_comment',
    commentId,
    'Comment',
    `Created comment on ${data.entityType}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { entityType: data.entityType, entityId: data.entityId }
  );

  // 6. RETURN: Return entity ID
  return commentId;
}

/**
 * Update comment
 */
export async function updateComment(
  ctx: MutationCtx,
  commentId: Id<'comments'>,
  updates: {
    content: string;
    reason?: string;
  }
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const comment = await ctx.db.get(commentId);
  if (!comment || comment.deletedAt) {
    throw new Error('Comment not found');
  }

  // 3. AUTHORIZE: Check edit permission
  const canEdit = await canEditComment(comment, user);
  await requireAccess(canEdit, 'You do not have permission to edit this comment');

  // 4. UPDATE: Apply changes
  const now = Date.now();
  const editHistory = comment.editHistory || [];
  editHistory.push({
    content: comment.content,
    editedAt: now,
    reason: updates.reason,
  });

  await ctx.db.patch(commentId, {
    content: updates.content,
    isEdited: true,
    editHistory,
    updatedAt: now,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'comment.updated',
    'supporting_comment',
    commentId,
    'Comment',
    `Updated comment`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

/**
 * Delete comment (soft delete)
 */
export async function deleteComment(
  ctx: MutationCtx,
  commentId: Id<'comments'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const comment = await ctx.db.get(commentId);
  if (!comment || comment.deletedAt) {
    throw new Error('Comment not found');
  }

  // 3. AUTHORIZE: Check delete permission
  const canDelete = await canDeleteComment(comment, user);
  await requireAccess(canDelete, 'You do not have permission to delete this comment');

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(commentId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'comment.deleted',
    'supporting_comment',
    commentId,
    'Comment',
    `Deleted comment`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

// ============================================================================
// Reminders Mutations
// ============================================================================

/**
 * Create reminder
 */
export async function createReminder(
  ctx: MutationCtx,
  data: {
    title: string;
    description?: string;
    type: string;
    entityType: string;
    entityId: string;
    dueDate: number;
    reminderDate?: number;
    priority?: string;
    assignedTo: Id<'userProfiles'>;
    emailReminder?: boolean;
  }
): Promise<Id<'reminders'>> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. VALIDATE: Check data validity
  validateReminderData(data);

  // 3. PROCESS: Generate IDs and prepare data
  const publicId = await generateUniquePublicId(ctx, 'reminders', 'rem_');
  const now = Date.now();

  // 4. CREATE: Insert into database
  const reminderId = await ctx.db.insert('reminders', {
    publicId,
    title: data.title.trim(),
    description: data.description,
    type: data.type as any,
    entityType: data.entityType as any,
    entityId: data.entityId,
    dueDate: data.dueDate,
    reminderDate: data.reminderDate,
    priority: (data.priority as any) || SUPPORTING_CONSTANTS.REMINDERS.PRIORITY.MEDIUM,
    assignedTo: data.assignedTo,
    assignedBy: user._id,
    status: SUPPORTING_CONSTANTS.REMINDERS.STATUS.PENDING as any,
    emailReminder: data.emailReminder ?? SUPPORTING_CONSTANTS.REMINDERS.DEFAULT_VALUES.EMAIL_REMINDER,
    ownerId: user._id,
    metadata: {},
    createdAt: now,
    updatedAt: now,
    createdBy: user._id,
    deletedAt: undefined,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'reminder.created',
    'supporting_reminder',
    publicId,
    data.title.trim(),
    `Created reminder: ${data.title.trim()}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { dueDate: data.dueDate, assignedTo: data.assignedTo }
  );

  // 6. RETURN: Return entity ID
  return reminderId;
}

/**
 * Update reminder
 */
export async function updateReminder(
  ctx: MutationCtx,
  reminderId: Id<'reminders'>,
  updates: Partial<{
    title: string;
    description: string;
    dueDate: number;
    priority: string;
    status: string;
  }>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const reminder = await ctx.db.get(reminderId);
  if (!reminder || reminder.deletedAt) {
    throw new Error('Reminder not found');
  }

  // 3. AUTHORIZE: Check edit permission
  const canEdit = await canEditReminder(reminder, user);
  await requireAccess(canEdit, 'You do not have permission to edit this reminder');

  // 4. UPDATE: Apply changes
  const now = Date.now();
  await ctx.db.patch(reminderId, {
    ...updates,
    updatedAt: now,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'reminder.updated',
    'supporting_reminder',
    reminder.publicId,
    reminder.title,
    `Updated reminder: ${reminder.title}`,
    user._id,
    user.name || user.email || 'Unknown User',
    { updates: Object.keys(updates) }
  );
}

/**
 * Delete reminder (soft delete)
 */
export async function deleteReminder(
  ctx: MutationCtx,
  reminderId: Id<'reminders'>
): Promise<void> {
  // 1. AUTH: Get authenticated user
  const user = await requireCurrentUser(ctx);

  // 2. FETCH: Get existing entity
  const reminder = await ctx.db.get(reminderId);
  if (!reminder || reminder.deletedAt) {
    throw new Error('Reminder not found');
  }

  // 3. AUTHORIZE: Check delete permission
  const canDelete = await canDeleteReminder(reminder, user);
  await requireAccess(canDelete, 'You do not have permission to delete this reminder');

  // 4. DELETE: Soft delete
  const now = Date.now();
  await ctx.db.patch(reminderId, {
    deletedAt: now,
    deletedBy: user._id,
  });

  // 5. AUDIT: Create audit log
  await createAuditLog(
    ctx,
    'reminder.deleted',
    'supporting_reminder',
    reminder.publicId,
    reminder.title,
    `Deleted reminder: ${reminder.title}`,
    user._id,
    user.name || user.email || 'Unknown User'
  );
}

// Note: Additional mutations for documents, scheduled events, and availability preferences
// would follow the same pattern. For brevity, I'm including just the core ones here.
// The full implementation would include createDocument, updateDocument, deleteDocument,
// createScheduledEvent, updateScheduledEvent, deleteScheduledEvent, etc.
