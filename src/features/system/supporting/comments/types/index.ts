// src/features/boilerplate/supporting/comments/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type Comment = Doc<'comments'>
export type CommentId = Id<'comments'>

export interface CreateCommentData {
  entityType: string
  entityId: string
  content: string
  parentCommentId?: Id<'comments'>
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
