// src/features/yourobc/supporting/config/supporting.config.ts
/**
 * Supporting Modules Configuration
 * This configuration file allows enabling/disabling features of the supporting modules
 * Based on YOUROBC.md requirements section "Zusatz-Tools" and section 10.
 */

export interface SupportingConfig {
  // Core supporting features
  core: {
    comments: boolean
    documents: boolean
    exchangeRates: boolean
    followupReminders: boolean
    inquirySources: boolean
    wiki: boolean
  }

  // Comments system features
  comments: {
    enabled: boolean
    allowReactions: boolean
    allowThreading: boolean
    allowMentions: boolean
    internalComments: boolean
    customerComments: boolean
  }

  // Documents management features
  documents: {
    enabled: boolean
    allowConfidential: boolean
    allowPublicAccess: boolean
    maxFileSize: number
    allowedFileTypes: string[]
  }

  // Exchange rates features
  exchangeRates: {
    enabled: boolean
    currencies: string[]
    autoUpdate: boolean
    historicalTracking: boolean
    manualEntry: boolean
  }

  // Follow-up reminders features
  followupReminders: {
    enabled: boolean
    emailNotifications: boolean
    inAppNotifications: boolean
    allowRecurring: boolean
    automaticCreation: boolean
    manualCreation: boolean
    slaBasedReminders: boolean
  }

  // Inquiry sources features
  inquirySources: {
    enabled: boolean
    allowCustomTypes: boolean
    predefinedTypes: boolean
    trackingInQuotes: boolean
  }

  // Wiki knowledge base features
  wiki: {
    enabled: boolean
    allowPublicEntries: boolean
    enableSearch: boolean
    enableVersioning: boolean
    categories: boolean
    tags: boolean
    comments: boolean
    recentlyViewed: boolean
    popularArticles: boolean
  }
}

/**
 * Default configuration matching YOUROBC.md requirements
 */
