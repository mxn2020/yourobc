// convex/lib/yourobc/supporting/wiki/utils.ts
// convex/yourobc/supporting/wiki/utils.ts
import { WIKI_CONSTANTS } from './constants';
import type { CreateWikiEntryData } from './types';

export function validateWikiEntryData(data: Partial<CreateWikiEntryData>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  if (data.content !== undefined) {
    if (!data.content.trim()) {
      errors.push('Content is required');
    } else if (data.content.length > WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
    }
  }

  if (data.tags && data.tags.length > WIKI_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${WIKI_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  return errors;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

