// convex/lib/system/blog/authors/utils.ts
import { BLOG_AUTHORS_CONSTANTS } from './constants';
import type { CreateBlogAuthorData, UpdateBlogAuthorData } from './types';

export function validateBlogAuthorData(data: Partial<CreateBlogAuthorData | UpdateBlogAuthorData>): string[] {
  const errors: string[] = [];
  if (data.title !== undefined) {
    const trimmed = data.title.trim();
    if (!trimmed) errors.push('Title is required');
    else if (trimmed.length < BLOG_AUTHORS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) errors.push('Title too short');
    else if (trimmed.length > BLOG_AUTHORS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) errors.push('Title too long');
  }
  if (data.email !== undefined && !BLOG_AUTHORS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(data.email)) {
    errors.push('Invalid email address');
  }
  if (data.bio !== undefined && data.bio.trim().length > BLOG_AUTHORS_CONSTANTS.LIMITS.MAX_BIO_LENGTH) {
    errors.push('Bio too long');
  }
  return errors;
}

export function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}
