// convex/schema/yourobc/supporting/comments.ts
/**
 * Comments Table Schema
 *
 * Tracks comments and notes on entities with threading and reactions.
 * Supports mentions, attachments, edit history, and nested replies.
 *
 * @module convex/schema/yourobc/supporting/comments
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '@/config/entityTypes'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';

/**
 * Comments table
 * Tracks comments and notes on entities with threading and reactions
 */
export const commentsTable = defineTable({
  // Core fields
  entityType: entityTypes.commentable,
  entityId: v.string(),
  content: v.string(),
  type: v.optional(supportingValidators.commentType),
  isInternal: v.boolean(),

  // Reactions & Mentions
  mentions: v.optional(v.array(supportingFields.mention)),
  reactions: v.optional(v.array(supportingFields.reaction)),

  // Attachments
  attachments: v.optional(v.array(supportingFields.attachment)),

  // Edit History
  isEdited: v.optional(v.boolean()),
  editHistory: v.optional(v.array(supportingFields.editHistoryEntry)),

  // Replies & Threading
  parentCommentId: v.optional(v.id('comments')),
  replies: v.optional(v.array(v.any())), // Will be populated at query time
  replyCount: v.optional(v.number()),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_deleted', ['deletedAt'])
