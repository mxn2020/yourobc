// src/features/yourobc/supporting/comments/pages/CommentsPage.tsx

import { useState, useMemo } from 'react'
import { useAuth } from '@/features/system/auth'
import { useRecentComments, useCommentMutations } from '../hooks/useComments'
import { CommentList } from '../components/CommentList'
import { Card, Badge, Button, Loading } from '@/components/ui'
import { Filter, MessageSquare } from 'lucide-react'
import { useToast } from '@/features/system/notifications'
import type { Comment, CommentFormData, CommentId } from '../types'
import { ENTITY_TYPE_LABELS } from '../types'
import { parseConvexError } from '@/utils/errorHandling'

const ENTITY_TYPES = [
  { value: 'yourobc_customer', label: 'Customers', icon: '👥' },
  { value: 'yourobc_quote', label: 'Quotes', icon: '📄' },
  { value: 'yourobc_shipment', label: 'Shipments', icon: '📦' },
  { value: 'yourobc_invoice', label: 'Invoices', icon: '💰' },
  { value: 'yourobc_partner', label: 'Partners', icon: '🤝' },
  { value: 'yourobc_courier', label: 'Couriers', icon: '🚚' },
  { value: 'yourobc_employee', label: 'Employees', icon: '👤' },
] as const

export function CommentsPage() {
  const { auth, user } = useAuth()
  const toast = useToast()
  const [selectedEntityType, setSelectedEntityType] = useState<Comment['entityType'] | null>(null)
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Determine if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Fetch recent comments filtered by entity type if selected
  const {
    comments: allComments,
    isLoading,
    error,
  } = useRecentComments({
    limit: 100,
    entityTypes: selectedEntityType ? [selectedEntityType] : undefined,
  })

  // Get standalone mutation hooks following the pattern
  const {
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCommentMutations()

  // Filter comments by entity ID if provided
  const displayComments = useMemo(() => {
    if (!selectedEntityId) return allComments
    return allComments.filter(c => c.entityId === selectedEntityId)
  }, [allComments, selectedEntityId])

  // Mutation handlers with toast notifications
  // Create comment requires entity context from the parent comment
  const handleCreateComment = async (data: CommentFormData) => {
    // For replies, we need to find the parent comment to get entity info
    if (!data.parentCommentId) {
      toast.error('Cannot create top-level comments from this page. Please go to the specific entity page.')
      throw new Error('No parent comment')
    }

    // Find the parent comment to get entityType and entityId
    const parentComment = displayComments.find(c => c._id === data.parentCommentId)
    if (!parentComment) {
      toast.error('Parent comment not found')
      throw new Error('Parent comment not found')
    }

    try {
      await createComment(parentComment.entityType, parentComment.entityId, data)
      toast.success('Reply added successfully')
    } catch (error: any) {
      console.error('[CreateReply] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[CreateReply] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[CreateReply] permission denied')
      }
      throw error
    }
  }

  const handleUpdateComment = async (commentId: CommentId, updates: { content?: string; isInternal?: boolean }) => {
    try {
      await updateComment(commentId, updates)
      toast.success('Comment updated successfully')
    } catch (error: any) {
      console.error('[UpdateComment] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[UpdateComment] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[UpdateComment] permission denied')
      }
      throw error
    }
  }

  const handleDeleteComment = async (commentId: CommentId) => {
    try {
      await deleteComment(commentId)
      toast.success('Comment deleted successfully')
    } catch (error: any) {
      console.error('[DeleteComment] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[DeleteComment] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[DeleteComment] permission denied')
      }
      throw error
    }
  }

  const handleAddReaction = async (commentId: CommentId, reaction: string) => {
    try {
      await addReaction(commentId, reaction)
    } catch (error: any) {
      console.error('[AddReaction] error:', error)
      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('[AddReaction] validation failed')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('[AddReaction] permission denied')
      }
      throw error
    }
  }

  // Group comments by entity
  const groupedComments = useMemo(() => {
    const groups = new Map<string, typeof displayComments>()
    displayComments.forEach(comment => {
      const key = `${comment.entityType}-${comment.entityId}`
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(comment)
    })
    return Array.from(groups.entries()).map(([key, comments]) => ({
      key,
      entityType: comments[0].entityType,
      entityId: comments[0].entityId,
      comments,
      count: comments.length,
    }))
  }, [displayComments])

  const filteredEntityTypes = selectedEntityType
    ? [selectedEntityType]
    : ENTITY_TYPES.map(et => et.value)

  const stats = useMemo(() => {
    const total = displayComments.length
    const internal = displayComments.filter(c => c.isInternal).length
    const byType = displayComments.reduce((acc, c) => {
      acc[c.type || 'note'] = (acc[c.type || 'note'] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, internal, byType }
  }, [displayComments])

  if (!auth?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Please log in to view comments</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              Comments & Notes
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage comments across all YourOBC entities
            </p>
          </div>

          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Comments</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.internal}</div>
            <div className="text-sm text-gray-600">Internal</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byType.note || 0}
            </div>
            <div className="text-sm text-gray-600">Notes</div>
          </Card>

          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {stats.byType.status_update || 0}
            </div>
            <div className="text-sm text-gray-600">Status Updates</div>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Comments</h3>

            <div className="space-y-4">
              {/* Entity Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedEntityType(null)
                      setSelectedEntityId(null)
                    }}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      !selectedEntityType
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All Entities
                  </button>
                  {ENTITY_TYPES.map((entityType) => (
                    <button
                      key={entityType.value}
                      onClick={() => {
                        setSelectedEntityType(entityType.value as Comment['entityType'])
                        setSelectedEntityId(null)
                      }}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedEntityType === entityType.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {entityType.icon} {entityType.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity ID Input (when entity type is selected) */}
              {selectedEntityType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific {ENTITY_TYPE_LABELS[selectedEntityType as keyof typeof ENTITY_TYPE_LABELS]} (Optional)
                  </label>
                  <input
                    type="text"
                    value={selectedEntityId || ''}
                    onChange={(e) => setSelectedEntityId(e.target.value || null)}
                    placeholder={`Enter ${ENTITY_TYPE_LABELS[selectedEntityType as keyof typeof ENTITY_TYPE_LABELS]} ID to filter...`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedEntityId && (
                    <p className="text-sm text-gray-500 mt-1">
                      Showing comments for {ENTITY_TYPE_LABELS[selectedEntityType as keyof typeof ENTITY_TYPE_LABELS]}: {selectedEntityId}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Active Filters Display */}
        {(selectedEntityType || selectedEntityId) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedEntityType && (
              <Badge variant="primary">
                {ENTITY_TYPE_LABELS[selectedEntityType as keyof typeof ENTITY_TYPE_LABELS]}
                <button
                  onClick={() => {
                    setSelectedEntityType(null)
                    setSelectedEntityId(null)
                  }}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedEntityId && (
              <Badge variant="secondary">
                ID: {selectedEntityId}
                <button
                  onClick={() => setSelectedEntityId(null)}
                  className="ml-2 hover:text-gray-900"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Comments Display */}
        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Error loading comments: {error.message}</p>
            </div>
          ) : groupedComments && groupedComments.length > 0 ? (
            // Show grouped comments with edit/delete functionality
            <div className="space-y-6">
              {groupedComments.map((group) => (
                <div key={group.key} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ENTITY_TYPE_LABELS[group.entityType as keyof typeof ENTITY_TYPE_LABELS]}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {group.entityId}</p>
                    </div>
                    <Badge variant="secondary">{group.count} comments</Badge>
                  </div>

                  <CommentList
                    comments={group.comments}
                    isLoading={false}
                    error={null}
                    onCreateComment={handleCreateComment}
                    onEditComment={handleUpdateComment}
                    onDeleteComment={handleDeleteComment}
                    onReaction={handleAddReaction}
                    canCreateComments={false}
                    showForm={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No comments found</p>
              <p className="text-sm">
                {selectedEntityType
                  ? `No comments for ${ENTITY_TYPE_LABELS[selectedEntityType as keyof typeof ENTITY_TYPE_LABELS]} entities`
                  : 'Select a filter to view comments'}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
