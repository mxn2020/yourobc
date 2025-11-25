// convex/schema/yourobc/supporting/comments/validators.ts
// Grouped validators for comments module

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';
import { supportingFields } from '../validators';

/**
 * Simple union validators for comments
 */
export const commentsValidators = {
  commentType: baseValidators.commentType,
} as const;

/**
 * Complex object validators for comments
 */
export const commentsFields = {
  mention: supportingFields.mention,
  reaction: supportingFields.reaction,
  attachment: supportingFields.attachment,
  editHistoryEntry: supportingFields.editHistoryEntry,
} as const;
