// src/features/boilerplate/blog/utils/content.ts
/**
 * Content Utilities
 *
 * Helpers for content processing and formatting
 */

import { BLOG_CONFIG } from '../config';
import type { TableOfContentsItem } from '../types';

/**
 * Extract plain text from markdown content
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/!\[([^\]]*)]\([^)]+\)/g, '$1') // Remove markdown images
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove markdown italic
    .replace(/__([^_]+)__/g, '$1') // Remove markdown bold
    .replace(/_([^_]+)_/g, '$1') // Remove markdown italic
    .replace(/```[^`]*```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/^>\s+/gm, '') // Remove blockquotes
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Generate excerpt from content
 */
export function getExcerpt(content: string, maxLength: number = 200, suffix: string = '...'): string {
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
 * Count words in content
 */
export function countWords(content: string): number {
  const plainText = extractPlainText(content);
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Calculate estimated read time for content
 */
export function calculateReadTime(content: string): number {
  const plainText = extractPlainText(content);
  const words = plainText.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  // Base read time from words
  let minutes = Math.ceil(wordCount / BLOG_CONFIG.wordsPerMinute);

  // Add time for images
  const imageCount = (content.match(/!\[.*?]\(.*?\)/g) || []).length;
  minutes += Math.ceil((imageCount * BLOG_CONFIG.imageReadSeconds) / 60);

  // Add time for code blocks
  const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
  minutes += Math.ceil((codeBlockCount * BLOG_CONFIG.codeBlockReadSeconds) / 60);

  // Ensure minimum read time
  return Math.max(minutes, 1);
}

/**
 * Format read time for display
 */
export function formatReadTime(minutes: number): string {
  if (minutes < 1) return 'Less than a minute';
  if (minutes === 1) return '1 minute read';
  return `${minutes} min read`;
}

/**
 * Generate table of contents from markdown headers
 */
export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headerRegex = /^(#{1,6})\s+(.+)$/gm;
  const toc: TableOfContentsItem[] = [];
  let match;

  while ((match = headerRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = generateAnchorId(title);

    toc.push({ title, level, id, children: [] });
  }

  // Build hierarchical structure
  return buildTOCHierarchy(toc);
}

/**
 * Generate anchor ID from heading text
 */
function generateAnchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Build hierarchical TOC structure
 */
function buildTOCHierarchy(flatTOC: TableOfContentsItem[]): TableOfContentsItem[] {
  const root: TableOfContentsItem[] = [];
  const stack: TableOfContentsItem[] = [];

  flatTOC.forEach((item) => {
    // Find the correct parent based on level
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level item
      root.push(item);
    } else {
      // Child item
      const parent = stack[stack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    }

    stack.push(item);
  });

  return root;
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
 * Extract first image URL from content
 */
export function extractFirstImage(content: string): string | null {
  const imageRegex = /!\[.*?]\((.*?)\)/;
  const match = content.match(imageRegex);
  return match ? match[1] : null;
}

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(
  scrollTop: number,
  contentHeight: number,
  windowHeight: number
): number {
  const scrollable = contentHeight - windowHeight;
  if (scrollable <= 0) return 100;

  const progress = (scrollTop / scrollable) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number, locale: string = 'en-US'): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
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
 * Strip HTML tags from content
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Validate content meets minimum requirements
 */
export function validateContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const wordCount = countWords(content);

  if (wordCount < BLOG_CONFIG.minContentLength) {
    errors.push(
      `Content must be at least ${BLOG_CONFIG.minContentLength} words (currently ${wordCount} words)`
    );
  }

  if (content.length > BLOG_CONFIG.maxContentLength) {
    errors.push(
      `Content exceeds maximum length of ${BLOG_CONFIG.maxContentLength} characters`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
