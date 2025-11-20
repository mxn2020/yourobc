// convex/lib/boilerplate/supporting/comments/index.ts

/**
 * Comments Module
 * Universal commenting system for all commentable entities
 *
 * Features:
 * - Threaded comments (parent-child relationships)
 * - Mentions (@user support)
 * - Reactions (emoji responses)
 * - Attachments
 * - Edit history tracking
 * - Internal/external comment types
 * - Soft delete with cascade
 *
 * @module convex/lib/boilerplate/supporting/comments
 */

// Export constants
export { COMMENT_CONSTANTS } from './constants'

// Export types
export type {
  Comment,
  CommentId,
  Mentions,
  Reaction,
  Attachment,
  EditHistoryEntry,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentThread,
} from './types'

// Export queries
export {
  getCommentsByEntity,
  getComment,
  getCommentThread,
  getRecentComments,
  getComments,
} from './queries'

// Export mutations
export {
  createComment,
  updateComment,
  deleteComment,
  addCommentReaction,
  removeCommentReaction,
} from './mutations'

// Export utilities
export {
  validateCreateCommentData,
  validateUpdateCommentData,
  canEditComment,
  canDeleteComment,
  buildCommentTree,
  flattenCommentTree,
  getMentionedUserIds,
  extractMentions,
} from './utils'
