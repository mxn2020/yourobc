// src/features/system/supporting/comments/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Comment = Doc<'systemSupportingComments'>
export type CommentId = Id<'systemSupportingComments'>

export interface CreateCommentData {
  entityType: string
  entityId: string
  content: string
  parentCommentId?: Id<'systemSupportingComments'>
  type?: Comment['type']
  isInternal?: boolean
  mentions?: Array<{
    userId: Id<"userProfiles">
    userName: string
  }>
}

export interface UpdateCommentData {
  content?: string
  type?: Comment['type']
  isInternal?: boolean
}

export interface CommentFilters {
  type?: Comment['type'][]
  isInternal?: boolean
  hasReplies?: boolean
}

export interface CommentThread {
  comment: Comment
  replies: Comment[]
  replyCount: number
}

/**
 * Comment with nested replies - matches the return type from Convex queries
 */
export interface CommentWithReplies extends Comment {
  replies: Comment[]
  replyCount: number
  createdByName?: string
  createdByEmail?: string
}
