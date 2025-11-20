/**
 * Shared constants used across supporting features
 */

import { ENTITY_TYPE_LABELS, SupportingEntityType, SUPPORTING_ENTITY_TYPES } from './types';

/**
 * Maximum content lengths
 */
export const MAX_CONTENT_LENGTH = {
  SHORT_TEXT: 255,
  MEDIUM_TEXT: 1000,
  LONG_TEXT: 5000,
  VERY_LONG_TEXT: 50000,
} as const;

/**
 * Default pagination limits
 */
export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  SMALL: 1024 * 1024, // 1MB
  MEDIUM: 5 * 1024 * 1024, // 5MB
  LARGE: 10 * 1024 * 1024, // 10MB
  VERY_LARGE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Allowed file types for attachments
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  ALL: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const;

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  TOO_SHORT: (min: number) => `Must be at least ${min} characters`,
  TOO_LONG: (max: number) => `Must be no more than ${max} characters`,
  INVALID_DATE: 'Please enter a valid date',
  INVALID_FILE_TYPE: 'File type not allowed',
  FILE_TOO_LARGE: (maxSize: number) => `File size must be less than ${maxSize}MB`,
} as const;

/**
 * Check if a string is a valid entity type
 */
export function isSupportingEntityType(value: unknown): value is SupportingEntityType {
  return typeof value === 'string' && SUPPORTING_ENTITY_TYPES.includes(value as SupportingEntityType);
}

/**
 * Get label for entity type
 */
export function getEntityTypeLabel(entityType: SupportingEntityType): string {
  return ENTITY_TYPE_LABELS[entityType] || entityType;
}

/**
 * Get label for entity type with fallback
 */
export function getSafeEntityTypeLabel(entityType: string): string {
  if (isSupportingEntityType(entityType)) {
    return getEntityTypeLabel(entityType);
  }
  // Fallback: capitalize first letter
  return entityType.charAt(0).toUpperCase() + entityType.slice(1);
}

/**
 * Get all entity types
 */
export function getAllEntityTypes(): SupportingEntityType[] {
  return [...SUPPORTING_ENTITY_TYPES];
}

/**
 * Get entity type options for select inputs
 */
export function getEntityTypeOptions(): Array<{ value: SupportingEntityType; label: string }> {
  return SUPPORTING_ENTITY_TYPES.map((type) => ({
    value: type,
    label: getEntityTypeLabel(type),
  }));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function isAllowedFileType(mimeType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
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
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
