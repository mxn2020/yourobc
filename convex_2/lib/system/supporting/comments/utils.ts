// convex/lib/system/supporting/comments/utils.ts

/**
 * Comments Module Utilities
 * Validation and helper functions for comment operations
 */
import { Id } from '@/generated/dataModel'
import { COMMENT_CONSTANTS } from './constants'
import type { CreateCommentData, UpdateCommentData } from './types'

/**
 * Validate comment data for create operation
 * @param data - Partial comment data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCreateCommentData(data: Partial<CreateCommentData>): string[] {
  const errors: string[] = []

  // Content validation
  if (data.content !== undefined) {
    if (!data.content.trim()) {
      errors.push('Content is required')
    } else if (data.content.length > COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content must be less than ${COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`)
    }
  }

  // Mentions validation
  if (data.mentions && data.mentions.length > COMMENT_CONSTANTS.LIMITS.MAX_MENTIONS) {
    errors.push(`Maximum ${COMMENT_CONSTANTS.LIMITS.MAX_MENTIONS} mentions allowed`)
  }

  // Attachments validation
  if (data.attachments) {
    if (data.attachments.length > COMMENT_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
      errors.push(`Maximum ${COMMENT_CONSTANTS.LIMITS.MAX_ATTACHMENTS} attachments allowed`)
    }

    // Validate individual attachment sizes
    data.attachments.forEach((attachment, index) => {
      if (attachment.fileSize > COMMENT_CONSTANTS.LIMITS.MAX_ATTACHMENT_SIZE) {
        errors.push(`Attachment ${index + 1} exceeds maximum size of ${COMMENT_CONSTANTS.LIMITS.MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB`)
      }
    })
  }

  return errors
}

/**
 * Validate comment data for update operation
 * @param data - Partial comment data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUpdateCommentData(data: Partial<UpdateCommentData>): string[] {
  const errors: string[] = []

  // Content validation
  if (data.content !== undefined) {
    if (!data.content.trim()) {
      errors.push('Content is required')
    } else if (data.content.length > COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content must be less than ${COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`)
    }
  }

  return errors
}

/**
 * Check if a user can edit a comment
 * @param userId - ID of the user attempting the edit
 * @param comment - The comment to edit
 * @returns true if user can edit, false otherwise
 */
export function canEditComment(userId: Id<'userProfiles'>, comment: { createdBy: Id<'userProfiles'> }): boolean {
  return comment.createdBy === userId
}

/**
 * Check if a user can delete a comment
 * @param userId - ID of the user attempting the delete
 * @param comment - The comment to delete
 * @param isAdmin - Whether the user is an admin
 * @returns true if user can delete, false otherwise
 */
export function canDeleteComment(userId: Id<'userProfiles'>, comment: { createdBy: Id<'userProfiles'> }, isAdmin: boolean): boolean {
  return comment.createdBy === userId || isAdmin
}

/**
 * Build a nested comment tree structure from flat comment list
 * @param comments - Flat array of comments
 * @returns Array of top-level comments with nested replies
 */
export function buildCommentTree<T extends { _id: string; parentCommentId?: string | null }>(comments: T[]): (T & { replies: T[] })[] {
  const commentMap = new Map<string, T & { replies: T[] }>()
  const rootComments: (T & { replies: T[] })[] = []

  // First pass: create map of all comments with empty replies
  comments.forEach(comment => {
    commentMap.set(comment._id, { ...comment, replies: [] })
  })

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment._id)!
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId)
      if (parent) {
        parent.replies.push(commentWithReplies)
      }
    } else {
      rootComments.push(commentWithReplies)
    }
  })

  return rootComments
}

/**
 * Flatten a nested comment tree into a flat array
 * @param commentTree - Array of comments with nested replies
 * @returns Flat array of all comments
 */
export function flattenCommentTree<T extends { replies?: T[] }>(commentTree: T[]): Omit<T, 'replies'>[] {
  const flat: Omit<T, 'replies'>[] = []

  function flatten(comment: T) {
    const { replies, ...commentWithoutReplies } = comment
    flat.push(commentWithoutReplies as Omit<T, 'replies'>)
    if (replies && replies.length > 0) {
      replies.forEach(reply => flatten(reply))
    }
  }

  commentTree.forEach(comment => flatten(comment))
  return flat
}

/**
 * Extract user IDs from mentions in a comment
 * @param comment - Comment with mentions
 * @returns Array of user IDs mentioned
 */
export function getMentionedUserIds(comment: { mentions?: Array<{ userId: Id<'userProfiles'>; userName: string }> }): string[] {
  if (!comment.mentions || comment.mentions.length === 0) {
    return []
  }
  return comment.mentions.map(m => m.userId)
}

/**
 * Extract mentions from comment content
 * Looks for @username patterns in the content
 * @param content - Comment content text
 * @returns Array of usernames mentioned (without @ symbol)
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}
