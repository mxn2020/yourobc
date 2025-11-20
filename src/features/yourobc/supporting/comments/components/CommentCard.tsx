// src/features/yourobc/supporting/comments/components/CommentCard.tsx

import React, { useState } from 'react'
import { MessageSquare, MoreVertical, Edit2, Trash2, Reply } from 'lucide-react'
import type { CommentListItem, CommentId } from '../types'
import { COMMENT_TYPE_LABELS, COMMON_REACTIONS } from '../types'

export interface CommentCardProps {
  comment: CommentListItem
  onEdit?: (comment: CommentListItem) => void
  onDelete?: (comment: CommentListItem) => void
  onReply?: (commentId: CommentId) => void
  onReaction?: (commentId: CommentId, reaction: string) => void
  showReplies?: boolean
  compact?: boolean
  className?: string
}

export function CommentCard({
  comment,
  onEdit,
  onDelete,
  onReply,
  onReaction,
  showReplies = true,
  compact = false,
  className = '',
}: CommentCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const handleReaction = (reaction: string) => {
    onReaction?.(comment._id, reaction)
    setShowReactionPicker(false)
  }

  return (
    <div className={`border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
            {comment.displayAuthorName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-medium text-sm">{comment.displayAuthorName || 'Unknown User'}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span>{comment.timeAgo}</span>
              {comment.type && (
                <>
                  <span>•</span>
                  <span className="text-blue-600">{COMMENT_TYPE_LABELS[comment.type]}</span>
                </>
              )}
              {comment.isInternal && (
                <>
                  <span>•</span>
                  <span className="text-orange-600">Internal</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {(comment.canEdit || comment.canDelete) && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded-lg shadow-lg z-10">
                {comment.canEdit && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(comment)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {comment.canDelete && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(comment)
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`text-gray-700 ${compact ? 'text-sm' : ''} mb-3 whitespace-pre-wrap`}>
        {comment.content}
      </div>

      {/* Reactions */}
      {comment.reactionsSummary && comment.reactionsSummary.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {comment.reactionsSummary.map((reaction) => (
            <button
              key={reaction.reaction}
              onClick={() => handleReaction(reaction.reaction)}
              className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                reaction.userReacted
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{COMMON_REACTIONS.find(r => r.value === reaction.reaction)?.emoji || '👍'}</span>
              <span>{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {onReaction && (
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="hover:text-blue-600 transition-colors"
            >
              React
            </button>

            {showReactionPicker && (
              <div className="absolute left-0 mt-1 bg-white border rounded-lg shadow-lg p-2 z-10 flex gap-1">
                {COMMON_REACTIONS.map((reaction) => (
                  <button
                    key={reaction.value}
                    onClick={() => handleReaction(reaction.value)}
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    title={reaction.label}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onReply && (
          <button
            onClick={() => onReply(comment._id)}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
        )}

        {showReplies && comment.hasReplies && (
          <div className="flex items-center gap-1 text-gray-400">
            <MessageSquare className="w-4 h-4" />
            <span>{comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}</span>
          </div>
        )}
      </div>

      {/* Edited Indicator */}
      {comment.isEdited && (
        <div className="text-xs text-gray-400 mt-2">
          Edited
        </div>
      )}
    </div>
  )
}
