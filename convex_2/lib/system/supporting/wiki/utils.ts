// convex/lib/system/supporting/wiki/utils.ts

/**
 * Wiki Module Utilities
 * Validation and helper functions for wiki entry operations
 */
import { WIKI_CONSTANTS } from './constants'
import type { CreateWikiEntryData, UpdateWikiEntryData } from './types'

/**
 * Validate wiki entry data for create operation
 * @param data - Partial wiki entry data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateCreateWikiEntryData(data: Partial<CreateWikiEntryData>): string[] {
  const errors: string[] = []

  // Title validation
  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required')
    } else if (data.title.length > WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
    }
  }

  // Content validation
  if (data.content !== undefined) {
    if (!data.content.trim()) {
      errors.push('Content is required')
    } else if (data.content.length > WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
      errors.push(`Content must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`)
    }
  }

  // Summary validation
  if (data.summary !== undefined && data.summary.length > 500) {
    errors.push('Summary must be less than 500 characters')
  }

  // Category validation
  if (data.category !== undefined) {
    if (!data.category.trim()) {
      errors.push('Category is required')
    } else if (data.category.length > WIKI_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH) {
      errors.push(`Category must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH} characters`)
    }
  }

  // Tags validation
  if (data.tags) {
    if (data.tags.length > WIKI_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${WIKI_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`)
    }

    // Check for empty tags
    if (data.tags.some(tag => !tag.trim())) {
      errors.push('Tags cannot be empty')
    }
  }

  return errors
}

/**
 * Validate wiki entry data for update operation
 * @param data - Partial wiki entry data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateUpdateWikiEntryData(data: Partial<UpdateWikiEntryData>): string[] {
  const errors: string[] = []

  // Title validation
  if (data.title !== undefined && data.title.length > WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
    errors.push(`Title must be less than ${WIKI_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
  }

  // Content validation
  if (data.content !== undefined && data.content.length > WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH) {
    errors.push(`Content must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CONTENT_LENGTH} characters`)
  }

  // Summary validation
  if (data.summary !== undefined && data.summary.length > 500) {
    errors.push('Summary must be less than 500 characters')
  }

  // Category validation
  if (data.category !== undefined && data.category.length > WIKI_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH) {
    errors.push(`Category must be less than ${WIKI_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH} characters`)
  }

  // Tags validation
  if (data.tags) {
    if (data.tags.length > WIKI_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${WIKI_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`)
    }

    if (data.tags.some(tag => !tag.trim())) {
      errors.push('Tags cannot be empty')
    }
  }

  return errors
}

/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert
 * @returns URL-friendly slug
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, WIKI_CONSTANTS.LIMITS.MAX_SLUG_LENGTH)
}

/**
 * Create searchable content by lowercasing and normalizing
 * @param title - The title
 * @param content - The content
 * @param tags - Optional tags
 * @param summary - Optional summary
 * @returns Searchable content string
 */
export function createSearchableContent(title: string, content: string, tags?: string[], summary?: string): string {
  const parts = [title, content]

  if (summary) {
    parts.push(summary)
  }

  if (tags && tags.length > 0) {
    parts.push(tags.join(' '))
  }

  return parts.join(' ').toLowerCase()
}

/**
 * Search wiki entries by query string
 * @param entries - Array of wiki entries
 * @param query - Search query
 * @returns Filtered and scored entries
 */
export function searchWikiEntries<T extends { title: string; content: string; searchableContent?: string }>(
  entries: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return entries
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/)

  return entries.filter(entry => {
    const searchable = entry.searchableContent || createSearchableContent(entry.title, entry.content)

    // Entry must match all search terms
    return searchTerms.every(term => searchable.includes(term))
  })
}

/**
 * Extract plain text from markdown/HTML content
 * @param content - The content to extract from
 * @returns Plain text
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert markdown links to text
    .replace(/[*_~`#]/g, '') // Remove markdown formatting
    .trim()
}

/**
 * Get excerpt from content
 * @param content - The content
 * @param maxLength - Maximum length of excerpt
 * @returns Excerpt with ellipsis if truncated
 */
export function getExcerpt(content: string, maxLength: number = 200): string {
  const plainText = extractPlainText(content)

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.substring(0, maxLength).trim() + '...'
}
