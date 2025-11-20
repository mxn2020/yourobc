// src/features/system/supporting/comments/components/CommentsSectionRefactored.tsx

import { useAuth } from '@/features/system/auth';
import {
  useEntityComments,
  useCreateComment,
  useDeleteComment,
  useAddCommentReaction,
} from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import type { EntityType } from '@/convex/types';
import type { Id } from '@/convex/_generated/dataModel';

interface CommentsSectionRefactoredProps {
  entityType: EntityType;
  entityId: string;
  title?: string;
  className?: string;
}

/**
 * Refactored CommentsSection using separate components
 * This is the new recommended version using CommentForm, CommentCard, and CommentList
 */
export function CommentsSectionRefactored({
  entityType,
  entityId,
  title = 'Comments',
  className,
}: CommentsSectionRefactoredProps) {
  const { user, profile } = useAuth();

  const comments = useEntityComments(entityType, entityId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const addReaction = useAddCommentReaction();

  const handleCreateComment = async (content: string) => {
    if (!user) return;

    await createComment({
      data: {
        entityType: entityType,
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
        entityType: entityType,
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

    // addReaction automatically toggles
    await addReaction({
      commentId,
      reaction,
    });
  };

  // Calculate total comment count including replies
  const totalCommentCount = comments?.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  ) || 0;

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
        <CommentForm
          onSubmit={handleCreateComment}
          placeholder="Add a comment..."
          submitLabel="Post Comment"
        />

        {/* Comments list */}
        <CommentList
          comments={comments || []}
          currentUserId={profile?._id}
          onDelete={handleDelete}
          onReply={handleReply}
          onReaction={handleReaction}
        />
      </CardContent>
    </Card>
  );
}
