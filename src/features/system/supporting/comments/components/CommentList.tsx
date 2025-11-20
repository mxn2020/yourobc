// src/features/boilerplate/supporting/comments/components/CommentList.tsx

import { useState } from 'react';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import type { CommentWithReplies } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface CommentListProps {
  comments: CommentWithReplies[];
  currentUserId?: Id<"userProfiles">;
  onDelete?: (commentId: Id<'comments'>) => void;
  onReply?: (parentCommentId: Id<'comments'>, content: string) => void | Promise<void>;
  onReaction?: (commentId: Id<'comments'>, reaction: string) => void;
  emptyMessage?: string;
}

export function CommentList({
  comments,
  currentUserId,
  onDelete,
  onReply,
  onReaction,
  emptyMessage = 'No comments yet. Be the first to comment!',
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Comments already come with nested replies from the query

  const handleReplyClick = (commentId: Id<'comments'>) => {
    setReplyingTo(commentId);
  };

  const handleReplySubmit = async (parentCommentId: Id<'comments'>, content: string) => {
    if (onReply) {
      await onReply(parentCommentId, content);
      setReplyingTo(null);
    }
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
  };

  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const replies = comment.replies || [];
        const isReplying = replyingTo === comment._id;

        return (
          <div key={comment._id} className="space-y-3">
            <CommentCard
              comment={comment}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onReply={onReply ? handleReplyClick : undefined}
              onReaction={onReaction}
            />

            {/* Replies */}
            {replies.map((reply) => (
              <CommentCard
                key={reply._id}
                comment={reply}
                currentUserId={currentUserId}
                isReply
                onDelete={onDelete}
                onReaction={onReaction}
              />
            ))}

            {/* Reply form */}
            {isReplying && (
              <div className="ml-8 mt-3">
                <CommentForm
                  onSubmit={(content) => handleReplySubmit(comment._id, content)}
                  onCancel={handleReplyCancel}
                  placeholder="Write a reply..."
                  submitLabel="Reply"
                  isReply
                  parentComment={comment}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
