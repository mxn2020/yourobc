// convex/lib/boilerplate/supporting/comments/types.ts

/**
 * Comments Module Types
 * Type definitions for comment operations and data structures
 */
import type { Doc, Id } from '@/generated/dataModel'

export type Comment = Doc<'comments'>
export type CommentId = Id<'comments'>

/**
 * Mention structure
 */
export type Mentions = {
  userId: Id<'userProfiles'>
  userName: string
}

/**
 * Reaction structure
 */
export type Reaction = {
  userId: Id<'userProfiles'>
  reaction: string // emoji or reaction type
  createdAt: number
}

/**
 * Attachment structure
 */
export type Attachment = {
  filename: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

/**
 * Edit history entry
 */
export type EditHistoryEntry = {
  content: string
  editedAt: number
  reason?: string
}

/**
 * Data required to create a comment
 */
export interface CreateCommentData {
  entityType: Comment['entityType']
  entityId: string
  content: string
  type?: Comment['type']
  isInternal?: boolean
  mentions?: Mentions[]
  attachments?: Attachment[]
  parentCommentId?: CommentId
}

/**
 * Data required to update a comment
 */
export interface UpdateCommentData {
  content?: string
  type?: Comment['type']
  isInternal?: boolean
  reason?: string // reason for edit (added to edit history)
}

/**
 * Comment filter options for queries
 */
export interface CommentFilters {
  entityType?: string
  entityId?: string
  type?: string
  isInternal?: boolean
  parentCommentId?: CommentId
  userId?: Id<'userProfiles'> // comments by specific user
}

/**
 * Comment thread - a comment with its replies
 */
export interface CommentThread extends Comment {
  replies: Comment[]
  replyCount: number
}
