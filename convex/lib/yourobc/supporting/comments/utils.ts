// convex/lib/yourobc/supporting/comments/utils.ts
// convex/yourobc/supporting/comments/utils.ts
import { COMMENT_CONSTANTS } from './constants';
import type { CreateCommentData } from './types';

export function validateCommentData(data: Partial<CreateCommentData>): string[] {
  const errors: string[] = [];

  if (data.content !== undefined) {
    if (!data.content.trim()) {
      errors.push('Content is required');
    } else if (data.content.length > COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content must be less than ${COMMENT_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
    }
  }

  return errors;
}

