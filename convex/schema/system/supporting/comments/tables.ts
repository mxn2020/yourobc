// convex/schema/system/supporting/comments/tables.ts
// Table definitions for comments

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { commentsValidators, commentsFields } from './validators';

export const commentsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Entity relationship
  entityType: v.string(),
  entityId: v.string(),

  // Comment content
  content: v.string(),
  type: v.optional(commentsValidators.commentType),
  isInternal: v.boolean(),

  // Mentions & Reactions
  mentions: v.optional(v.array(commentsFields.mention)),
  reactions: v.optional(v.array(commentsFields.reaction)),

  // Attachments
  attachments: v.optional(v.array(commentsFields.attachment)),

  // Edit History
  isEdited: v.optional(v.boolean()),
  editHistory: v.optional(v.array(commentsFields.editHistoryEntry)),

  // Threading
  parentCommentId: v.optional(v.id('systemSupportingComments')),
  replyCount: v.optional(v.number()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_entity', ['entityType', 'entityId'])
  .index('by_parent', ['parentCommentId'])
  .index('by_internal', ['isInternal'])
  .index('by_created_at', ['createdAt']);
