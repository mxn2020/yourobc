// src/features/yourobc/supporting/comments/index.ts

// === Types ===
export type {
  Comment,
  CommentId,
  CreateCommentData,
  CommentWithDetails,
  CommentFormData,
  CommentListItem,
  CommentDetailsProps,
  CommentCardProps,
  CommentCreationParams,
  CommentUpdateParams,
  CommentFilters,
  CommentStats,
} from './types'

export {
  COMMENT_CONSTANTS,
  COMMENT_TYPE_COLORS,
  COMMENT_TYPE_LABELS,
  COMMON_REACTIONS,
} from './types'

// === Services ===
export { CommentsService, commentsService } from './services/CommentsService'

// === Hooks ===
export {
  useCommentsByEntity,
  useComment,
  useCommentForm,
  useRecentComments,
  useCommentThread,
} from './hooks/useComments'

// === Components ===
export { CommentCard } from './components/CommentCard'
export { CommentForm } from './components/CommentForm'
export { CommentList } from './components/CommentList'
export { CommentsSection } from './components/CommentsSection'
