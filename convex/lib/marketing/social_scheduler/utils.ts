// convex/lib/marketing/social_scheduler/utils.ts

import { SOCIAL_SCHEDULER_CONSTANTS } from './constants';
import type { MarketingSocialPost } from './types';

export function validateSocialPostData(data: Partial<MarketingSocialPost>): string[] {
  const errors: string[] = [];

  if (data.content !== undefined && !data.content.trim()) {
    errors.push('Content is required');
  }

  if (data.content && data.content.length > SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
    errors.push(`Content must be less than ${SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
  }

  if (data.hashtags && data.hashtags.length > SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_HASHTAGS) {
    errors.push(`Maximum ${SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_HASHTAGS} hashtags allowed`);
  }

  if (data.tags && data.tags.length > SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${SOCIAL_SCHEDULER_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  return errors;
}

export function isPostScheduled(post: MarketingSocialPost): boolean {
  return post.status === SOCIAL_SCHEDULER_CONSTANTS.STATUS.SCHEDULED;
}

export function isPostPublished(post: MarketingSocialPost): boolean {
  return post.status === SOCIAL_SCHEDULER_CONSTANTS.STATUS.PUBLISHED;
}

export function getStatusColor(status: MarketingSocialPost['status']): string {
  const colors = {
    draft: '#6b7280',
    scheduled: '#3b82f6',
    published: '#10b981',
    failed: '#ef4444',
    archived: '#6b7280',
  };
  return colors[status] || colors.draft;
}

export function formatHashtags(hashtags: string[]): string {
  return hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ');
}
