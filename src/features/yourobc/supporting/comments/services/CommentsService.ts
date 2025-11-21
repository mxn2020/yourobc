// src/features/yourobc/supporting/comments/services/CommentsService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateCommentData,
  CommentFormData,
  Comment,
} from '../types'

export class CommentsService {
  // Query hooks for comment data fetching
  useCommentsByEntity(
    authUserId: string,
    entityType: Comment['entityType'],
    entityId: string,
    options?: {
      includeInternal?: boolean
      limit?: number
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.comments.queries.getCommentsByEntity, {
        authUserId,
        entityType,
        entityId,
        includeInternal: options?.includeInternal,
        limit: options?.limit,
      }),
      staleTime: 30000, // 30 seconds
      enabled: !!authUserId && !!entityType && !!entityId,
    })
  }

  useComment(authUserId: string, commentId?: Id<'comments'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.comments.queries.getComment, {
        authUserId,
        commentId: commentId!,
      }),
      staleTime: 60000,
      enabled: !!authUserId && !!commentId,
    })
  }

  useCommentThread(authUserId: string, threadId?: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.comments.queries.getCommentThread, {
        authUserId,
        threadId: threadId!,
      }),
      staleTime: 30000,
      enabled: !!authUserId && !!threadId,
    })
  }

  useRecentComments(
    authUserId: string,
    options?: {
      limit?: number
      entityTypes?: Comment['entityType'][]
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.supporting.comments.queries.getRecentComments, {
        authUserId,
        limit: options?.limit,
        entityTypes: options?.entityTypes,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for comment modifications
  useCreateComment() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.comments.mutations.createComment),
    })
  }

  useUpdateComment() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.comments.mutations.updateComment),
    })
  }

  useDeleteComment() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.comments.mutations.deleteComment),
    })
  }

  useAddReaction() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.supporting.comments.mutations.addCommentReaction),
    })
  }

  // Business operations using mutations
  async createComment(
    mutation: ReturnType<typeof this.useCreateComment>,
    authUserId: string,
    data: CreateCommentData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create comment: ${error.message}`)
    }
  }

  async updateComment(
    mutation: ReturnType<typeof this.useUpdateComment>,
    authUserId: string,
    commentId: Id<'comments'>,
    data: {
      content?: string
      isInternal?: boolean
      editReason?: string
    }
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, commentId, data })
    } catch (error: any) {
      throw new Error(`Failed to update comment: ${error.message}`)
    }
  }

  async deleteComment(
    mutation: ReturnType<typeof this.useDeleteComment>,
    authUserId: string,
    commentId: Id<'comments'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, commentId })
    } catch (error: any) {
      throw new Error(`Failed to delete comment: ${error.message}`)
    }
  }

  async addReaction(
    mutation: ReturnType<typeof this.useAddReaction>,
    authUserId: string,
    commentId: Id<'comments'>,
    reaction: string
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, commentId, reaction })
    } catch (error: any) {
      throw new Error(`Failed to add reaction: ${error.message}`)
    }
  }

  // Utility functions for data processing
  validateCommentData(data: Partial<CommentFormData>): string[] {
    const errors: string[] = []

    if (data.content !== undefined) {
      if (!data.content.trim()) {
        errors.push('Content is required')
      }

      if (data.content.length > 5000) {
        errors.push('Content must be less than 5000 characters')
      }
    }

    if (data.mentions && data.mentions.length > 20) {
      errors.push('Maximum 20 mentions allowed')
    }

    return errors
  }

  formatCommentContent(content: string, maxLength?: number): string {
    if (maxLength && content.length > maxLength) {
      return content.substring(0, maxLength) + '...'
    }
    return content
  }

  getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'just now'

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`

    const years = Math.floor(days / 365)
    return `${years}y ago`
  }

  formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  highlightMentions(content: string): string {
    return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')
  }

  summarizeReactions(reactions?: Array<{ userId: string; reaction: string; createdAt: number }>, currentUserId?: string) {
    if (!reactions || reactions.length === 0) return []

    const reactionMap = new Map<string, { count: number; userReacted: boolean }>()

    reactions.forEach(r => {
      const existing = reactionMap.get(r.reaction) || { count: 0, userReacted: false }
      existing.count++
      if (currentUserId && r.userId === currentUserId) {
        existing.userReacted = true
      }
      reactionMap.set(r.reaction, existing)
    })

    return Array.from(reactionMap.entries()).map(([reaction, data]) => ({
      reaction,
      count: data.count,
      userReacted: data.userReacted,
    }))
  }
}

export const commentsService = new CommentsService()
