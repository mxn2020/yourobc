// convex/schema/system/supporting/comments/types.ts
// Type definitions for comments module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { commentsValidators, commentsFields } from './validators';
import { commentsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Comment = Doc<'comments'>;
export type CommentId = Id<'comments'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type CommentSchema = Infer<typeof commentsTable.validator>;

// ============================================
// Validator Types
// ============================================

export type CommentType = Infer<typeof commentsValidators.commentType>;

// ============================================
// Field Types
// ============================================

export type CommentMention = Infer<typeof commentsFields.mention>;
export type CommentReaction = Infer<typeof commentsFields.reaction>;
export type CommentAttachment = Infer<typeof commentsFields.attachment>;
export type CommentEditHistoryEntry = Infer<typeof commentsFields.editHistoryEntry>;
