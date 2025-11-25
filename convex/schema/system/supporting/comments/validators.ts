// convex/schema/system/supporting/comments/validators.ts
// Validators for comments module

import { v } from 'convex/values';

// Simple validators
export const commentsValidators = {
  commentType: v.union(
    v.literal('general'),
    v.literal('note'),
    v.literal('question'),
    v.literal('answer'),
    v.literal('review')
  ),
} as const;

// Complex field validators
export const commentsFields = {
  mention: v.object({
    userId: v.id('userProfiles'),
    userName: v.string(),
  }),

  reaction: v.object({
    userId: v.string(),
    reaction: v.string(),
    createdAt: v.number(),
  }),

  attachment: v.object({
    filename: v.string(),
    fileUrl: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
  }),

  editHistoryEntry: v.object({
    content: v.string(),
    editedAt: v.number(),
    editedBy: v.string(),
    reason: v.optional(v.string()),
  }),
} as const;
