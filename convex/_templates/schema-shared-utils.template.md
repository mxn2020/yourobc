// convex/lib/addons/[addon_name]/shared/utils.ts

/**
 * ============================================================================
 * SHARED UTILITIES TEMPLATE
 * ============================================================================
 *
 * This file contains utility functions that are shared across all modules
 * within the addon. Use this for common operations that multiple entities need.
 *
 * USAGE:
 * 1. Copy to: convex/lib/addons/[addon_name]/shared/utils.ts
 * 2. Implement common utility functions
 * 3. Import in individual module utils files
 * 4. Keep functions generic and reusable
 *
 * WHEN TO USE SHARED UTILITIES:
 * - Error handling helpers
 * - Common validation functions
 * - Data transformation utilities
 * - Access control helpers
 * - Pagination builders
 * - Date/time utilities
 *
 * WHEN NOT TO USE:
 * - Entity-specific business logic (use module's utils.ts)
 * - Module-specific validation (use module's utils.ts)
 * - Complex entity relationships (use module's utils.ts)
 *
 * REQUIRED: All entities must have a main display field (name/title/displayName)
 * for auditLogs and UI display. See schema-patterns.template.md for details.
 *
 * ============================================================================
 */

import { SHARED_DEFAULTS } from './constants'
import type { ListResult } from './types'

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Throw a not found error with consistent formatting
 *
 * @param entityName - Name of the entity (e.g., 'Project', 'User')
 * @throws Error with formatted message
 */
export function throwNotFoundError(entityName: string): never {
  throw new Error(`${entityName} not found`)
}

/**
 * Throw an access denied error with custom message
 *
 * @param message - Custom error message
 * @throws Error with the provided message
 */
export function throwAccessError(message?: string): never {
  throw new Error(message || 'You do not have permission to perform this action')
}

/**
 * Throw a validation error with field details
 *
 * @param errors - Array of validation error messages
 * @throws Error with formatted validation errors
 */
export function throwValidationError(errors: string[]): never {
  throw new Error(`Validation failed: ${errors.join(', ')}`)
}

/**
 * Throw a conflict error (e.g., duplicate entry)
 *
 * @param message - Description of the conflict
 * @throws Error with the provided message
 */
export function throwConflictError(message: string): never {
  throw new Error(message)
}

// ============================================================================
// ACCESS CONTROL UTILITIES
// ============================================================================

/**
 * Check if a user can view an entity based on ownership and visibility
 *
 * @param authUserId - The user attempting to view
 * @param ownerId - The entity owner's ID
 * @param visibility - The entity's visibility setting
 * @param collaborators - Array of collaborator user IDs
 * @returns true if user can view, false otherwise
 */
export function canView(
  authUserId: string,
  ownerId: string,
  visibility: string,
  collaborators?: string[]
): boolean {
  // Owner can always view
  if (authUserId === ownerId) {
    return true
  }

  // Public entities can be viewed by anyone
  if (visibility === 'public') {
    return true
  }

  // Collaborators can view
  if (collaborators && collaborators.includes(authUserId)) {
    return true
  }

  // Add organization-level access if needed:
  // if (visibility === 'organization' && isSameOrganization(authUserId, ownerId)) {
  //   return true
  // }

  return false
}

/**
 * Check if a user can edit an entity
 *
 * @param authUserId - The user attempting to edit
 * @param ownerId - The entity owner's ID
 * @param collaborators - Array of collaborator user IDs
 * @returns true if user can edit, false otherwise
 */
export function canEdit(
  authUserId: string,
  ownerId: string,
  collaborators?: string[]
): boolean {
  // Owner can edit
  if (authUserId === ownerId) {
    return true
  }

  // Collaborators can edit
  if (collaborators && collaborators.includes(authUserId)) {
    return true
  }

  return false
}

/**
 * Check if a user can delete an entity
 *
 * Usually more restrictive than edit - typically only owner
 *
 * @param authUserId - The user attempting to delete
 * @param ownerId - The entity owner's ID
 * @returns true if user can delete, false otherwise
 */
