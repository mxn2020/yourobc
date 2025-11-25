// convex/lib/system/supporting/wiki_entries/utils.ts
// Validation and helpers for system wiki entries

import { SYSTEM_WIKI_ENTRIES_CONSTANTS } from './constants';
import type {
  CreateSystemWikiEntryData,
  UpdateSystemWikiEntryData,
} from './types';

export function trimSystemWikiEntryData<
  T extends Partial<CreateSystemWikiEntryData | UpdateSystemWikiEntryData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.title === 'string') {
    trimmed.title = trimmed.title.trim() as T['title'];
  }
  if (typeof trimmed.slug === 'string') {
    trimmed.slug = trimmed.slug.trim().toLowerCase() as T['slug'];
  }
  if (typeof trimmed.content === 'string') {
    trimmed.content = trimmed.content.trim() as T['content'];
  }
  if (Array.isArray(trimmed.tags)) {
    trimmed.tags = trimmed.tags.map((t) => t.trim()).filter(Boolean) as T['tags'];
  }

  return trimmed;
}

export function validateSystemWikiEntryData(
  data: Partial<CreateSystemWikiEntryData | UpdateSystemWikiEntryData>
): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > SYSTEM_WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push('Title too long');
    }
  }

  if (data.slug !== undefined) {
    if (!data.slug.trim()) {
      errors.push('Slug is required');
    } else if (data.slug.length > SYSTEM_WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
      errors.push('Slug too long');
    }
  }

  if (data.content !== undefined && data.content.length > SYSTEM_WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
    errors.push('Content too long');
  }

  if (data.tags && data.tags.length > SYSTEM_WIKI_ENTRIES_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push('Too many tags');
  }

  return errors;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
