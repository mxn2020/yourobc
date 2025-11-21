// convex/lib/system/blog/posts/utils.ts
// Validation functions and utility helpers for blog posts module

import { BLOG_POSTS_CONSTANTS } from './constants';
import type { CreateBlogPostData, UpdateBlogPostData, BlogPost } from './types';

/**
 * Validate blog post data for creation/update
 */
export function validateBlogPostData(
  data: Partial<CreateBlogPostData | UpdateBlogPostData>
): string[] {
  const errors: string[] = [];

  // Validate title
  if (data.title !== undefined) {
    const trimmed = data.title.trim();

    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length < BLOG_POSTS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${BLOG_POSTS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} characters`);
    } else if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    } else if (!BLOG_POSTS_CONSTANTS.VALIDATION.TITLE_PATTERN.test(trimmed)) {
      errors.push('Title contains invalid characters');
    }
  }

  // Validate slug
  if (data.slug !== undefined) {
    const trimmed = data.slug.trim();

    if (!trimmed) {
      errors.push('Slug is required');
    } else if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
      errors.push(`Slug cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`);
    } else if (!BLOG_POSTS_CONSTANTS.VALIDATION.SLUG_PATTERN.test(trimmed)) {
      errors.push('Slug must be lowercase alphanumeric with hyphens only');
    }
  }

  // Validate content
  if (data.content !== undefined) {
    const trimmed = data.content.trim();

    if (!trimmed) {
      errors.push('Content is required');
    } else if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`);
    }
  }

  // Validate excerpt
  if (data.excerpt !== undefined && data.excerpt.trim()) {
    const trimmed = data.excerpt.trim();
    if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_EXCERPT_LENGTH) {
      errors.push(`Excerpt cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_EXCERPT_LENGTH} characters`);
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (data.tags.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate SEO fields
  if (data.seoTitle !== undefined && data.seoTitle.trim()) {
    const trimmed = data.seoTitle.trim();
    if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_TITLE_LENGTH) {
      errors.push(`SEO title cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_TITLE_LENGTH} characters`);
    }
  }

  if (data.seoDescription !== undefined && data.seoDescription.trim()) {
    const trimmed = data.seoDescription.trim();
    if (trimmed.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_DESCRIPTION_LENGTH) {
      errors.push(`SEO description cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_DESCRIPTION_LENGTH} characters`);
    }
  }

  if (data.seoKeywords !== undefined) {
    if (data.seoKeywords.length > BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_KEYWORDS) {
      errors.push(`Cannot exceed ${BLOG_POSTS_CONSTANTS.LIMITS.MAX_SEO_KEYWORDS} SEO keywords`);
    }
  }

  // Validate URLs
  if (data.canonicalUrl !== undefined && data.canonicalUrl.trim()) {
    if (!BLOG_POSTS_CONSTANTS.VALIDATION.URL_PATTERN.test(data.canonicalUrl)) {
      errors.push('Canonical URL must be a valid HTTP(S) URL');
    }
  }

  if (data.ogImage !== undefined && data.ogImage.trim()) {
    if (!BLOG_POSTS_CONSTANTS.VALIDATION.URL_PATTERN.test(data.ogImage)) {
      errors.push('OG image must be a valid HTTP(S) URL');
    }
  }

  // Validate scheduling
  if (data.status === 'scheduled' && !data.scheduledFor) {
    errors.push('Scheduled posts must have a scheduled date');
  }

  if (data.scheduledFor !== undefined && data.scheduledFor < Date.now()) {
    errors.push('Scheduled date must be in the future');
  }

  return errors;
}

/**
 * Format blog post display title
 */
export function formatBlogPostDisplayTitle(post: { title: string; status?: string }): string {
  const statusBadge = post.status ? ` [${post.status.toUpperCase()}]` : '';
  return `${post.title}${statusBadge}`;
}

/**
 * Generate slug from title
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate reading time from content (words per minute = 200)
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Calculate word count from content
 */
export function calculateWordCount(content: string): number {
  return content.trim().split(/\s+/).length;
}

/**
 * Check if blog post is editable
 */
export function isBlogPostEditable(post: { status: string; deletedAt?: number }): boolean {
  if (post.deletedAt) return false;
  return post.status !== 'archived';
}

/**
 * Check if blog post is published
 */
export function isBlogPostPublished(post: { status: string; publishedAt?: number }): boolean {
  return post.status === 'published' && !!post.publishedAt;
}

/**
 * Check if blog post should be visible to public
 */
export function isBlogPostPubliclyVisible(post: {
  status: string;
  visibility?: string;
  publishedAt?: number;
  scheduledFor?: number;
}): boolean {
  const now = Date.now();

  // Must be published
  if (post.status !== 'published' || !post.publishedAt) {
    return false;
  }

  // Check if it's been published yet
  if (post.publishedAt > now) {
    return false;
  }

  // Check visibility
  if (post.visibility && post.visibility !== 'public' && post.visibility !== 'unlisted') {
    return false;
  }

  return true;
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerptFromContent(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

/**
 * Validate password strength for password-protected posts
 */
export function validatePostPassword(password: string): string[] {
  const errors: string[] = [];

  if (!password || !password.trim()) {
    errors.push('Password is required for password-protected posts');
    return errors;
  }

  const trimmed = password.trim();

  if (trimmed.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (trimmed.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  return errors;
}

/**
 * Check if post can be published
 */
export function canPublishPost(post: {
  title: string;
  content: string;
  slug: string;
  authorId: string;
}): { canPublish: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (!post.title || !post.title.trim()) {
    reasons.push('Title is required');
  }

  if (!post.content || !post.content.trim()) {
    reasons.push('Content is required');
  }

  if (!post.slug || !post.slug.trim()) {
    reasons.push('Slug is required');
  }

  if (!post.authorId) {
    reasons.push('Author is required');
  }

  return {
    canPublish: reasons.length === 0,
    reasons,
  };
}
