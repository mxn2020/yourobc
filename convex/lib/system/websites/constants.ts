// convex/lib/boilerplate/websites/constants.ts

export const WEBSITE_CONSTANTS = {
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
    MAINTENANCE: 'maintenance',
  },
  PAGE_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SCHEDULED: 'scheduled',
    ARCHIVED: 'archived',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },
  PERMISSIONS: {
    VIEW: 'websites.view',
    CREATE: 'websites.create',
    EDIT: 'websites.edit',
    DELETE: 'websites.delete',
    PUBLISH: 'websites.publish',
    MANAGE_COLLABORATORS: 'websites.manage_collaborators',
    MANAGE_THEME: 'websites.manage_theme',
  },
  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_TITLE_LENGTH: 200,
    MAX_SLUG_LENGTH: 200,
    MAX_PATH_LENGTH: 500,
    MAX_PAGES_PER_WEBSITE: 100,
    MAX_SECTIONS_PER_PAGE: 50,
    MAX_BLOCKS_PER_SECTION: 100,
    MAX_COLLABORATORS: 25,
    MAX_CUSTOM_CSS_LENGTH: 50000,
    MAX_CUSTOM_JS_LENGTH: 50000,
    MAX_TAGS: 20,
  },
  PAGE_TEMPLATE_TYPES: {
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
  },
  SECTION_TYPES: {
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
  },
  THEME_TYPES: {
    MODERN: 'modern',
    CLASSIC: 'classic',
    MINIMAL: 'minimal',
    BOLD: 'bold',
    ELEGANT: 'elegant',
    CREATIVE: 'creative',
    CUSTOM: 'custom',
  },
  LAYOUT_TYPES: {
    FULL_WIDTH: 'full_width',
    BOXED: 'boxed',
    SPLIT: 'split',
    SIDEBAR_LEFT: 'sidebar_left',
    SIDEBAR_RIGHT: 'sidebar_right',
    CUSTOM: 'custom',
  },
  BLOCK_TYPES: {
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
  },
  COLLABORATOR_ROLES: {
    OWNER: 'owner',
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer',
  },
} as const

export const PRIORITY_WEIGHTS = {
  [WEBSITE_CONSTANTS.PRIORITY.LOW]: 1,
  [WEBSITE_CONSTANTS.PRIORITY.MEDIUM]: 2,
  [WEBSITE_CONSTANTS.PRIORITY.HIGH]: 3,
  [WEBSITE_CONSTANTS.PRIORITY.URGENT]: 4,
  [WEBSITE_CONSTANTS.PRIORITY.CRITICAL]: 5,
} as const

// Type exports for TypeScript safety
export type WebsiteStatus = typeof WEBSITE_CONSTANTS.STATUS[keyof typeof WEBSITE_CONSTANTS.STATUS]
export type PageStatus = typeof WEBSITE_CONSTANTS.PAGE_STATUS[keyof typeof WEBSITE_CONSTANTS.PAGE_STATUS]
export type WebsiteVisibility = typeof WEBSITE_CONSTANTS.VISIBILITY[keyof typeof WEBSITE_CONSTANTS.VISIBILITY]
export type PageTemplateType = typeof WEBSITE_CONSTANTS.PAGE_TEMPLATE_TYPES[keyof typeof WEBSITE_CONSTANTS.PAGE_TEMPLATE_TYPES]
export type SectionType = typeof WEBSITE_CONSTANTS.SECTION_TYPES[keyof typeof WEBSITE_CONSTANTS.SECTION_TYPES]
export type ThemeType = typeof WEBSITE_CONSTANTS.THEME_TYPES[keyof typeof WEBSITE_CONSTANTS.THEME_TYPES]
export type LayoutType = typeof WEBSITE_CONSTANTS.LAYOUT_TYPES[keyof typeof WEBSITE_CONSTANTS.LAYOUT_TYPES]
export type BlockType = typeof WEBSITE_CONSTANTS.BLOCK_TYPES[keyof typeof WEBSITE_CONSTANTS.BLOCK_TYPES]
export type CollaboratorRole = typeof WEBSITE_CONSTANTS.COLLABORATOR_ROLES[keyof typeof WEBSITE_CONSTANTS.COLLABORATOR_ROLES]
