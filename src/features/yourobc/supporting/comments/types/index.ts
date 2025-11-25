// src/features/yourobc/supporting/comments/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

// Base types from Convex schema
export type Comment = Doc<'yourobcComments'>
export type CommentId = Id<'yourobcComments'>

// Re-export types from convex for consistency
export type {
  CreateCommentData,
} from '@/convex/lib/yourobc/supporting/comments/types'

// Extended comment type with additional computed fields
export interface CommentWithDetails extends Comment {
  author?: {
    name: string
    email?: string
    avatar?: string
  } | null
  entityInfo?: {
    entityType: string
    entityName: string
    entityUrl?: string
  } | null
  reactionsSummary?: {
    reaction: string
    count: number
    userReacted: boolean
  }[]
}

// UI-specific types
export interface CommentFormData {
  content: string
  type?: Comment['type']
  isInternal?: boolean
  mentions?: Array<{
    userId: string
    userName: string
  }>
  parentCommentId?: CommentId
}

export interface CommentListItem extends CommentWithDetails {
  displayAuthorName?: string
  timeAgo?: string
  canEdit?: boolean
  canDelete?: boolean
  hasReplies?: boolean
}

export interface CommentDetailsProps {
  comment: CommentWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReply?: () => void
}

export interface CommentCardProps {
  comment: CommentListItem
  onClick?: (comment: CommentListItem) => void
  showReplies?: boolean
  compact?: boolean
  showActions?: boolean
  onReply?: (commentId: CommentId) => void
}

// Business logic types
export interface CommentCreationParams {
  commentData: CommentFormData
  entityType: Comment['entityType']
  entityId: string
}

export interface CommentUpdateParams {
  commentId: CommentId
  updates: {
    content?: string
    isInternal?: boolean
    editReason?: string
  }
}

export interface CommentFilters {
  entityType?: Comment['entityType']
  entityId?: string
  type?: Comment['type'][]
  isInternal?: boolean
  includeDeleted?: boolean
  authorId?: string
  dateRange?: {
    start: number
    end: number
  }
}

export interface CommentStats {
  totalComments: number
  internalComments: number
  publicComments: number
  commentsByType: Record<string, number>
  commentsByEntity: Record<string, number>
  recentComments: number
  topCommenters: Array<{
    userId: string
    userName: string
    commentCount: number
  }>
}

// Export constants
export const COMMENT_CONSTANTS = {
  TYPE: {
    NOTE: 'note' as const,
    STATUS_UPDATE: 'status_update' as const,
    CUSTOMER_COMMUNICATION: 'customer_communication' as const,
    INTERNAL: 'internal' as const,
  },
  ENTITY_TYPE: {
    CUSTOMER: 'yourobc_customer' as const,
    QUOTE: 'yourobc_quote' as const,
    SHIPMENT: 'yourobc_shipment' as const,
    INVOICE: 'yourobc_invoice' as const,
    EMPLOYEE: 'yourobc_employee' as const,
    PARTNER: 'yourobc_partner' as const,
    COURIER: 'yourobc_courier' as const,
  },
  LIMITS: {
    MAX_CONTENT_LENGTH: 5000,
    MAX_MENTIONS: 20,
  },
  PERMISSIONS: {
    VIEW: 'comments.view',
    CREATE: 'comments.create',
    EDIT: 'comments.edit',
    DELETE: 'comments.delete',
    VIEW_INTERNAL: 'comments.view_internal',
    REACT: 'comments.react',
  },
} as const

export const COMMENT_TYPE_COLORS = {
  [COMMENT_CONSTANTS.TYPE.NOTE]: '#6b7280',
  [COMMENT_CONSTANTS.TYPE.STATUS_UPDATE]: '#3b82f6',
  [COMMENT_CONSTANTS.TYPE.CUSTOMER_COMMUNICATION]: '#10b981',
  [COMMENT_CONSTANTS.TYPE.INTERNAL]: '#f59e0b',
} as const

export const COMMENT_TYPE_LABELS = {
  [COMMENT_CONSTANTS.TYPE.NOTE]: 'Note',
  [COMMENT_CONSTANTS.TYPE.STATUS_UPDATE]: 'Status Update',
  [COMMENT_CONSTANTS.TYPE.CUSTOMER_COMMUNICATION]: 'Customer Communication',
  [COMMENT_CONSTANTS.TYPE.INTERNAL]: 'Internal',
} as const

// Re-export ENTITY_TYPE_LABELS from shared module (single source of truth)
export { ENTITY_TYPE_LABELS } from '../../shared'

// Common reactions
export const COMMON_REACTIONS = [
  { emoji: '👍', label: 'Like', value: 'like' },
  { emoji: '❤️', label: 'Love', value: 'love' },
  { emoji: '👏', label: 'Applause', value: 'applause' },
  { emoji: '🎉', label: 'Celebrate', value: 'celebrate' },
  { emoji: '🤔', label: 'Thinking', value: 'thinking' },
  { emoji: '👀', label: 'Eyes', value: 'eyes' },
] as const
