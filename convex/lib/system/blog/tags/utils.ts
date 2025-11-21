// convex/lib/system/blog/tags/utils.ts
// Validation functions and utility helpers for blog tags module

import { BLOG_TAGS_CONSTANTS } from './constants';
import type { CreateBlogTagData, UpdateBlogTagData } from './types';

export function validateBlogTagData(data: Partial<CreateBlogTagData | UpdateBlogTagData>): string[] {
  const errors: string[] = [];
  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    if (!trimmed) errors.push('Title is required');
    else if (trimmed.length < BLOG_TAGS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) errors.push('Title too short');
    else if (trimmed.length > BLOG_TAGS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) errors.push('Title too long');
  }
  return errors;
}

export function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}
