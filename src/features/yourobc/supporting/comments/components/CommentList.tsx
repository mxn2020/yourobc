// src/features/yourobc/supporting/comments/components/CommentList.tsx

import React, { useState } from 'react'
import { MessageSquare, AlertCircle } from 'lucide-react'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'
import { DeleteConfirmationModal } from '@/components/ui/Modals/DeleteConfirmationModal'
import { useAuth } from '@/features/system/auth'
import { commentsService } from '../services/CommentsService'
import type { CommentListItem, CommentId, Comment, CommentFormData } from '../types'

export interface CommentListProps {
  comments: CommentListItem[]
  isLoading?: boolean
  error?: Error | null
  onCreateComment: (data: CommentFormData) => Promise<void>
  onEditComment?: (commentId: CommentId, data: { content?: string; isInternal?: boolean }) => Promise<void>
  onDeleteComment?: (commentId: CommentId) => Promise<void>
  onReaction?: (commentId: CommentId, reaction: string) => Promise<void>
  canCreateComments?: boolean
  showForm?: boolean
  emptyMessage?: string
  className?: string
}

export function CommentList({
  comments,
  isLoading = false,
  error = null,
  onCreateComment,
  onEditComment,
  onDeleteComment,
  onReaction,
  canCreateComments = true,
  showForm = true,
  emptyMessage = 'No comments yet. Be the first to comment!',
  className = '',
}: CommentListProps) {
  const { auth, user } = useAuth()
  const [replyingTo, setReplyingTo] = useState<CommentId | null>(null)
  const [editingComment, setEditingComment] = useState<CommentListItem | null>(null)
  const [deletingComment, setDeletingComment] = useState<CommentListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Helper to enrich reply with permissions
  const enrichReply = (reply: any): CommentListItem => {
    const canEdit = auth?.id === reply.createdBy
    const canDelete = auth?.id === reply.createdBy || user?.role === 'admin' || user?.role === 'superadmin'

    return {
      ...reply,
      displayAuthorName: 'User',
      timeAgo: commentsService.getTimeAgo(reply.createdAt),
      canEdit,
      canDelete,
      hasReplies: false,
      reactionsSummary: commentsService.summarizeReactions(reply.reactions, auth?.id),
    }
  }

  const handleReply = async (data: CommentFormData) => {
    if (!replyingTo) return

    await onCreateComment({
      ...data,
      parentCommentId: replyingTo,
    })

    setReplyingTo(null)
  }

  const handleEdit = async (data: CommentFormData) => {
    if (!editingComment || !onEditComment) return

    await onEditComment(editingComment._id, {
      content: data.content,
      isInternal: data.isInternal,
    })

    setEditingComment(null)
  }

  const handleDeleteClick = (comment: CommentListItem) => {
    setDeletingComment(comment)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingComment || !onDeleteComment) return

    setIsDeleting(true)
    try {
      await onDeleteComment(deletingComment._id)
      setDeletingComment(null)
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>Failed to load comments: {error.message}</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Create Comment Form */}
      {showForm && canCreateComments && !editingComment && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <CommentForm
            onSubmit={onCreateComment}
            placeholder="Write a comment..."
            showTypeSelector
            showInternalToggle
          />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="space-y-2">
              {/* Edit Mode */}
              {editingComment?._id === comment._id ? (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="text-sm font-medium mb-3">Edit Comment</h4>
                  <CommentForm
                    onSubmit={handleEdit}
                    onCancel={() => setEditingComment(null)}
                    initialData={{
                      content: comment.content,
                      type: comment.type,
                      isInternal: comment.isInternal,
                    }}
                    submitLabel="Update"
                    showTypeSelector={false}
                    showInternalToggle
                  />
                </div>
              ) : (
                <>
                  {/* Comment Card */}
                  <CommentCard
                    comment={comment}
                    onEdit={() => setEditingComment(comment)}
                    onDelete={() => handleDeleteClick(comment)}
                    onReply={() => setReplyingTo(comment._id)}
                    onReaction={onReaction}
                    showReplies
                  />

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <div className="ml-12 border-l-2 border-blue-300 pl-4">
                      <div className="bg-blue-50 border rounded-lg p-3">
                        <h4 className="text-sm font-medium mb-2">
                          Replying to {comment.displayAuthorName}
                        </h4>
                        <CommentForm
                          onSubmit={handleReply}
                          onCancel={() => setReplyingTo(null)}
                          placeholder="Write a reply..."
                          submitLabel="Reply"
                          showTypeSelector={false}
                          showInternalToggle={false}
                          isReply
                        />
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-12 space-y-2 border-l-2 border-gray-200 pl-4">
                      {comment.replies.map((reply: any) => {
                        const enrichedReply = enrichReply(reply)
                        const isEditingReply = editingComment?._id === reply._id

                        return isEditingReply ? (
                          <div key={reply._id} className="border rounded-lg p-4 bg-blue-50">
                            <h4 className="text-sm font-medium mb-3">Edit Reply</h4>
                            <CommentForm
                              onSubmit={handleEdit}
                              onCancel={() => setEditingComment(null)}
                              initialData={{
                                content: reply.content,
                                type: reply.type,
                                isInternal: reply.isInternal,
                              }}
                              submitLabel="Update"
                              showTypeSelector={false}
                              showInternalToggle
                            />
                          </div>
                        ) : (
                          <CommentCard
                            key={reply._id}
                            comment={enrichedReply}
                            onEdit={enrichedReply.canEdit ? () => setEditingComment(enrichedReply) : undefined}
                            onDelete={enrichedReply.canDelete ? () => handleDeleteClick(enrichedReply) : undefined}
                            onReaction={onReaction}
                            compact
                            showReplies={false}
                          />
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={!!deletingComment}
        onOpenChange={(open) => !open && setDeletingComment(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Comment?"
        entityName={deletingComment?.content.substring(0, 50) + (deletingComment?.content.length! > 50 ? '...' : '')}
        description="This will permanently delete the comment. This action cannot be undone."
      />
    </div>
  )
}
