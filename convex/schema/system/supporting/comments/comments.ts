// convex/schema/system/supporting/comments/comments.ts
// Table definitions for comments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';
import { commentValidators } from './validators';

export const commentsTable = defineTable({
  // Required: Entity reference (comments don't have publicId or ownerId as they're tied to entities)
  entityType: entityTypes.commentable,
  entityId: v.string(),

  // Required: Main display field (content for comments)
  content: v.string(),

  // Comment-specific fields
  type: v.optional(commentValidators.type),
  isInternal: v.boolean(),

  // Mentions
  mentions: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
  }))),

  // Reactions
  reactions: v.optional(v.array(v.object({
    userId: v.id('userProfiles'),
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

  // Threading
  parentCommentId: v.optional(v.id('comments')),
  replyCount: v.optional(v.number()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_created_by', ['createdBy'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_created_at', ['createdAt'])
  .index('by_entity_and_created', ['entityType', 'entityId', 'createdAt']);
