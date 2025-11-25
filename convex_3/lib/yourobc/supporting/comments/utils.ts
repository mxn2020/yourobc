// convex/lib/yourobc/supporting/comments/utils.ts
// Validation + helpers for comments module

import { COMMENTS_CONSTANTS } from './constants';
import type { CreateCommentData, UpdateCommentData, Mention, Attachment } from './types';

/**
 * Trim all string fields in comment data
 * Generic typing ensures type safety without `any`
 */
export function trimCommentData<
  T extends Partial<CreateCommentData | UpdateCommentData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.content === 'string') {
    trimmed.content = trimmed.content.trim() as T['content'];
  }

  // Trim mention names
  if (Array.isArray(trimmed.mentions)) {
    trimmed.mentions = trimmed.mentions.map(m => ({
      ...m,
      userName: m.userName.trim(),
    })) as T['mentions'];
  }

  return trimmed;
}

/**
 * Validate comment data
 * Returns array of error messages
 */
export function validateCommentData(
  data: Partial<CreateCommentData | UpdateCommentData>
): string[] {
  const errors: string[] = [];

  // Validate content
  if (data.content !== undefined) {
    if (typeof data.content !== 'string') {
      errors.push('Content must be a string');
    } else {
      const content = data.content.trim();

      if (!content) {
        errors.push('Content is required');
      }

      if (content.length < COMMENTS_CONSTANTS.LIMITS.MIN_CONTENT_LENGTH) {
        errors.push('Content is too short');
      }

      if (content.length > COMMENTS_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
        errors.push(
          `Content cannot exceed ${COMMENTS_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`
        );
      }
    }
  }

  // Validate mentions
  if (data.mentions !== undefined) {
    if (!Array.isArray(data.mentions)) {
      errors.push('Mentions must be an array');
    } else {
      if (data.mentions.length > COMMENTS_CONSTANTS.LIMITS.MAX_MENTIONS) {
        errors.push(
          `Cannot exceed ${COMMENTS_CONSTANTS.LIMITS.MAX_MENTIONS} mentions`
        );
      }

      if (data.mentions.some(m => !m.userId || !m.userName)) {
        errors.push('All mentions must have userId and userName');
      }
    }
  }

  // Validate attachments
  if (data.attachments !== undefined) {
    if (!Array.isArray(data.attachments)) {
      errors.push('Attachments must be an array');
    } else {
      if (data.attachments.length > COMMENTS_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
        errors.push(
          `Cannot exceed ${COMMENTS_CONSTANTS.LIMITS.MAX_ATTACHMENTS} attachments`
        );
      }

      if (
        data.attachments.some(
          a => !a.filename || !a.fileUrl || !a.mimeType || a.fileSize < 0
        )
      ) {
        errors.push('All attachments must have required fields');
      }
    }
  }

  return errors;
}

/**
 * Validate reaction string
 */
export function isValidReaction(reaction: string): boolean {
  // Allow any emoji-like string, at least 1 character, max 5 characters
  return reaction && reaction.length <= 5 && reaction.length >= 1;
}

/**
 * Get unique reactions from reactions array
 */
export function getUniqueReactions(
  reactions: Array<{ userId: string; reaction: string; createdAt: number }>
): string[] {
  return [...new Set(reactions.map(r => r.reaction))];
}

/**
 * Build searchable text for comments
 */
export function buildCommentSearchableText(
  content: string,
  mentions?: Mention[]
): string {
  const parts = [content.toLowerCase()];

  if (mentions && mentions.length > 0) {
    parts.push(...mentions.map(m => m.userName.toLowerCase()));
  }

  return parts.join(' ').trim();
}
