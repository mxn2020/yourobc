// src/features/boilerplate/websites/constants/index.ts

export const WEBSITE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  MAINTENANCE: 'maintenance',
} as const

export const PAGE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
} as const

export const WEBSITE_VISIBILITY = {
  PRIVATE: 'private',
  TEAM: 'team',
  PUBLIC: 'public',
} as const

export const PAGE_TEMPLATES = {
  LANDING: 'landing',
  FEATURES: 'features',
  ABOUT: 'about',
  CONTACT: 'contact',
  BLOG: 'blog',
  SERVICES: 'services',
  PRICING: 'pricing',
  TESTIMONIALS: 'testimonials',
  PRIVACY: 'privacy',
  TERMS: 'terms',
  COOKIES: 'cookies',
  GDPR: 'gdpr',
  CUSTOM: 'custom',
} as const

export const SECTION_TYPES = {
  HERO: 'hero',
  FEATURES: 'features',
  TESTIMONIALS: 'testimonials',
  PRICING: 'pricing',
  CTA: 'cta',
  FAQ: 'faq',
  TEAM: 'team',
  GALLERY: 'gallery',
  STATS: 'stats',
  CONTACT_FORM: 'contact_form',
  NEWSLETTER: 'newsletter',
  BLOG_LIST: 'blog_list',
  CUSTOM: 'custom',
} as const

export const LAYOUT_TYPES = {
  FULL_WIDTH: 'full_width',
  BOXED: 'boxed',
  SPLIT: 'split',
  SIDEBAR_LEFT: 'sidebar_left',
  SIDEBAR_RIGHT: 'sidebar_right',
  CUSTOM: 'custom',
} as const

export const THEME_TYPES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
  BOLD: 'bold',
  ELEGANT: 'elegant',
  CREATIVE: 'creative',
  CUSTOM: 'custom',
} as const

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  BUTTON: 'button',
  FORM: 'form',
  CODE: 'code',
  DIVIDER: 'divider',
  SPACER: 'spacer',
  HTML: 'html',
  CUSTOM: 'custom',
} as const

export const DEFAULT_LIMITS = {
  WEBSITES_PER_PAGE: 20,
  PAGES_PER_WEBSITE: 100,
  SECTIONS_PER_PAGE: 50,
} as const
