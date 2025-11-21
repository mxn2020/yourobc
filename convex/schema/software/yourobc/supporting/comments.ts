// convex/schema/software/yourobc/supporting/comments.ts
/**
 * Comments Table Schema
 *
 * Tracks comments and notes on entities with threading and reactions.
 * Supports mentions, attachments, edit history, and nested replies.
 *
 * @module convex/schema/software/yourobc/supporting/comments
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { entityTypes } from '../../../../lib/system/audit_logs/entityTypes'
import {
  commentTypeValidator,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Comments table
 * Tracks comments and notes on entities with threading and reactions
 */
export const commentsTable = defineTable({
  // Core fields
  entityType: entityTypes.commentable,
  entityId: v.string(),
  content: v.string(),
  type: v.optional(commentTypeValidator),
  isInternal: v.boolean(),

  // Reactions & Mentions
  mentions: v.optional(v.array(v.object({
    userId: v.string(),
    userName: v.string(),
  }))),
  reactions: v.optional(v.array(v.object({
    userId: v.string(),
    reaction: v.string(),
    createdAt: v.number(),
  }))),

  // Attachments
  attachments: v.optional(v.array(v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }))),

  // Edit History
  isEdited: v.optional(v.boolean()),
  editHistory: v.optional(v.array(v.object({
    content: v.string(),
    editedAt: v.number(),
    reason: v.optional(v.string()),
  }))),

  // Replies & Threading
  parentCommentId: v.optional(v.id('yourobcComments')),
  replies: v.optional(v.array(v.any())), // Will be populated at query time
  replyCount: v.optional(v.number()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created', ['createdAt'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_deleted', ['deletedAt'])