export const DEFAULT_SUPPORTING_CONFIG: SupportingConfig = {
  core: {
    comments: true,
    documents: true,
    exchangeRates: true,
    followupReminders: true,
    inquirySources: true,
    wiki: true,
  },

  comments: {
    enabled: true,
    allowReactions: true,
    allowThreading: true,
    allowMentions: true,
    internalComments: true,
    customerComments: true,
  },

  documents: {
    enabled: true,
    allowConfidential: true,
    allowPublicAccess: true,
    maxFileSize: 10485760, // 10 MB
    allowedFileTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  exchangeRates: {
    enabled: true,
    currencies: ['EUR', 'USD'], // Only EUR/USD as per YOUROBC.md section 1
    autoUpdate: false, // Manual entry only per YOUROBC.md
    historicalTracking: true,
    manualEntry: true,
  },

  followupReminders: {
    enabled: true,
    emailNotifications: true, // Per YOUROBC.md "Email und InAPP"
    inAppNotifications: true,
    allowRecurring: false, // Not in YOUROBC.md requirements
    automaticCreation: true,
    manualCreation: true,
    slaBasedReminders: true,
  },

  inquirySources: {
    enabled: true,
    allowCustomTypes: false, // Use predefined types only per YOUROBC.md section 4
    predefinedTypes: true,
    trackingInQuotes: true,
  },

  wiki: {
    enabled: true,
    allowPublicEntries: false, // Internal only per YOUROBC.md section 10
    enableSearch: true, // "Volltextsuche" per YOUROBC.md section 10
    enableVersioning: true, // "Versionierung" per YOUROBC.md section 10
    categories: true,
    tags: true,
    comments: true,
    recentlyViewed: true,
    popularArticles: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_SUPPORTING_CONFIG: SupportingConfig = {
  core: {
    comments: true,
    documents: true,
    exchangeRates: true,
    followupReminders: true,
    inquirySources: false,
    wiki: false,
  },

  comments: {
    enabled: true,
    allowReactions: false,
    allowThreading: false,
    allowMentions: true,
    internalComments: true,
    customerComments: false,
  },

  documents: {
    enabled: true,
    allowConfidential: false,
    allowPublicAccess: false,
    maxFileSize: 5242880, // 5 MB
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },

  exchangeRates: {
    enabled: true,
    currencies: ['EUR', 'USD'],
    autoUpdate: false,
    historicalTracking: false,
    manualEntry: true,
  },

  followupReminders: {
    enabled: true,
    emailNotifications: false,
    inAppNotifications: true,
    allowRecurring: false,
    automaticCreation: false,
    manualCreation: true,
    slaBasedReminders: false,
  },

  inquirySources: {
    enabled: false,
    allowCustomTypes: false,
    predefinedTypes: false,
    trackingInQuotes: false,
  },

  wiki: {
    enabled: false,
    allowPublicEntries: false,
    enableSearch: false,
    enableVersioning: false,
    categories: false,
    tags: false,
    comments: false,
    recentlyViewed: false,
    popularArticles: false,
  },
}

/**
 * Get the current supporting modules configuration
 */
export function getSupportingConfig(): SupportingConfig {
  const configOverride = process.env.NEXT_PUBLIC_SUPPORTING_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_SUPPORTING_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse SUPPORTING_CONFIG, using defaults')
    }
  }

  return DEFAULT_SUPPORTING_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: SupportingConfig,
  category: keyof SupportingConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: SupportingConfig,
  module: keyof SupportingConfig['core']
): boolean {
  return config.core[module] === true
}

export const SUPPORTING_CONFIG = getSupportingConfig()

// Helper functions to check feature availability (for backward compatibility)
export const isSupportingFeatureEnabled = (feature: keyof SupportingConfig['core']): boolean => {
  return SUPPORTING_CONFIG.core[feature]
}

export const isCommentsEnabled = () => SUPPORTING_CONFIG.comments.enabled
export const isDocumentsEnabled = () => SUPPORTING_CONFIG.documents.enabled
export const isExchangeRatesEnabled = () => SUPPORTING_CONFIG.exchangeRates.enabled
export const isFollowupRemindersEnabled = () => SUPPORTING_CONFIG.followupReminders.enabled
export const isInquirySourcesEnabled = () => SUPPORTING_CONFIG.inquirySources.enabled
export const isWikiEnabled = () => SUPPORTING_CONFIG.wiki.enabled

// Configuration getters
export const getCommentsConfig = () => SUPPORTING_CONFIG.comments
export const getDocumentsConfig = () => SUPPORTING_CONFIG.documents
export const getExchangeRatesConfig = () => SUPPORTING_CONFIG.exchangeRates
export const getFollowupRemindersConfig = () => SUPPORTING_CONFIG.followupReminders
export const getInquirySourcesConfig = () => SUPPORTING_CONFIG.inquirySources
export const getWikiConfig = () => SUPPORTING_CONFIG.wiki

// Constants based on configuration
export const AVAILABLE_CURRENCIES = SUPPORTING_CONFIG.exchangeRates.currencies

/**
 * Check if any supporting module is enabled
 */
export const hasAnySupportingModuleEnabled = (): boolean => {
  return (
    SUPPORTING_CONFIG.comments.enabled ||
    SUPPORTING_CONFIG.documents.enabled ||
    SUPPORTING_CONFIG.exchangeRates.enabled ||
    SUPPORTING_CONFIG.followupReminders.enabled ||
    SUPPORTING_CONFIG.inquirySources.enabled ||
    SUPPORTING_CONFIG.wiki.enabled
  )
}

/**
 * Get list of enabled modules
 */
export const getEnabledModules = (): string[] => {
  const modules: string[] = []

  if (SUPPORTING_CONFIG.comments.enabled) modules.push('yourobcComments')
  if (SUPPORTING_CONFIG.documents.enabled) modules.push('yourobcDocuments')
  if (SUPPORTING_CONFIG.exchangeRates.enabled) modules.push('yourobcExchangeRates')
  if (SUPPORTING_CONFIG.followupReminders.enabled) modules.push('yourobcFollowupReminders')
  if (SUPPORTING_CONFIG.inquirySources.enabled) modules.push('yourobcInquirySources')
  if (SUPPORTING_CONFIG.wiki.enabled) modules.push('yourobcWikiEntries')

  return modules
}

/**
 * YOUROBC.md Requirements Mapping:
 *
 * Comments (Zusatz-Tools - Kommentarfunktion):
 * - Multi-entity support (Angebote, Aufträge, Kunden, etc.)
 * - Internal vs customer-facing comments
 * - @Mention notifications
 * - Timestamp & user tracking
 *
 * Exchange Rates (Section 1, 5):
 * - EUR/USD only
 * - Manual entry (not API-driven initially)
 * - Historical tracking
 * - Used in quotes and invoices
 *
 * Follow-up Reminders (Zusatz-Tools - Follow-Up Reminder):
 * - Email & in-app notifications
 * - Manual and automatic creation
 * - Linked to entities (quotes, shipments, customers)
 * - SLA-based reminders
 *
 * Inquiry Sources (Section 4):
 * - Track where customers come from
 * - Predefined types (Website, Referral, Partner, Advertising, Direct)
 * - Used in quote creation
 *
 * Wiki (Section 10):
 * - SOPs, Airline rules, Partner info
 * - Full-text search
 * - Categories and tags
 * - Version control
 * - Comments on articles
 * - Recently viewed & popular articles
 */