export function canDelete(authUserId: string, ownerId: string): boolean {
  // Only owner can delete
  return authUserId === ownerId
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Build a standardized paginated response
 *
 * @param items - Array of items for the current page
 * @param total - Total number of items across all pages
 * @param limit - Number of items per page
 * @param offset - Starting position
 * @returns Standardized ListResult object
 */
export function buildListResult<T>(
  items: T[],
  total: number,
  limit: number,
  offset: number
): ListResult<T> {
  return {
    items,
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  }
}

/**
 * Calculate pagination parameters with defaults and validation
 *
 * @param limit - Requested limit (optional)
 * @param offset - Requested offset (optional)
 * @param maxLimit - Maximum allowed limit (optional)
 * @returns Validated pagination parameters
 */
export function calculatePagination(
  limit?: number,
  offset?: number,
  maxLimit: number = 100
): { limit: number; offset: number } {
  // Use defaults if not provided
  const finalLimit = limit ?? SHARED_DEFAULTS.LIMIT
  const finalOffset = offset ?? 0

  // Validate and clamp values
  return {
    limit: Math.max(1, Math.min(finalLimit, maxLimit)),
    offset: Math.max(0, finalOffset),
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns true if valid URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate string length
 *
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns true if length is within bounds
 */
export function isValidLength(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  const length = value.trim().length
  return length >= minLength && length <= maxLength
}

/**
 * Check if a value is defined and not null
 *
 * @param value - Value to check
 * @returns true if value is defined and not null
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Safely trim a string (handles undefined/null)
 *
 * @param value - String to trim
 * @returns Trimmed string or undefined
 */
export function safeTrim(value: string | undefined | null): string | undefined {
  return value?.trim() || undefined
}

/**
 * Convert string to slug format
 *
 * @param text - Text to convert
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Truncate text to a maximum length
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Remove duplicate items from array
 *
 * @param array - Array with potential duplicates
 * @returns Array with unique items
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Sort array by a property
 *
 * @param array - Array to sort
 * @param property - Property to sort by
 * @param order - Sort order (asc or desc)
 * @returns Sorted array
 */
export function sortBy<T>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[property]
    const bVal = b[property]

    if (aVal < bVal) return order === 'asc' ? -1 : 1
    if (aVal > bVal) return order === 'asc' ? 1 : -1
    return 0
  })
}

// ============================================================================
// DATE/TIME UTILITIES
// ============================================================================

/**
 * Format a timestamp to a readable date string
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Format a timestamp to a readable datetime string
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted datetime string
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

/**
 * Check if a date is in the past
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < Date.now()
}

/**
 * Check if a date is in the future
 *
 * @param timestamp - Timestamp in milliseconds
 * @returns true if date is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > Date.now()
}

/**
 * Calculate days between two timestamps
 *
 * @param start - Start timestamp
 * @param end - End timestamp
 * @returns Number of days between dates
 */
export function daysBetween(start: number, end: number): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((end - start) / msPerDay)
}

// ============================================================================
// FILTERING UTILITIES
// ============================================================================

/**
 * Filter array by search query
 *
 * Searches in specified fields (case-insensitive)
 *
 * @param items - Array of items to search
 * @param searchQuery - Search query string
 * @param searchFields - Fields to search in
 * @returns Filtered array
 */
export function filterBySearch<T>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchQuery.trim()) {
    return items
  }

  const query = searchQuery.toLowerCase()

  return items.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query)
      }
      return false
    })
  })
}

/**
 * Filter array by status
 *
 * @param items - Array of items to filter
 * @param statuses - Array of allowed statuses
 * @param statusField - Field name for status
 * @returns Filtered array
 */
export function filterByStatus<T>(
  items: T[],
  statuses: string[],
  statusField: keyof T = 'status' as keyof T
): T[] {
  if (statuses.length === 0) {
    return items
  }

  return items.filter((item) => statuses.includes(item[statusField] as string))
}

/**
 * Filter array by tags (match any tag)
 *
 * @param items - Array of items to filter
 * @param tags - Tags to filter by
 * @param tagsField - Field name for tags array
 * @returns Filtered array
 */
export function filterByTags<T>(
  items: T[],
  tags: string[],
  tagsField: keyof T = 'tags' as keyof T
): T[] {
  if (tags.length === 0) {
    return items
  }

  return items.filter((item) => {
    const itemTags = item[tagsField] as unknown as string[]
    return itemTags && itemTags.some((tag) => tags.includes(tag))
  })
}

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Remove sensitive fields from an object
 *
 * @param obj - Object to sanitize
 * @param sensitiveFields - Fields to remove
 * @returns Sanitized object
 */
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  sensitiveFields: string[]
): Partial<T> {
  const sanitized = { ...obj }
  sensitiveFields.forEach((field) => {
    delete sanitized[field]
  })
  return sanitized
}

/**
 * Sanitize HTML content (basic - use DOMPurify in production)
 *
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .trim()
}

// ============================================================================
// CUSTOM UTILITIES
// ============================================================================

/**
 * Add your custom shared utilities here
 *
 * Examples:
 * - API request helpers
 * - Data formatting functions
 * - Business logic calculators
 * - File handling utilities
 */
