// src/features/system/blog/utils/slug.ts
/**
 * Slug Utilities
 *
 * Frontend utilities for slug generation and validation
 */

import { BLOG_CONFIG } from '../config';

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string, maxWords: number = BLOG_CONFIG.slugMaxWords): string {
  let slug = title.toLowerCase().trim();

  // Remove special characters
  slug = slug.replace(/[^a-z0-9\s-]/gi, '');

  // Replace spaces with hyphens
  slug = slug.replace(/\s+/g, '-');

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Limit to max words
  const words = slug.split('-').filter((word) => word.length > 0);
  if (words.length > maxWords) {
    slug = words.slice(0, maxWords).join('-');
  }

  return slug;
}

/**
 * Check if slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return (BLOG_CONFIG.reservedSlugs as readonly string[]).includes(slug.toLowerCase());
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && !isReservedSlug(slug);
}

/**
 * Make slug unique by appending number if needed
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
