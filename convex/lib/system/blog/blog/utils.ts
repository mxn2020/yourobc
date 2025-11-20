// convex/lib/boilerplate/blog/blog/utils.ts
/**
 * Blog Utility Functions
 *
 * Reusable helpers for blog operations
 */

declare const process: { env: Record<string, string | undefined> }

import { BLOG_CONSTANTS } from './constants';

/**
 * Generate URL-friendly slug from title
 *
 * @param title - Post title
 * @param maxWords - Maximum words to include in slug
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug('How to Build a Blog in 2024!') // 'how-to-build-a-blog-in-2024'
 */
export function generateSlug(title: string, maxWords: number = BLOG_CONSTANTS.DEFAULTS.SLUG_MAX_WORDS): string {
  let slug = title
    .toLowerCase()
    .trim();

  // Remove special characters
  slug = slug.replace(/[^a-z0-9\s-]/gi, '');

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Limit to max words
  const words = slug.split('-').filter(word => word.length > 0);
  if (words.length > maxWords) {
    slug = words.slice(0, maxWords).join('-');
  }

  // Remove stop words (optional - keeps slug shorter)
  // Uncomment if you want to remove common words
  // const meaningfulWords = words.filter(word => !SLUG_RULES.STOP_WORDS.includes(word));
  // slug = meaningfulWords.slice(0, maxWords).join('-');

  return slug;
}

/**
 * Check if slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return BLOG_CONSTANTS.SLUG_RULES.RESERVED_SLUGS.includes(slug.toLowerCase() as any);
}

/**
 * Generate unique slug by appending number if needed
 *
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function makeSlugUnique(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug) || isReservedSlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Extract plain text from markdown/HTML content
 *
 * @param content - Markdown or HTML content
 * @returns Plain text without formatting
 */
