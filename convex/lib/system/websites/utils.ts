// convex/lib/boilerplate/websites/utils.ts

import { WEBSITE_CONSTANTS, PRIORITY_WEIGHTS } from './constants'
import type { Website, WebsitePage, WebsiteSection, CreateWebsiteData, CreatePageData, CreateSectionData } from './types'

export function validateWebsiteData(data: Partial<Website>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required')
    } else if (data.name.length > WEBSITE_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`)
    }
  }

  if (data.description && data.description.length > WEBSITE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`)
  }

  if (data.domain) {
    if (!isValidDomain(data.domain)) {
      errors.push('Invalid domain format')
    }
  }

  if (data.subdomain) {
    if (!isValidSubdomain(data.subdomain)) {
      errors.push('Invalid subdomain format')
    }
  }

  if (data.settings?.customCss && data.settings.customCss.length > WEBSITE_CONSTANTS.LIMITS.MAX_CUSTOM_CSS_LENGTH) {
    errors.push(`Custom CSS must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_CUSTOM_CSS_LENGTH} characters`)
  }

  if (data.settings?.customJs && data.settings.customJs.length > WEBSITE_CONSTANTS.LIMITS.MAX_CUSTOM_JS_LENGTH) {
    errors.push(`Custom JavaScript must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_CUSTOM_JS_LENGTH} characters`)
  }

  if (data.tags && data.tags.length > WEBSITE_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${WEBSITE_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`)
  }

  return errors
}

export function validatePageData(data: Partial<WebsitePage>): string[] {
  const errors: string[] = []

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required')
    } else if (data.title.length > WEBSITE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`)
    }
  }

  if (data.slug !== undefined) {
    if (!data.slug.trim()) {
      errors.push('Slug is required')
    } else if (data.slug.length > WEBSITE_CONSTANTS.LIMITS.MAX_SLUG_LENGTH) {
      errors.push(`Slug must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_SLUG_LENGTH} characters`)
    } else if (!isValidSlug(data.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens')
    }
  }

  if (data.path !== undefined) {
    if (!data.path.trim()) {
      errors.push('Path is required')
    } else if (data.path.length > WEBSITE_CONSTANTS.LIMITS.MAX_PATH_LENGTH) {
      errors.push(`Path must be less than ${WEBSITE_CONSTANTS.LIMITS.MAX_PATH_LENGTH} characters`)
    } else if (!isValidPath(data.path)) {
      errors.push('Invalid path format')
    }
  }

  if (data.scheduledAt && data.scheduledAt < Date.now()) {
    errors.push('Scheduled date must be in the future')
  }

  return errors
}

export function validateSectionData(data: Partial<WebsiteSection>): string[] {
  const errors: string[] = []

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Section name is required')
    }
  }

  if (data.blocks && data.blocks.length > WEBSITE_CONSTANTS.LIMITS.MAX_BLOCKS_PER_SECTION) {
    errors.push(`Maximum ${WEBSITE_CONSTANTS.LIMITS.MAX_BLOCKS_PER_SECTION} blocks allowed per section`)
  }

  return errors
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

export function isValidSubdomain(subdomain: string): boolean {
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  return subdomainRegex.test(subdomain)
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function isValidPath(path: string): boolean {
  // Path should start with / and contain valid URL characters
  const pathRegex = /^\/([a-z0-9-_/]*)$/i
  return pathRegex.test(path)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generatePath(slug: string, parentPath?: string): string {
  if (parentPath && parentPath !== '/') {
    return `${parentPath}/${slug}`
  }
  return `/${slug}`
}

export function getWebsiteStatusColor(status: Website['status']): string {
  const colors = {
    draft: '#6b7280',
    published: '#10b981',
    archived: '#9ca3af',
    maintenance: '#f59e0b',
  }
  return colors[status] || colors.draft
}

export function getPageStatusColor(status: WebsitePage['status']): string {
  const colors = {
    draft: '#6b7280',
    published: '#10b981',
    scheduled: '#3b82f6',
    archived: '#9ca3af',
  }
  return colors[status] || colors.draft
}

export function getWebsitePriorityWeight(priority: Website['priority']): number {
  return PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS[WEBSITE_CONSTANTS.PRIORITY.MEDIUM]
}

export function compareWebsitePriority(a: Website, b: Website): number {
  const aWeight = getWebsitePriorityWeight(a.priority)
  const bWeight = getWebsitePriorityWeight(b.priority)
  return bWeight - aWeight // Higher priority first
}

export function getWebsitePriorityColor(priority: Website['priority']): string {
  const colors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
    critical: '#dc2626',
  }
  return colors[priority] || colors.medium
}

export function isPagePublished(page: WebsitePage): boolean {
  if (page.status !== WEBSITE_CONSTANTS.PAGE_STATUS.PUBLISHED) {
    return false
  }
  if (page.scheduledAt && page.scheduledAt > Date.now()) {
    return false
  }
  return true
}

export function isWebsitePublished(website: Website): boolean {
  return website.status === WEBSITE_CONSTANTS.STATUS.PUBLISHED
}

export function getPageUrl(page: WebsitePage, website: Website): string {
  const baseUrl = website.domain || `${website.subdomain}.example.com`
  return `https://${baseUrl}${page.path}`
}

export function formatSEOTitle(title: string, siteName?: string): string {
  if (!siteName) return title
  return `${title} | ${siteName}`
}

export function formatSEODescription(description?: string, defaultDescription?: string): string {
  return description || defaultDescription || ''
}

export function extractImageFromContent(content: string): string | null {
  // Simple regex to extract first image URL from HTML content
  const imgRegex = /<img[^>]+src="([^">]+)"/
  const match = content.match(imgRegex)
  return match ? match[1] : null
}

export function calculateReadingTime(content: string): number {
  // Average reading speed is 200 words per minute
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function sanitizeHTML(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
}

export function sortSectionsByOrder(sections: WebsiteSection[]): WebsiteSection[] {
  return [...sections].sort((a, b) => {
    // Sections don't have direct order, but blocks do
    return 0
  })
}

export function sortBlocksByOrder(blocks: WebsiteSection['blocks']): WebsiteSection['blocks'] {
  return [...blocks].sort((a, b) => a.order - b.order)
}

export function getDefaultThemeConfig() {
  return {
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFontFamily: 'Inter, system-ui, sans-serif',
      fontSize: {
        base: '16px',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        h4: '1.5rem',
        h5: '1.25rem',
        h6: '1rem',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      unit: '0.25rem',
      xs: '0.5rem',
      sm: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borders: {
      radius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px',
      },
      width: {
        thin: '1px',
        normal: '2px',
        thick: '4px',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  }
}

export function mergeThemeConfig(baseConfig: any, customConfig: any): any {
  return {
    ...baseConfig,
    ...customConfig,
    colors: { ...baseConfig.colors, ...customConfig.colors },
    typography: { ...baseConfig.typography, ...customConfig.typography },
    spacing: { ...baseConfig.spacing, ...customConfig.spacing },
    borders: { ...baseConfig.borders, ...customConfig.borders },
    shadows: { ...baseConfig.shadows, ...customConfig.shadows },
  }
}
