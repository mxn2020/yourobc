// convex/lib/boilerplate/websites/websites/utils.ts
// Validation functions and utility helpers for websites module

import { WEBSITES_CONSTANTS, PRIORITY_WEIGHTS } from './constants';
import type { Website, CreateWebsiteData, UpdateWebsiteData } from './types';

/**
 * Validate website data for creation/update
 */
export function validateWebsiteData(
  data: Partial<CreateWebsiteData | UpdateWebsiteData>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < WEBSITES_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${WEBSITES_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > WEBSITES_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${WEBSITES_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!WEBSITES_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > WEBSITES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${WEBSITES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate domain
  if (data.domain) {
    if (!isValidDomain(data.domain)) {
      errors.push('Invalid domain format');
    }
  }

  // Validate subdomain
  if (data.subdomain) {
    if (!isValidSubdomain(data.subdomain)) {
      errors.push('Invalid subdomain format');
    }
  }

  // Validate custom CSS length
  if ('settings' in data && data.settings?.customCss) {
    if (data.settings.customCss.length > WEBSITES_CONSTANTS.LIMITS.MAX_CUSTOM_CSS_LENGTH) {
      errors.push(`Custom CSS must be less than ${WEBSITES_CONSTANTS.LIMITS.MAX_CUSTOM_CSS_LENGTH} characters`);
    }
  }

  // Validate custom JS length
  if ('settings' in data && data.settings?.customJs) {
    if (data.settings.customJs.length > WEBSITES_CONSTANTS.LIMITS.MAX_CUSTOM_JS_LENGTH) {
      errors.push(`Custom JavaScript must be less than ${WEBSITES_CONSTANTS.LIMITS.MAX_CUSTOM_JS_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > WEBSITES_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${WEBSITES_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  return WEBSITES_CONSTANTS.VALIDATION.DOMAIN_PATTERN.test(domain);
}

/**
 * Validate subdomain format
 */
export function isValidSubdomain(subdomain: string): boolean {
  return WEBSITES_CONSTANTS.VALIDATION.SUBDOMAIN_PATTERN.test(subdomain);
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format website display name
 */
export function formatWebsiteDisplayName(website: { name: string; status?: string }): string {
  const statusBadge = website.status ? ` [${website.status}]` : '';
  return `${website.name}${statusBadge}`;
}

/**
 * Get website status color
 */
export function getWebsiteStatusColor(status: Website['status']): string {
  const colors = {
    draft: '#6b7280',
    published: '#10b981',
    archived: '#9ca3af',
    maintenance: '#f59e0b',
  };
  return colors[status] || colors.draft;
}

/**
 * Get website priority weight
 */
export function getWebsitePriorityWeight(priority: Website['priority']): number {
  return PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS[WEBSITES_CONSTANTS.PRIORITY.MEDIUM];
}

/**
 * Get website priority color
 */
export function getWebsitePriorityColor(priority: Website['priority']): string {
  const colors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
    critical: '#dc2626',
  };
  return colors[priority] || colors.medium;
}

/**
 * Compare websites by priority
 */
export function compareWebsitePriority(a: Website, b: Website): number {
  const aWeight = getWebsitePriorityWeight(a.priority);
  const bWeight = getWebsitePriorityWeight(b.priority);
  return bWeight - aWeight; // Higher priority first
}

/**
 * Check if website is published
 */
export function isWebsitePublished(website: Website): boolean {
  return website.status === WEBSITES_CONSTANTS.STATUS.PUBLISHED;
}

/**
 * Check if website is editable
 */
export function isWebsiteEditable(website: { status: string; deletedAt?: number }): boolean {
  if (website.deletedAt) return false;
  return website.status !== WEBSITES_CONSTANTS.STATUS.ARCHIVED;
}

/**
 * Format SEO title
 */
export function formatSEOTitle(title: string, siteName?: string): string {
  if (!siteName) return title;
  return `${title} | ${siteName}`;
}

/**
 * Format SEO description
 */
export function formatSEODescription(description?: string, defaultDescription?: string): string {
  return description || defaultDescription || '';
}

/**
 * Sanitize HTML (basic implementation)
 */
export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');
}