export function extractPlainText(content: string): string {
  return content
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove markdown links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove markdown code blocks
    .replace(/```[^`]*```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown blockquotes
    .replace(/^>\s+/gm, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate excerpt from content
 *
 * @param content - Full post content
 * @param maxLength - Maximum excerpt length
 * @param suffix - Suffix to add (e.g., '...')
 * @returns Excerpt
 */
export function getExcerpt(
  content: string,
  maxLength: number = BLOG_CONSTANTS.DEFAULTS.EXCERPT_LENGTH,
  suffix: string = BLOG_CONSTANTS.DEFAULTS.EXCERPT_SUFFIX
): string {
  const plainText = extractPlainText(content);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Find the last complete word before maxLength
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + suffix;
  }

  return truncated + suffix;
}

/**
 * Calculate estimated read time for content
 *
 * @param content - Post content (markdown/HTML)
 * @returns Estimated read time in minutes
 */
export function calculateReadTime(content: string): number {
  const plainText = extractPlainText(content);
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Base read time from words
  let minutes = Math.ceil(wordCount / BLOG_CONSTANTS.READ_TIME.WORDS_PER_MINUTE);

  // Add time for images
  const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  minutes += Math.ceil((imageCount * BLOG_CONSTANTS.READ_TIME.IMAGE_SECONDS) / 60);

  // Add time for code blocks
  const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
  minutes += Math.ceil((codeBlockCount * BLOG_CONSTANTS.READ_TIME.CODE_BLOCK_SECONDS) / 60);

  // Ensure minimum read time
  return Math.max(minutes, BLOG_CONSTANTS.READ_TIME.MIN_READ_TIME);
}

/**
 * Count words in content
 *
 * @param content - Post content
 * @returns Word count
 */
export function countWords(content: string): number {
  const plainText = extractPlainText(content);
  const words = plainText.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Create searchable content string
 *
 * Combines title, excerpt, content, and tags for full-text search
 *
 * @param title - Post title
 * @param content - Post content
 * @param tags - Post tags
 * @param excerpt - Post excerpt (optional)
 * @returns Searchable string (lowercased)
 */
export function createSearchableContent(
  title: string,
  content: string,
  tags: string[] = [],
  excerpt?: string
): string {
  const plainText = extractPlainText(content);
  const searchParts = [
    title,
    excerpt || '',
    plainText,
    ...tags,
  ];

  return searchParts
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate table of contents from markdown headers
 *
 * @param content - Markdown content
 * @returns Array of TOC items with title, level, and id
 */
export function generateTableOfContents(content: string): Array<{
  title: string;
  level: number;
  id: string;
}> {
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: Array<{ title: string; level: number; id: string }> = [];
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = generateSlug(title);

    toc.push({ title, level, id });
  }

  return toc;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return BLOG_CONSTANTS.VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  return BLOG_CONSTANTS.VALIDATION_PATTERNS.URL.test(url);
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return BLOG_CONSTANTS.VALIDATION_PATTERNS.HEX_COLOR.test(color);
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return BLOG_CONSTANTS.VALIDATION_PATTERNS.SLUG.test(slug);
}

/**
 * Sanitize string for database storage
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, BLOG_CONSTANTS.LIMITS.CONTENT_MAX);
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get relative time string
 *
 * @param timestamp - Unix timestamp
 * @returns Relative time string (e.g., '2 hours ago')
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Calculate SEO score for post
 *
 * @param post - Post data
 * @returns SEO score (0-100)
 */
export function calculateSEOScore(post: {
  title: string;
  content: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  focusKeyword?: string;
  featuredImage?: { alt?: string };
}): number {
  let score = 0;
  const maxScore = 100;

  // Title optimization (20 points)
  if (post.seoTitle) {
    const titleLength = post.seoTitle.length;
    if (titleLength >= 30 && titleLength <= 60) score += 20;
    else if (titleLength >= 20 && titleLength <= 70) score += 10;
  } else {
    const titleLength = post.title.length;
    if (titleLength >= 30 && titleLength <= 60) score += 15;
    else if (titleLength >= 20 && titleLength <= 70) score += 8;
  }

  // Description optimization (20 points)
  if (post.seoDescription) {
    const descLength = post.seoDescription.length;
    if (descLength >= 50 && descLength <= 160) score += 20;
    else if (descLength >= 30 && descLength <= 180) score += 10;
  } else if (post.excerpt) {
    const descLength = post.excerpt.length;
    if (descLength >= 50 && descLength <= 160) score += 15;
    else if (descLength >= 30 && descLength <= 180) score += 8;
  }

  // Keyword optimization (20 points)
  if (post.seoKeywords && post.seoKeywords.length > 0) {
    score += 10;
    if (post.seoKeywords.length >= 3 && post.seoKeywords.length <= 8) score += 10;
  }

  // Content length (15 points)
  const wordCount = countWords(post.content);
  if (wordCount >= 1500) score += 15;
  else if (wordCount >= 1000) score += 10;
  else if (wordCount >= 500) score += 5;

  // Focus keyword usage (15 points)
  if (post.focusKeyword) {
    const plainText = extractPlainText(post.content).toLowerCase();
    const keywordCount = (plainText.match(new RegExp(post.focusKeyword.toLowerCase(), 'g')) || []).length;
    const density = keywordCount / countWords(post.content);

    if (density >= 0.005 && density <= 0.03) score += 15;
    else if (keywordCount > 0) score += 8;
  }

  // Image alt text (10 points)
  if (post.featuredImage?.alt && post.featuredImage.alt.length > 0) {
    score += 10;
  }

  return Math.min(score, maxScore);
}

/**
 * Extract first image URL from content
 */
export function extractFirstImage(content: string): string | null {
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = content.match(imageRegex);
  return match ? match[1] : null;
}

/**
 * Clean HTML tags from content (for safety)
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + suffix;
  }

  return truncated + suffix;
}

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(scrollTop: number, contentHeight: number, windowHeight: number): number {
  const scrollable = contentHeight - windowHeight;
  if (scrollable <= 0) return 100;

  const progress = (scrollTop / scrollable) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Generate social share URLs
 */
export function generateShareUrls(post: {
  title: string;
  slug: string;
  url?: string;
  excerpt?: string;
}) {
  const postUrl = post.url || `${process.env.SITE_URL}/blog/${post.slug}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedText = post.excerpt ? encodeURIComponent(post.excerpt) : encodedTitle;

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}
