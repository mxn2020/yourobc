// src/features/system/supporting/comments/components/CommentCard.tsx

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Trash2, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface CommentCardProps {
  comment: Comment;
  currentUserId?: Id<"userProfiles">;
  isReply?: boolean;
  onDelete?: (commentId: Id<'systemSupportingComments'>) => void;
  onReply?: (commentId: Id<'systemSupportingComments'>) => void;
  onReaction?: (commentId: Id<'systemSupportingComments'>, reaction: string) => void;
}

export function CommentCard({
  comment,
  currentUserId,
  isReply = false,
  onDelete,
  onReply,
  onReaction,
}: CommentCardProps) {
  const hasReacted = comment.reactions?.some(
    (r) => r.userId === currentUserId && r.reaction === '👍'
  );
  const likeCount = comment.reactions?.filter((r) => r.reaction === '👍').length || 0;

  const isOwner = currentUserId === comment.createdBy;

  return (
    <div className={`border-l-2 border-gray-200 pl-4 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.createdBy}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
            {comment.type && (
              <Badge variant="outline" className="text-xs">
                {comment.type}
              </Badge>
            )}
            {comment.isInternal && (
              <Badge variant="secondary" className="text-xs">
                Internal
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

          {comment.mentions && comment.mentions.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">Mentioned:</span>
              {comment.mentions.map((mention, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  @{mention.userName}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {onReaction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReaction(comment._id, '👍')}
                className={hasReacted ? 'text-blue-600' : ''}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
              </Button>
            )}

            {!isReply && onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment._id)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(comment._id)}
                className="text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
