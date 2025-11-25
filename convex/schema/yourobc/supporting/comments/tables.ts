// convex/schema/yourobc/supporting/comments/comments.ts
// Table definitions for comments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { entityTypes } from '@/config/entityTypes';
import { auditFields, softDeleteFields } from '@/schema/base';
import { commentsValidators, commentsFields } from './validators';

/**
 * Comments table
 * Tracks comments and notes on entities with threading and reactions
 */
export const commentsTable = defineTable({
  // Core fields
  entityType: entityTypes.commentable,
  entityId: v.string(),
  content: v.string(),
  type: v.optional(commentsValidators.commentType),
  isInternal: v.boolean(),

  // Reactions & Mentions
  mentions: v.optional(v.array(commentsFields.mention)),
  reactions: v.optional(v.array(commentsFields.reaction)),

  // Attachments
  attachments: v.optional(v.array(commentsFields.attachment)),

  // Edit History
  isEdited: v.optional(v.boolean()),
  editHistory: v.optional(v.array(commentsFields.editHistoryEntry)),

  // Replies & Threading
  parentCommentId: v.optional(v.id('yourobcComments')),
  replyCount: v.optional(v.number()),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Standard required indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created_at', ['createdAt'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_deleted_at', ['deletedAt']);
