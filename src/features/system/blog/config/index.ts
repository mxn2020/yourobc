// src/features/system/blog/config/index.ts
/**
 * Blog Feature Configuration
 *
 * Central configuration for the blog system
 */

import type { BlogProviderType, BlogProviderConfig } from '../types';
import { getEnv, getEnvWithDefault, envIsNotFalse, envIsTrue } from '../../_shared/env-utils';

/**
 * ============================================
 * ENVIRONMENT VARIABLES
 * ============================================
 */

export const BLOG_ENV = {
  // Blog feature toggle
  ENABLE_BLOG: envIsNotFalse('VITE_ENABLE_BLOG'),

  // Primary provider
  PRIMARY_PROVIDER: (getEnvWithDefault('VITE_PRIMARY_BLOG_PROVIDER', 'internal') as BlogProviderType),

  // Feature flags
  ALLOW_COMMENTS: envIsNotFalse('VITE_BLOG_ALLOW_COMMENTS'),
  MODERATE_COMMENTS: envIsTrue('VITE_BLOG_MODERATE_COMMENTS'),
  ENABLE_SCHEDULING: envIsNotFalse('VITE_BLOG_ENABLE_SCHEDULING'),
  ENABLE_MULTI_AUTHOR: envIsNotFalse('VITE_BLOG_ENABLE_MULTI_AUTHOR'),
  ENABLE_ANALYTICS: envIsNotFalse('VITE_BLOG_ENABLE_ANALYTICS'),

  // Site info
  SITE_URL: getEnvWithDefault('VITE_SITE_URL', ''),
  DEFAULT_OG_IMAGE: getEnvWithDefault('VITE_DEFAULT_OG_IMAGE', ''),
  DEFAULT_AUTHOR_ID: getEnvWithDefault('VITE_BLOG_DEFAULT_AUTHOR_ID', ''),

  // Ghost CMS
  GHOST_URL: getEnvWithDefault('VITE_GHOST_URL', ''),
  GHOST_CONTENT_API_KEY: getEnvWithDefault('VITE_GHOST_CONTENT_API_KEY', ''),
  GHOST_ADMIN_API_KEY: getEnvWithDefault('VITE_GHOST_ADMIN_API_KEY', ''),

  // Contentful
  CONTENTFUL_SPACE_ID: getEnvWithDefault('VITE_CONTENTFUL_SPACE_ID', ''),
  CONTENTFUL_ACCESS_TOKEN: getEnvWithDefault('VITE_CONTENTFUL_ACCESS_TOKEN', ''),
  CONTENTFUL_ENVIRONMENT: getEnvWithDefault('VITE_CONTENTFUL_ENVIRONMENT', 'master'),

  // Sanity
  SANITY_PROJECT_ID: getEnvWithDefault('VITE_SANITY_PROJECT_ID', ''),
  SANITY_DATASET: getEnvWithDefault('VITE_SANITY_DATASET', 'production'),
  SANITY_API_VERSION: getEnvWithDefault('VITE_SANITY_API_VERSION', '2024-01-01'),
  SANITY_TOKEN: getEnvWithDefault('VITE_SANITY_TOKEN', ''),
} as const;

/**
 * ============================================
 * PROVIDER CONFIGS
 * ============================================
 */

export const PROVIDER_CONFIGS: Record<BlogProviderType, BlogProviderConfig> = {
  internal: {
    type: 'internal',
    enabled: true,
    isPrimary: BLOG_ENV.PRIMARY_PROVIDER === 'internal',
  },
  ghost: {
    type: 'ghost',
    enabled: Boolean(BLOG_ENV.GHOST_URL && BLOG_ENV.GHOST_CONTENT_API_KEY),
    isPrimary: BLOG_ENV.PRIMARY_PROVIDER === 'ghost',
    credentials: {
      url: BLOG_ENV.GHOST_URL,
      contentApiKey: BLOG_ENV.GHOST_CONTENT_API_KEY,
      adminApiKey: BLOG_ENV.GHOST_ADMIN_API_KEY,
    },
    syncEnabled: false,
  },
  contentful: {
    type: 'contentful',
    enabled: Boolean(BLOG_ENV.CONTENTFUL_SPACE_ID && BLOG_ENV.CONTENTFUL_ACCESS_TOKEN),
    isPrimary: BLOG_ENV.PRIMARY_PROVIDER === 'contentful',
    credentials: {
      spaceId: BLOG_ENV.CONTENTFUL_SPACE_ID,
      accessToken: BLOG_ENV.CONTENTFUL_ACCESS_TOKEN,
      environment: BLOG_ENV.CONTENTFUL_ENVIRONMENT,
    },
    syncEnabled: false,
  },
  sanity: {
    type: 'sanity',
    enabled: Boolean(BLOG_ENV.SANITY_PROJECT_ID && BLOG_ENV.SANITY_DATASET),
    isPrimary: BLOG_ENV.PRIMARY_PROVIDER === 'sanity',
    credentials: {
      projectId: BLOG_ENV.SANITY_PROJECT_ID,
      dataset: BLOG_ENV.SANITY_DATASET,
      apiVersion: BLOG_ENV.SANITY_API_VERSION,
      token: BLOG_ENV.SANITY_TOKEN,
    },
    syncEnabled: false,
  },
};

/**
 * ============================================
 * FEATURE CONFIG
 * ============================================
 */

