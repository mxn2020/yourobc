// convex/lib/system/supporting/comments/types.ts
// Type definitions for system comments module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  CommentSchema,
  CommentType,
  CommentMention,
  CommentAttachment,
} from '@/schema/system/supporting/comments/types';

export type SystemComment = Doc<'systemSupportingComments'>;
export type SystemCommentId = Id<'systemSupportingComments'>;

export interface CreateSystemCommentData {
  name: string;
  content: string;
  entityType: string;
  entityId: string;
  type?: CommentType;
  isInternal: boolean;
  mentions?: CommentMention[];
  attachments?: CommentAttachment[];
  parentCommentId?: Id<'systemSupportingComments'> | null;
}

export interface UpdateSystemCommentData {
  name?: string;
  content?: string;
  isInternal?: boolean;
  mentions?: CommentMention[];
  attachments?: CommentAttachment[];
}

export interface SystemCommentFilters {
  entityType?: string;
  entityId?: string;
  isInternal?: boolean;
  parentCommentId?: Id<'systemSupportingComments'> | null;
}

export interface SystemCommentListResponse {
  items: SystemComment[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

export type SystemCommentSchema = CommentSchema;
export type SystemCommentType = CommentType;
export type SystemCommentMention = CommentMention;
export type SystemCommentAttachment = CommentAttachment;
