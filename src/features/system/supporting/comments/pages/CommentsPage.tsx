// src/features/boilerplate/supporting/comments/pages/CommentsPage.tsx

import { useState } from 'react';
import { useAuth } from '@/features/boilerplate/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Search, Filter } from 'lucide-react';
import {
  useEntityComments,
  useCreateComment,
  useDeleteComment,
  useAddCommentReaction,
} from '../hooks';
import { CommentForm } from '../components/CommentForm';
import { CommentList } from '../components/CommentList';
import { CommentsService } from '../services';
import type { Comment, CommentWithReplies } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface CommentsPageProps {
  entityType: string;
  entityId: string;
}

/**
 * Full-featured Comments Page for managing comments
 * Can be used as a standalone page or embedded in a dashboard
 */
export function CommentsPage({ entityType, entityId }: CommentsPageProps) {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Comment['type'] | 'all'>('all');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'internal' | 'external'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const comments = useEntityComments(entityType, entityId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const addReaction = useAddCommentReaction();

  // Filter and search comments (need to flatten for some operations but preserve structure)
  const filteredComments = comments?.filter((comment) => {
    // Search filter - check comment and its replies
    if (searchQuery) {
      const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.replies?.some(reply => reply.content.toLowerCase().includes(searchQuery.toLowerCase()))
      if (!matchesSearch) {
        return false;
      }
    }

    // Type filter
    if (filterType !== 'all' && comment.type !== filterType) {
      return false;
    }

    // Visibility filter
    if (filterVisibility === 'internal' && !comment.isInternal) {
      return false;
    }
    if (filterVisibility === 'external' && comment.isInternal) {
      return false;
    }

    return true;
  }) || [];

  // Flatten comments for stats calculation
  const flatComments: Comment[] = comments?.flatMap(c => [c, ...(c.replies || [])]) || [];
  const stats = flatComments.length ? CommentsService.getCommentStats(flatComments) : null;

  const handleCreateComment = async (content: string) => {
    if (!user) return;

    await createComment({
      data: {
        entityType,
        entityId,
        content,
        isInternal: false,
      },
    });
  };

  const handleReply = async (parentCommentId: Id<'comments'>, content: string) => {
    if (!user) return;

    await createComment({
      data: {
        entityType,
        entityId,
        content,
        parentCommentId,
        isInternal: false,
      },
    });
  };

  const handleDelete = async (commentId: Id<'comments'>) => {
    if (!user) return;

    await deleteComment({
      commentId,
    });
  };

  const handleReaction = async (commentId: Id<'comments'>, reaction: string) => {
    if (!user) return;

    await addReaction({
      commentId,
      reaction,
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Comments
          </h1>
          <p className="text-gray-600 mt-1">
            Discussion and notes for {entityType} #{entityId}
          </p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.internal}</div>
                <div className="text-xs text-gray-600">Internal</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.withReplies}</div>
                <div className="text-xs text-gray-600">With Replies</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.withReactions}</div>
                <div className="text-xs text-gray-600">With Reactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filterType !== 'all' || filterVisibility !== 'all') && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium block mb-2">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Types</option>
                    <option value="note">Note</option>
                    <option value="status_update">Status Update</option>
                    <option value="question">Question</option>
                    <option value="answer">Answer</option>
                    <option value="internal">Internal</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Visibility</label>
                  <select
                    value={filterVisibility}
                    onChange={(e) => setFilterVisibility(e.target.value as any)}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="all">All Comments</option>
                    <option value="internal">Internal Only</option>
                    <option value="external">External Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* New Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Add Comment</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentForm
            onSubmit={handleCreateComment}
            placeholder="Add a comment..."
            submitLabel="Post Comment"
          />
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Comments</span>
            <Badge variant="secondary">
              {filteredComments.length}
              {filteredComments.length !== comments?.length && ` of ${comments?.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommentList
            comments={filteredComments}
            currentUserId={profile?._id}
            onDelete={handleDelete}
            onReply={handleReply}
            onReaction={handleReaction}
            emptyMessage={
              searchQuery || filterType !== 'all' || filterVisibility !== 'all'
                ? 'No comments match your filters'
                : 'No comments yet. Be the first to comment!'
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