export const BLOG_CONFIG = {
  // General settings
  postsPerPage: 12,
  relatedPostsCount: 3,
  popularTagsCount: 10,
  recentPostsCount: 5,

  // Editor settings
  autoSaveInterval: 30000, // 30 seconds
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // Content limits
  minTitleLength: 3,
  maxTitleLength: 200,
  minContentLength: 100,
  maxContentLength: 100000,
  maxExcerptLength: 500,
  maxTagsPerPost: 10,

  // SEO settings
  seoTitleMinLength: 30,
  seoTitleMaxLength: 60,
  seoDescriptionMinLength: 50,
  seoDescriptionMaxLength: 160,
  maxSeoKeywords: 10,

  // Slug settings
  slugMaxWords: 10,
  reservedSlugs: [
    'new',
    'edit',
    'delete',
    'admin',
    'dashboard',
    'settings',
    'api',
    'blog',
    'post',
    'posts',
    'category',
    'categories',
    'tag',
    'tags',
    'author',
    'authors',
  ],

  // Read time calculation
  wordsPerMinute: 200,
  imageReadSeconds: 12,
  codeBlockReadSeconds: 10,

  // Comments settings
  allowComments: BLOG_ENV.ALLOW_COMMENTS,
  moderateComments: BLOG_ENV.MODERATE_COMMENTS,
  maxCommentLength: 2000,

  // Feature flags
  enableScheduling: BLOG_ENV.ENABLE_SCHEDULING,
  enableMultiAuthor: BLOG_ENV.ENABLE_MULTI_AUTHOR,
  enableAnalytics: BLOG_ENV.ENABLE_ANALYTICS,
  enableSeries: true,
  enablePinned: true,
  enableFeatured: true,
  enableRelatedPosts: true,
  enableTableOfContents: true,
  enableSocialSharing: true,
  enableReadingProgress: true,

  // Public routes
  routes: {
    blog: '/blog',
    post: '/blog/:slug',
    category: '/blog/category/:slug',
    tag: '/blog/tag/:slug',
    author: '/blog/author/:slug',
    search: '/blog/search',
    rss: '/blog/rss.xml',
    sitemap: '/blog/sitemap.xml',
  },

  // Admin routes
  adminRoutes: {
    dashboard: '/admin/blog',
    posts: '/admin/blog/posts',
    newPost: '/admin/blog/posts/new',
    editPost: '/admin/blog/posts/:id/edit',
    categories: '/admin/blog/categories',
    tags: '/admin/blog/tags',
    authors: '/admin/blog/authors',
    settings: '/admin/blog/settings',
    analytics: '/admin/blog/analytics',
  },
} as const;

/**
 * ============================================
 * PROVIDER DETECTION
 * ============================================
 */

/**
 * Get the primary blog provider
 */
export function getPrimaryProvider(): BlogProviderType {
  const primary = BLOG_ENV.PRIMARY_PROVIDER;

  // Validate that primary provider is enabled
  if (PROVIDER_CONFIGS[primary]?.enabled) {
    return primary;
  }

  // Fallback to internal if primary is not enabled
  console.warn(
    `Primary blog provider "${primary}" is not enabled. Falling back to internal provider.`
  );
  return 'internal';
}

/**
 * Get enabled providers
 */
export function getEnabledProviders(): BlogProviderType[] {
  return Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => config.enabled)
    .map(([type, _]) => type as BlogProviderType);
}

/**
 * Check if a provider is enabled
 */
export function isProviderEnabled(provider: BlogProviderType): boolean {
  return PROVIDER_CONFIGS[provider]?.enabled || false;
}

/**
 * Get provider config
 */
export function getProviderConfig(provider: BlogProviderType): BlogProviderConfig {
  return PROVIDER_CONFIGS[provider];
}

/**
 * ============================================
 * VALIDATION HELPERS
 * ============================================
 */

/**
 * Validate blog configuration
 */
export function validateBlogConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if at least one provider is enabled
  const enabledProviders = getEnabledProviders();
  if (enabledProviders.length === 0) {
    errors.push('No blog providers are enabled');
  }

  // Check primary provider
  const primary = BLOG_ENV.PRIMARY_PROVIDER;
  if (!PROVIDER_CONFIGS[primary]) {
    errors.push(`Invalid primary provider: ${primary}`);
  } else if (!PROVIDER_CONFIGS[primary].enabled) {
    errors.push(`Primary provider "${primary}" is not enabled`);
  }

  // Check Ghost config if enabled
  if (PROVIDER_CONFIGS.ghost.enabled) {
    if (!BLOG_ENV.GHOST_URL) {
      errors.push('Ghost URL is required when Ghost provider is enabled');
    }
    if (!BLOG_ENV.GHOST_CONTENT_API_KEY) {
      errors.push('Ghost Content API key is required when Ghost provider is enabled');
    }
  }

  // Check Contentful config if enabled
  if (PROVIDER_CONFIGS.contentful.enabled) {
    if (!BLOG_ENV.CONTENTFUL_SPACE_ID) {
      errors.push('Contentful Space ID is required when Contentful provider is enabled');
    }
    if (!BLOG_ENV.CONTENTFUL_ACCESS_TOKEN) {
      errors.push('Contentful Access Token is required when Contentful provider is enabled');
    }
  }

  // Check Sanity config if enabled
  if (PROVIDER_CONFIGS.sanity.enabled) {
    if (!BLOG_ENV.SANITY_PROJECT_ID) {
      errors.push('Sanity Project ID is required when Sanity provider is enabled');
    }
    if (!BLOG_ENV.SANITY_DATASET) {
      errors.push('Sanity Dataset is required when Sanity provider is enabled');
    }
  }

  // Check site URL for SEO
  if (!BLOG_ENV.SITE_URL) {
    warnings.push('Site URL is recommended for proper SEO and social sharing');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if blog feature is enabled
 */
export function isBlogEnabled(): boolean {
  return BLOG_ENV.ENABLE_BLOG;
}

/**
 * ============================================
 * EXPORT
 * ============================================
 */

export default BLOG_CONFIG;
