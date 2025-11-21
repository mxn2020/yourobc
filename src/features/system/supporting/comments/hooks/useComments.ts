// src/features/system/supporting/comments/hooks/useComments.ts

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type { CreateCommentData, UpdateCommentData, CommentFilters } from '../types'

/**
 * Hook to fetch comments for an entity
 */
export function useEntityComments(
  entityType: string,
  entityId: string
) {
  return useQuery(
    api.lib.system.supporting.comments.queries.getCommentsByEntity,
    entityType && entityId
      ? { entityType: entityType, entityId }
      : 'skip'
  )
}

/**
 * Hook to fetch a single comment
 */
export function useComment(commentId?: Id<'comments'>) {
  return useQuery(
    api.lib.system.supporting.comments.queries.getComment,
    commentId
      ? { commentId }
      : 'skip'
  )
}

/**
 * Hook to fetch comment thread (comment + replies)
 */
export function useCommentThread(threadId?: Id<'comments'>) {
  return useQuery(
    api.lib.system.supporting.comments.queries.getCommentThread,
    threadId
      ? { threadId }
      : 'skip'
  )
}

/**
 * Hook to create a comment
 */
export function useCreateComment() {
  return useMutation(api.lib.system.supporting.comments.mutations.createComment)
}

/**
 * Hook to update a comment
 */
export function useUpdateComment() {
  return useMutation(api.lib.system.supporting.comments.mutations.updateComment)
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  return useMutation(api.lib.system.supporting.comments.mutations.deleteComment)
}

/**
 * Hook to add a reaction to a comment
 * Note: This hook automatically toggles the reaction - if it exists, it removes it; if it doesn't exist, it adds it
 */
export function useAddCommentReaction() {
  return useMutation(api.lib.system.supporting.comments.mutations.addCommentReaction)
}
