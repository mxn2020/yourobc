// src/features/yourobc/customers/config/customers.config.ts
/**
 * Customers Module Configuration
 * This configuration file allows enabling/disabling features of the customers module
 */

export interface CustomersConfig {
  // Core customer features
  core: {
    customerProfiles: boolean
    contacts: boolean
    addresses: boolean
    notes: boolean
  }

  // Customer analytics features
  analytics: {
    enabled: boolean
    revenueTracking: boolean
    profitMargins: boolean
    orderHistory: boolean
    trendAnalysis: boolean
    forecasting: boolean
  }

  // Contact management features
  contacts: {
    enabled: boolean
    multipleContacts: boolean
    contactRoles: boolean
    contactHistory: boolean
    communicationLog: boolean
  }

  // Address management features
  addresses: {
    enabled: boolean
    multipleAddresses: boolean
    addressTypes: boolean // billing, shipping, etc.
    addressValidation: boolean
    internationalAddresses: boolean
  }

  // Dunning/collections features
  dunning: {
    enabled: boolean
    autoReminders: boolean
    suspendCustomers: boolean
    creditLimits: boolean
    paymentTracking: boolean
  }

  // Margin tracking features
  margins: {
    enabled: boolean
    profitCalculation: boolean
    marginTargets: boolean
    marginReporting: boolean
    costTracking: boolean
  }

  // Advanced features
  advanced: {
    customFields: boolean
    tagsLabels: boolean
    customerSegmentation: boolean
    exportData: boolean
    bulkOperations: boolean
    auditLog: boolean
  }

  // UI/Display preferences
  display: {
    compactView: boolean
    advancedSearch: boolean
    quickFilters: boolean
    columnCustomization: boolean
  }

  // Integration features
  integrations: {
    crmSync: boolean
    emailMarketing: boolean
    accountingSync: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_CUSTOMERS_CONFIG: CustomersConfig = {
  core: {
    customerProfiles: true,
    contacts: true,
    addresses: true,
    notes: true,
  },

  analytics: {
    enabled: true,
    revenueTracking: true,
    profitMargins: true,
    orderHistory: true,
    trendAnalysis: false,
    forecasting: false,
  },

  contacts: {
    enabled: true,
    multipleContacts: true,
    contactRoles: true,
    contactHistory: true,
    communicationLog: true,
  },

  addresses: {
    enabled: true,
    multipleAddresses: true,
    addressTypes: true,
    addressValidation: false,
    internationalAddresses: true,
  },

  dunning: {
    enabled: true,
    autoReminders: false,
    suspendCustomers: true,
    creditLimits: true,
    paymentTracking: true,
  },

  margins: {
    enabled: true,
    profitCalculation: true,
    marginTargets: true,
    marginReporting: true,
    costTracking: true,
  },

  advanced: {
    customFields: false,
    tagsLabels: true,
    customerSegmentation: true,
    exportData: true,
    bulkOperations: false,
    auditLog: true,
  },

  display: {
    compactView: false,
    advancedSearch: true,
    quickFilters: true,
    columnCustomization: false,
  },

  integrations: {
    crmSync: false,
    emailMarketing: false,
    accountingSync: false,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_CUSTOMERS_CONFIG: CustomersConfig = {
  core: {
    customerProfiles: true,
    contacts: true,
    addresses: true,
    notes: true,
  },

  analytics: {
    enabled: false,
    revenueTracking: false,
    profitMargins: false,
    orderHistory: false,
    trendAnalysis: false,
    forecasting: false,
  },

  contacts: {
    enabled: true,
    multipleContacts: false,
    contactRoles: false,
    contactHistory: false,
    communicationLog: false,
  },

  addresses: {
    enabled: true,
    multipleAddresses: false,
    addressTypes: false,
    addressValidation: false,
    internationalAddresses: false,
  },

  dunning: {
    enabled: false,
    autoReminders: false,
    suspendCustomers: false,
    creditLimits: false,
    paymentTracking: false,
  },

  margins: {
    enabled: false,
    profitCalculation: false,
    marginTargets: false,
    marginReporting: false,
    costTracking: false,
  },

  advanced: {
    customFields: false,
    tagsLabels: false,
    customerSegmentation: false,
    exportData: false,
    bulkOperations: false,
    auditLog: false,
  },

  display: {
    compactView: false,
    advancedSearch: false,
    quickFilters: false,
    columnCustomization: false,
  },

  integrations: {
    crmSync: false,
    emailMarketing: false,
    accountingSync: false,
  },
}

/**
 * Get the current customers module configuration
 */
export function getCustomersConfig(): CustomersConfig {
  const configOverride = process.env.NEXT_PUBLIC_CUSTOMERS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_CUSTOMERS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse CUSTOMERS_CONFIG, using defaults')
    }
  }

  return DEFAULT_CUSTOMERS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: CustomersConfig,
  category: keyof CustomersConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: CustomersConfig,
  module: keyof CustomersConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if analytics is available
 */
export function hasAnalytics(config: CustomersConfig): boolean {
  return config.analytics.enabled === true
}

/**
 * Check if margin tracking is available
 */
export function hasMarginTracking(config: CustomersConfig): boolean {
  return config.margins.enabled === true
}

export const CUSTOMERS_CONFIG = getCustomersConfig()
