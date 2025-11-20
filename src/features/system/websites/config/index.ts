// src/features/system/websites/config/index.ts

export const WEBSITES_CONFIG = {
  limits: {
    maxWebsitesPerUser: 10,
    maxPagesPerWebsite: 100,
    maxSectionsPerPage: 50,
    maxBlocksPerSection: 100,
    maxCollaborators: 25,
  },
  features: {
    customDomain: true,
    themes: true,
    templates: true,
    pageBuilder: true,
    seo: true,
    analytics: true,
  },
  defaults: {
    visibility: 'private',
    status: 'draft',
    layout: 'full_width',
    theme: 'modern',
  },
} as const

export function validateWebsitesConfig() {
  const config = WEBSITES_CONFIG
  const errors: string[] = []

  // Validate limits
  if (config.limits.maxWebsitesPerUser < 1) {
    errors.push('Max websites per user must be at least 1')
  }

  if (config.limits.maxPagesPerWebsite < 1) {
    errors.push('Max pages per website must be at least 1')
  }

  if (config.limits.maxSectionsPerPage < 1) {
    errors.push('Max sections per page must be at least 1')
  }

  if (errors.length > 0) {
    console.error('Website configuration errors:', errors)
  }

  return errors.length === 0
}

// Validate config on load
validateWebsitesConfig()
