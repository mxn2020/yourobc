// convex/lib/yourobc/supporting/comments/types.ts
// TypeScript type definitions for comments module

import type { Doc, Id } from '@/generated/dataModel';
import type { CommentType } from '@/schema/yourobc/supporting/comments/types';

// Entity types
export type Comment = Doc<'yourobcComments'>;
export type CommentId = Id<'yourobcComments'>;

// Nested types
export interface Mention {
  userId: string;
  userName: string;
}

export interface Reaction {
  userId: string;
  reaction: string;
  createdAt: number;
}

export interface Attachment {
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface EditHistoryEntry {
  content: string;
  editedAt: number;
  reason?: string;
}

// Create operation
export interface CreateCommentData {
  entityType: string;
  entityId: string;
  content: string;
  type?: CommentType;
  isInternal?: boolean;
  mentions?: Mention[];
  attachments?: Attachment[];
  parentCommentId?: CommentId;
}

// Update operation
export interface UpdateCommentData {
  content?: string;
  isInternal?: boolean;
  mentions?: Mention[];
  attachments?: Attachment[];
}

// List response
export interface CommentListResponse {
  items: Comment[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface CommentFilters {
  entityType?: string;
  entityId?: string;
  type?: CommentType;
  isInternal?: boolean;
  parentCommentId?: CommentId;
}

// Reaction payload
export interface AddReactionData {
  commentId: CommentId;
  reaction: string;
}

export interface RemoveReactionData {
  commentId: CommentId;
  reaction: string;
}
