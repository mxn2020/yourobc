// src/features/system/supporting/comments/components/CommentForm.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import type { Comment } from '../types';

interface CommentFormProps {
  onSubmit: (content: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isReply?: boolean;
  parentComment?: Comment;
  className?: string;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Add a comment...',
  submitLabel = 'Post Comment',
  isReply = false,
  parentComment,
  className,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={className}>
      {isReply && parentComment && (
        <div className="mb-2 text-sm text-gray-600">
          Replying to <span className="font-medium">{parentComment.createdBy}</span>
        </div>
      )}

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`min-h-[${isReply ? '60' : '80'}px]`}
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          Press Ctrl+Enter to submit
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
