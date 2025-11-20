// src/features/yourobc/supporting/comments/hooks/useComments.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { commentsService } from '../services/CommentsService'
import { COMMENT_CONSTANTS } from '../types'
import type {
  CreateCommentData,
  CommentFormData,
  CommentId,
  Comment,
  CommentListItem,
} from '../types'

/**
 * Main hook for comment management by entity
 */
export function useCommentsByEntity(
  entityType: Comment['entityType'],
  entityId: string,
  options?: {
    includeInternal?: boolean
    limit?: number
  }
) {
  const authUser = useAuthenticatedUser()

  const {
    data: commentsData,
    isPending,
    error,
    refetch,
  } = commentsService.useCommentsByEntity(
    authUser?.id!,
    entityType,
    entityId,
    options
  )

  const createMutation = commentsService.useCreateComment()
  const updateMutation = commentsService.useUpdateComment()
  const deleteMutation = commentsService.useDeleteComment()
  const addReactionMutation = commentsService.useAddReaction()

  const createComment = useCallback(async (commentData: CommentFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = commentsService.validateCommentData(commentData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateCommentData = {
      entityType,
      entityId,
      content: commentData.content.trim(),
      type: commentData.type || 'note',
      isInternal: commentData.isInternal || false,
      mentions: commentData.mentions,
      parentCommentId: commentData.parentCommentId,
    }

    return await commentsService.createComment(createMutation, authUser.id, createData)
  }, [authUser, createMutation, entityType, entityId])

  const updateComment = useCallback(async (
    commentId: CommentId,
    updates: {
      content?: string
      isInternal?: boolean
      editReason?: string
    }
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = commentsService.validateCommentData({ content: updates.content })
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await commentsService.updateComment(updateMutation, authUser.id, commentId, updates)
  }, [authUser, updateMutation])

  const deleteComment = useCallback(async (commentId: CommentId) => {
    if (!authUser) throw new Error('Authentication required')
    return await commentsService.deleteComment(deleteMutation, authUser.id, commentId)
  }, [authUser, deleteMutation])

  const addReaction = useCallback(async (commentId: CommentId, reaction: string) => {
    if (!authUser) throw new Error('Authentication required')
    return await commentsService.addReaction(addReactionMutation, authUser.id, commentId, reaction)
  }, [authUser, addReactionMutation])

  const canCreateComments = useMemo(() => {
    if (!authUser) return false
    return true // All authenticated users can comment
  }, [authUser])

  const canEditComment = useCallback((comment: Comment) => {
    if (!authUser) return false
    return comment.createdBy === authUser.id
  }, [authUser])

  const canDeleteComment = useCallback((comment: Comment) => {
    if (!authUser) return false
    return comment.createdBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedComments = useMemo(() => {
    if (!commentsData) return []

    return commentsData.map((comment): CommentListItem => ({
      ...comment,
      displayAuthorName: 'User', // Would be enriched with actual user data
      timeAgo: commentsService.getTimeAgo(comment.createdAt),
      canEdit: canEditComment(comment),
      canDelete: canDeleteComment(comment),
      hasReplies: (comment.replyCount || 0) > 0,
      reactionsSummary: commentsService.summarizeReactions(comment.reactions, authUser?.id),
    }))
  }, [commentsData, authUser, canEditComment, canDeleteComment])

  return {
    comments: enrichedComments,
    isLoading: isPending,
    error,
    refetch,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    canCreateComments,
    canEditComment,
    canDeleteComment,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single comment
 */
export function useComment(commentId?: CommentId) {
  const authUser = useAuthenticatedUser()

  const {
    data: comment,
    isPending,
    error,
    refetch,
  } = commentsService.useComment(authUser?.id!, commentId)

  const canEdit = useMemo(() => {
    if (!authUser || !comment) return false
    return comment.createdBy === authUser.id
  }, [authUser, comment])

  const canDelete = useMemo(() => {
    if (!authUser || !comment) return false
    return comment.createdBy === authUser.id || authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser, comment])

  return {
    comment,
    isLoading: isPending,
    error,
    refetch,
    canEdit,
    canDelete,
  }
}

/**
 * Hook for comment form management
 */
export function useCommentForm(initialData?: Partial<CommentFormData>) {
  const [formData, setFormData] = useState<CommentFormData>({
    content: '',
    type: 'note',
    isInternal: false,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = commentsService.validateCommentData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Content')) errorMap.content = error
      else if (error.includes('mentions')) errorMap.mentions = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: CommentFormData = {
      content: '',
      type: 'note',
      isInternal: false,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}

/**
 * Hook for recent comments
 */
export function useRecentComments(options?: {
  limit?: number
  entityTypes?: Comment['entityType'][]
}) {
  const authUser = useAuthenticatedUser()

  const {
    data: comments,
    isPending,
    error,
  } = commentsService.useRecentComments(authUser?.id!, options)

  const enrichedComments = useMemo(() => {
    if (!comments) return []

    return comments.map((comment): CommentListItem => ({
      ...comment,
      displayAuthorName: 'User',
      timeAgo: commentsService.getTimeAgo(comment.createdAt),
      canEdit: comment.createdBy === authUser?.id,
      canDelete: comment.createdBy === authUser?.id || authUser?.role === 'admin' || authUser?.role === 'superadmin',
      hasReplies: (comment.replyCount || 0) > 0,
      reactionsSummary: commentsService.summarizeReactions(comment.reactions, authUser?.id),
    }))
  }, [comments, authUser])

  return {
    comments: enrichedComments,
    isLoading: isPending,
    error,
  }
}

/**
 * Hook for comment thread (replies)
 */
export function useCommentThread(threadId?: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: replies,
    isPending,
    error,
    refetch,
  } = commentsService.useCommentThread(authUser?.id!, threadId)

  const enrichedReplies = useMemo(() => {
    if (!replies) return []

    return replies.map((comment): CommentListItem => ({
      ...comment,
      displayAuthorName: 'User',
      timeAgo: commentsService.getTimeAgo(comment.createdAt),
      canEdit: comment.createdBy === authUser?.id,
      canDelete: comment.createdBy === authUser?.id || authUser?.role === 'admin' || authUser?.role === 'superadmin',
      hasReplies: false,
      reactionsSummary: commentsService.summarizeReactions(comment.reactions, authUser?.id),
    }))
  }, [replies, authUser])

  return {
    replies: enrichedReplies,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for standalone comment mutations (for pages like CommentsPage)
 * These mutations don't require entity context - they operate on comments directly
 */
export function useCommentMutations() {
  const authUser = useAuthenticatedUser()

  const createMutation = commentsService.useCreateComment()
  const updateMutation = commentsService.useUpdateComment()
  const deleteMutation = commentsService.useDeleteComment()
  const addReactionMutation = commentsService.useAddReaction()

  const createComment = useCallback(async (
    entityType: Comment['entityType'],
    entityId: string,
    commentData: CommentFormData
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = commentsService.validateCommentData(commentData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateCommentData = {
      entityType,
      entityId,
      content: commentData.content.trim(),
      type: commentData.type || 'note',
      isInternal: commentData.isInternal || false,
      mentions: commentData.mentions,
      parentCommentId: commentData.parentCommentId,
    }

    return await commentsService.createComment(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateComment = useCallback(async (
    commentId: CommentId,
    updates: {
      content?: string
      isInternal?: boolean
      editReason?: string
    }
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = commentsService.validateCommentData({ content: updates.content })
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await commentsService.updateComment(updateMutation, authUser.id, commentId, updates)
  }, [authUser, updateMutation])

  const deleteComment = useCallback(async (commentId: CommentId) => {
    if (!authUser) throw new Error('Authentication required')
    return await commentsService.deleteComment(deleteMutation, authUser.id, commentId)
  }, [authUser, deleteMutation])

  const addReaction = useCallback(async (commentId: CommentId, reaction: string) => {
    if (!authUser) throw new Error('Authentication required')
    return await commentsService.addReaction(addReactionMutation, authUser.id, commentId, reaction)
  }, [authUser, addReactionMutation])

  return {
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
