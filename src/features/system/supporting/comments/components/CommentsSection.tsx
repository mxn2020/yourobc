// src/features/boilerplate/supporting/comments/components/CommentsSection.tsx

import { useState } from 'react'
import { useAuth } from '@/features/boilerplate/auth'
import {
  useEntityComments,
  useCreateComment,
  useDeleteComment,
  useAddCommentReaction,
} from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, Trash2, ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Comment, CommentWithReplies } from '../types'
import type { EntityType } from '@/convex/types'
import type { Id } from '@/convex/_generated/dataModel'

interface CommentsSectionProps {
  entityType: EntityType
  entityId: string
  title?: string
  className?: string
}

export function CommentsSection({
  entityType,
  entityId,
  title = 'Comments',
  className,
}: CommentsSectionProps) {
  const { user, profile } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const comments = useEntityComments(entityType, entityId)
  const createComment = useCreateComment()
  const deleteComment = useDeleteComment()
  const addReaction = useAddCommentReaction()

  const handleSubmit = async (parentCommentId?: Id<"comments">) => {
    if (!user || !newComment.trim()) return

    try {
      await createComment({
        data: {
          entityType: entityType,
          entityId,
          content: newComment.trim(),
          parentCommentId: parentCommentId,
          isInternal: false,
        },
      })
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleDelete = async (commentId: Id<"comments">) => {
    if (!user) return

    try {
      await deleteComment({
        commentId: commentId,
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleReaction = async (commentId: Id<"comments">, reaction: string) => {
    if (!user) return

    try {
      // addReaction automatically toggles - removes if exists, adds if doesn't exist
      await addReaction({
        commentId: commentId,
        reaction,
      })
    } catch (error) {
      console.error('Failed to toggle reaction:', error)
    }
  }

  const renderComment = (comment: Comment | CommentWithReplies, isReply = false) => {
    const hasReacted = comment.reactions?.some((r) => r.userId === profile?._id && r.reaction === '👍')
    const likeCount = comment.reactions?.filter((r) => r.reaction === '👍').length || 0
    const displayName = 'createdByName' in comment && comment.createdByName
      ? comment.createdByName
      : 'createdByEmail' in comment && comment.createdByEmail
      ? comment.createdByEmail
      : 'Unknown User'

    return (
      <div
        key={comment._id}
        className={`border-l-2 border-gray-200 pl-4 ${isReply ? 'ml-8' : ''}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{displayName}</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
              {comment.type && (
                <Badge variant="outline" className="text-xs">
                  {comment.type}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(comment._id, '👍')}
                className={hasReacted ? 'text-blue-600' : ''}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
              </Button>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment._id)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              {profile?._id === comment.createdBy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        {replyTo === comment._id && (
          <div className="mt-3 ml-8">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px]"
            />
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => handleSubmit(comment._id)}>
                Reply
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Comments already come with nested replies from the query
  const commentsWithReplies = comments || []
  const totalCommentCount = commentsWithReplies.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
          {comments && <Badge variant="secondary">{totalCommentCount}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New comment form */}
        <div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <Button size="sm" className="mt-2" onClick={() => handleSubmit()}>
            Post Comment
          </Button>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {commentsWithReplies.map((comment) => (
            <div key={comment._id} className="space-y-3">
              {renderComment(comment)}
              {comment.replies?.map((reply) => renderComment(reply, true))}
            </div>
          ))}

          {commentsWithReplies.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
