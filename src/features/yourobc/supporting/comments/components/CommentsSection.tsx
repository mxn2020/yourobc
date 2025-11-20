// src/features/yourobc/supporting/comments/components/CommentsSection.tsx

import React from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentList } from './CommentList'
import { useCommentsByEntity } from '../hooks/useComments'
import { isCommentsEnabled } from '../../config'
import type { Comment, CommentId, CommentFormData } from '../types'

export interface CommentsSectionProps {
  entityType: Comment['entityType']
  entityId: string
  title?: string
  showInternalComments?: boolean
  limit?: number
  className?: string
}

/**
 * Reusable comments section component that can be used in any YourOBC entity detail page
 *
 * @example
 * // In CustomerDetailsPage
 * <CommentsSection
 *   entityType="yourobc_customer"
 *   entityId={customerId}
 *   title="Customer Comments"
 *   showInternalComments={true}
 * />
 *
 * @example
 * // In ShipmentDetailsPage
 * <CommentsSection
 *   entityType="yourobc_shipment"
 *   entityId={shipmentId}
 *   title="Shipment Notes"
 * />
 */
export function CommentsSection({
  entityType,
  entityId,
  title = 'Comments',
  showInternalComments = true,
  limit,
  className = '',
}: CommentsSectionProps) {
  // Check if comments feature is enabled
  if (!isCommentsEnabled()) {
    return null
  }
  const {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    canCreateComments,
  } = useCommentsByEntity(entityType, entityId, {
    includeInternal: showInternalComments,
    limit,
  })

  // Wrapper functions to match the expected interface
  const handleCreateComment = async (data: CommentFormData): Promise<void> => {
    await createComment(data)
  }

  const handleEditComment = async (
    commentId: CommentId, 
    data: { content?: string; isInternal?: boolean }
  ): Promise<void> => {
    await updateComment(commentId, {
      content: data.content,
      isInternal: data.isInternal,
    })
  }

  const handleDeleteComment = async (commentId: CommentId): Promise<void> => {
    await deleteComment(commentId)
  }

  const handleReaction = async (commentId: CommentId, reaction: string): Promise<void> => {
    await addReaction(commentId, reaction)
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {!isLoading && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {comments.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-6">
        <CommentList
          comments={comments}
          isLoading={isLoading}
          error={error}
          onCreateComment={handleCreateComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
          onReaction={handleReaction}
          canCreateComments={canCreateComments}
          showForm={canCreateComments}
        />
      </div>
    </div>
  )
}
