// src/features/yourobc/supporting/comments/components/CommentForm.tsx

import React, { useState, useEffect } from 'react'
import { Send, X } from 'lucide-react'
import type { CommentFormData, Comment } from '../types'
import { COMMENT_TYPE_LABELS } from '../types'

export interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CommentFormData>
  placeholder?: string
  showTypeSelector?: boolean
  showInternalToggle?: boolean
  submitLabel?: string
  isReply?: boolean
  className?: string
}

export function CommentForm({
  onSubmit,
  onCancel,
  initialData,
  placeholder = 'Write a comment...',
  showTypeSelector = false,
  showInternalToggle = true,
  submitLabel = 'Comment',
  isReply = false,
  className = '',
}: CommentFormProps) {
  const [content, setContent] = useState(initialData?.content || '')
  const [type, setType] = useState<Comment['type']>(initialData?.type || 'note')
  const [isInternal, setIsInternal] = useState(initialData?.isInternal || false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || '')
      setType(initialData.type || 'note')
      setIsInternal(initialData.isInternal || false)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Comment content is required')
      return
    }

    if (content.length > 5000) {
      setError('Comment must be less than 5000 characters')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        content: content.trim(),
        type,
        isInternal,
      })

      // Reset form after successful submission
      setContent('')
      setType('note')
      setIsInternal(false)
    } catch (err: any) {
      setError(err.message || 'Failed to submit comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setType('note')
    setIsInternal(false)
    setError('')
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Type Selector */}
      {showTypeSelector && !isReply && (
        <div className="flex gap-2">
          {Object.entries(COMMENT_TYPE_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value as Comment['type'])}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                type === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Text Area */}
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 3 : 4}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${content.length > 5000 ? 'text-red-500' : 'text-gray-500'}`}>
            {content.length} / 5000
          </span>
        </div>
      </div>

      {/* Options */}
      {showInternalToggle && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="text-sm text-gray-700">Internal comment</span>
          </label>
          <span className="text-xs text-gray-500">(only visible to team members)</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
