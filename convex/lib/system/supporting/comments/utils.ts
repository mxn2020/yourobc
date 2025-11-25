// convex/lib/system/supporting/comments/utils.ts
// Validation and helper utilities for system comments

import { SYSTEM_COMMENTS_CONSTANTS } from './constants';
import type {
  CreateSystemCommentData,
  UpdateSystemCommentData,
  SystemCommentAttachment,
} from './types';

export function trimSystemCommentData<
  T extends Partial<CreateSystemCommentData | UpdateSystemCommentData>
>(data: T): T {
  const trimmed = { ...data } as any;

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim();
  }

  if (typeof trimmed.content === 'string') {
    trimmed.content = trimmed.content.trim();
  }

  if ('entityType' in trimmed && typeof trimmed.entityType === 'string') {
    trimmed.entityType = trimmed.entityType.trim();
  }

  if ('entityId' in trimmed && typeof trimmed.entityId === 'string') {
    trimmed.entityId = trimmed.entityId.trim();
  }

  if (Array.isArray(trimmed.mentions)) {
    trimmed.mentions = trimmed.mentions.map((m: any) => ({
      ...m,
      userName: m.userName.trim(),
    }));
  }

  return trimmed as T;
}

export function validateSystemCommentData(
  data: Partial<CreateSystemCommentData | UpdateSystemCommentData>
): string[] {
  const errors: string[] = [];

  if (data.content !== undefined) {
    if (typeof data.content !== 'string') {
      errors.push('Content must be a string');
    } else {
      const content = data.content.trim();
      if (!content) {
        errors.push('Content is required');
      }
      if (content.length < SYSTEM_COMMENTS_CONSTANTS.LIMITS.MIN_CONTENT_LENGTH) {
        errors.push('Content is too short');
      }
      if (content.length > SYSTEM_COMMENTS_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
        errors.push('Content is too long');
      }
    }
  }

  if (data.mentions !== undefined) {
    if (!Array.isArray(data.mentions)) {
      errors.push('Mentions must be an array');
    } else {
      if (data.mentions.length > SYSTEM_COMMENTS_CONSTANTS.LIMITS.MAX_MENTIONS) {
        errors.push('Too many mentions');
      }
      if (data.mentions.some((m) => !m.userId || !m.userName)) {
        errors.push('Mentions require userId and userName');
      }
    }
  }

  if (data.attachments !== undefined) {
    if (!Array.isArray(data.attachments)) {
      errors.push('Attachments must be an array');
    } else {
      if (data.attachments.length > SYSTEM_COMMENTS_CONSTANTS.LIMITS.MAX_ATTACHMENTS) {
        errors.push('Too many attachments');
      }

      const invalidAttachment = (data.attachments as SystemCommentAttachment[]).some(
        (a) => !a.filename || !a.fileUrl || !a.mimeType || a.fileSize < 0
      );
      if (invalidAttachment) {
        errors.push('All attachments must include filename, url, mimeType, and non-negative size');
      }
    }
  }

  return errors;
}

export function isValidSystemReaction(reaction: string): boolean {
  return reaction.length >= 1 && reaction.length <= 5;
}

export function getSystemUniqueReactions(
  reactions: Array<{ userId: string; reaction: string; createdAt: number }>
): string[] {
  return [...new Set(reactions.map((r) => r.reaction))];
}
