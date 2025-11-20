// src/features/yourobc/quotes/config/quotes.config.ts
/**
 * Quotes Module Configuration
 * This configuration file allows enabling/disabling features of the quotes module
 */

export interface QuotesConfig {
  // Core quote features
  core: {
    quoteGeneration: boolean
    quoteTracking: boolean
    quoteConversion: boolean
    expirationTracking: boolean
  }

  // Template features
  templates: {
    enabled: boolean
    defaultTemplate: boolean
    customTemplates: boolean
    multiLanguage: boolean
    logoCustomization: boolean
    footerCustomization: boolean
  }

  // Generation features
  generation: {
    enabled: boolean
    quickQuote: boolean
    detailedQuote: boolean
    bulkQuoting: boolean
    quoteCustomization: boolean
    priceCalculator: boolean
  }

  // Conversion features
  conversion: {
    enabled: boolean
    autoConvertToOrder: boolean
    manualConversion: boolean
    conversionTracking: boolean
    conversionAnalytics: boolean
  }

  // Expiration features
  expiration: {
    enabled: boolean
    defaultValidityDays: number
    expirationReminders: boolean
    autoExpire: boolean
    renewalOptions: boolean
  }

  // Revision features
  revisions: {
    enabled: boolean
    versionTracking: boolean
    compareVersions: boolean
    revisionHistory: boolean
    restorePreviousVersion: boolean
  }

  // Pricing features
  pricing: {
    enabled: boolean
    dynamicPricing: boolean
    discounts: boolean
    markupCalculation: boolean
    multiCurrency: boolean
    taxCalculation: boolean
    automaticConversion: boolean
  }

  // Approval features
  approval: {
    enabled: boolean
    approvalWorkflow: boolean
    multiLevelApproval: boolean
    approvalNotifications: boolean
  }

  // Customer interaction features
  customer: {
    enabled: boolean
    customerView: boolean
    customerAcceptance: boolean
    customerComments: boolean
    customerNotifications: boolean
  }

  // Advanced features
  advanced: {
    quoteComparison: boolean
    quoteAnalytics: boolean
    exportData: boolean
    bulkOperations: boolean
    quoteTemplateLibrary: boolean
    automatedFollowup: boolean
    auditLog: boolean
    // OBC-specific features
    flightLookup: boolean
    courierSuggestions: boolean
    airlineRules: boolean
    // NFO-specific features
    partnerInquiry: boolean
    partnerQuoteComparison: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    statusBadges: boolean
    quickFilters: boolean
    columnCustomization: boolean
    summaryCards: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_QUOTES_CONFIG: QuotesConfig = {
  core: {
    quoteGeneration: true,
    quoteTracking: true,
    quoteConversion: true,
    expirationTracking: true,
  },

  templates: {
    enabled: true,
    defaultTemplate: true,
    customTemplates: false,
    multiLanguage: false,
    logoCustomization: true,
    footerCustomization: false,
  },

  generation: {
    enabled: true,
    quickQuote: true,
    detailedQuote: true,
    bulkQuoting: false,
    quoteCustomization: true,
    priceCalculator: true,
  },

  conversion: {
    enabled: true,
    autoConvertToOrder: false,
    manualConversion: true,
    conversionTracking: true,
    conversionAnalytics: false,
  },

  expiration: {
    enabled: true,
    defaultValidityDays: 30,
    expirationReminders: true,
    autoExpire: false,
    renewalOptions: true,
  },

  revisions: {
    enabled: true,
    versionTracking: true,
    compareVersions: false,
    revisionHistory: true,
    restorePreviousVersion: false,
  },

  pricing: {
    enabled: true,
    dynamicPricing: false,
    discounts: true,
    markupCalculation: true,
    multiCurrency: true,
    taxCalculation: true,
    automaticConversion: true,
  },

  approval: {
    enabled: false,
    approvalWorkflow: false,
    multiLevelApproval: false,
    approvalNotifications: false,
  },

  customer: {
    enabled: true,
    customerView: true,
    customerAcceptance: false,
    customerComments: false,
    customerNotifications: true,
  },

  advanced: {
    quoteComparison: false,
    quoteAnalytics: false,
    exportData: true,
    bulkOperations: false,
    quoteTemplateLibrary: false,
    automatedFollowup: false,
    auditLog: true,
    // OBC-specific features
    flightLookup: true,
    courierSuggestions: true,
    airlineRules: true,
    // NFO-specific features
    partnerInquiry: true,
    partnerQuoteComparison: true,
  },

  display: {
    compactView: false,
    statusBadges: true,
    quickFilters: true,
    columnCustomization: false,
    summaryCards: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_QUOTES_CONFIG: QuotesConfig = {
  core: {
    quoteGeneration: true,
    quoteTracking: true,
    quoteConversion: true,
    expirationTracking: false,
  },

  templates: {
    enabled: true,
    defaultTemplate: true,
    customTemplates: false,
    multiLanguage: false,
    logoCustomization: false,
    footerCustomization: false,
  },

  generation: {
    enabled: true,
    quickQuote: true,
    detailedQuote: false,
    bulkQuoting: false,
    quoteCustomization: false,
    priceCalculator: false,
  },

  conversion: {
    enabled: true,
    autoConvertToOrder: false,
    manualConversion: true,
    conversionTracking: false,
    conversionAnalytics: false,
  },

  expiration: {
    enabled: false,
    defaultValidityDays: 30,
    expirationReminders: false,
    autoExpire: false,
    renewalOptions: false,
  },

  revisions: {
    enabled: false,
    versionTracking: false,
    compareVersions: false,
    revisionHistory: false,
    restorePreviousVersion: false,
  },

  pricing: {
    enabled: true,
    dynamicPricing: false,
    discounts: false,
    markupCalculation: false,
    multiCurrency: false,
    taxCalculation: true,
    automaticConversion: false,
  },

  approval: {
    enabled: false,
    approvalWorkflow: false,
    multiLevelApproval: false,
    approvalNotifications: false,
  },

  customer: {
    enabled: false,
    customerView: false,
    customerAcceptance: false,
    customerComments: false,
    customerNotifications: false,
  },

  advanced: {
    quoteComparison: false,
    quoteAnalytics: false,
    exportData: false,
    bulkOperations: false,
    quoteTemplateLibrary: false,
    automatedFollowup: false,
    auditLog: false,
    // OBC-specific features
    flightLookup: false,
    courierSuggestions: false,
    airlineRules: false,
    // NFO-specific features
    partnerInquiry: false,
    partnerQuoteComparison: false,
  },

  display: {
    compactView: true,
    statusBadges: true,
    quickFilters: false,
    columnCustomization: false,
    summaryCards: false,
  },
}

/**
 * Get the current quotes module configuration
 */
export function getQuotesConfig(): QuotesConfig {
  const configOverride = process.env.NEXT_PUBLIC_QUOTES_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_QUOTES_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse QUOTES_CONFIG, using defaults')
    }
  }

  return DEFAULT_QUOTES_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: QuotesConfig,
  category: keyof QuotesConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: QuotesConfig,
  module: keyof QuotesConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Get default quote validity in days
 */
export function getDefaultValidityDays(config: QuotesConfig): number {
  return config.expiration.defaultValidityDays
}

/**
 * Check if quote conversion is available
 */
export function hasQuoteConversion(config: QuotesConfig): boolean {
  return config.conversion.enabled === true
}

export const QUOTES_CONFIG = getQuotesConfig()
