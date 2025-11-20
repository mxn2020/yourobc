// src/features/yourobc/accounting/config/accounting.config.ts
/**
 * Accounting Module Configuration
 * This configuration file allows enabling/disabling features of the accounting module
 */

export interface AccountingConfig {
  // Core accounting features
  core: {
    incomingInvoices: boolean
    outgoingInvoices: boolean
    statements: boolean
    dashboard: boolean
  }

  // Incoming invoices features
  incomingInvoices: {
    enabled: boolean
    tracking: boolean
    approval: boolean
    expectedInvoices: boolean
    attachments: boolean
  }

  // Outgoing invoices features
  outgoingInvoices: {
    enabled: boolean
    autoNumbering: boolean
    currencyConversion: boolean
    autoGeneration: boolean // Auto-create after POD
    templates: boolean
    bulkOperations: boolean
  }

  // Statement features
  statements: {
    enabled: boolean
    exportPdf: boolean
    exportExcel: boolean
    emailStatements: boolean
    agingReport: boolean
    customReports: boolean
  }

  // Accounting dashboard features
  dashboard: {
    enabled: boolean
    receivables: boolean
    payables: boolean
    cashFlow: boolean
    dunning: boolean
    analytics: boolean
  }

  // Dunning/collections features
  dunning: {
    enabled: boolean
    autoReminders: boolean
    manualReminders: boolean
    levels: number
    suspendAfterLevel: number
    escalationWorkflow: boolean
  }

  // Advanced features
  advanced: {
    multiCurrency: boolean
    approvalWorkflow: boolean
    auditLog: boolean
    advancedReporting: boolean
    budgetTracking: boolean
  }

  // Integration features
  integrations: {
    datev: boolean
    lexoffice: boolean
    customAccounting: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_ACCOUNTING_CONFIG: AccountingConfig = {
  core: {
    incomingInvoices: true,
    outgoingInvoices: true,
    statements: true,
    dashboard: true,
  },

  incomingInvoices: {
    enabled: true,
    tracking: true,
    approval: true,
    expectedInvoices: true,
    attachments: true,
  },

  outgoingInvoices: {
    enabled: true,
    autoNumbering: true,
    currencyConversion: true,
    autoGeneration: true,
    templates: true,
    bulkOperations: false,
  },

  statements: {
    enabled: true,
    exportPdf: true,
    exportExcel: true,
    emailStatements: true,
    agingReport: true,
    customReports: false,
  },

  dashboard: {
    enabled: true,
    receivables: true,
    payables: true,
    cashFlow: true,
    dunning: true,
    analytics: false,
  },

  dunning: {
    enabled: true,
    autoReminders: false, // Manual only by default
    manualReminders: true,
    levels: 3,
    suspendAfterLevel: 3,
    escalationWorkflow: true,
  },

  advanced: {
    multiCurrency: true,
    approvalWorkflow: true,
    auditLog: true,
    advancedReporting: false,
    budgetTracking: false,
  },

  integrations: {
    datev: false,
    lexoffice: false,
    customAccounting: false,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_ACCOUNTING_CONFIG: AccountingConfig = {
  core: {
    incomingInvoices: true,
    outgoingInvoices: true,
    statements: true,
    dashboard: true,
  },

  incomingInvoices: {
    enabled: true,
    tracking: true,
    approval: false,
    expectedInvoices: false,
    attachments: false,
  },

  outgoingInvoices: {
    enabled: true,
    autoNumbering: true,
    currencyConversion: false,
    autoGeneration: false,
    templates: false,
    bulkOperations: false,
  },

  statements: {
    enabled: true,
    exportPdf: true,
    exportExcel: false,
    emailStatements: false,
    agingReport: false,
    customReports: false,
  },

  dashboard: {
    enabled: true,
    receivables: true,
    payables: true,
    cashFlow: false,
    dunning: false,
    analytics: false,
  },

  dunning: {
    enabled: false,
    autoReminders: false,
    manualReminders: false,
    levels: 0,
    suspendAfterLevel: 0,
    escalationWorkflow: false,
  },

  advanced: {
    multiCurrency: false,
    approvalWorkflow: false,
    auditLog: false,
    advancedReporting: false,
    budgetTracking: false,
  },

  integrations: {
    datev: false,
    lexoffice: false,
    customAccounting: false,
  },
}

/**
 * Get the current accounting module configuration
 */
export function getAccountingConfig(): AccountingConfig {
  const configOverride = process.env.NEXT_PUBLIC_ACCOUNTING_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_ACCOUNTING_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse ACCOUNTING_CONFIG, using defaults')
    }
  }

  return DEFAULT_ACCOUNTING_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: AccountingConfig,
  category: keyof AccountingConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: AccountingConfig,
  module: keyof AccountingConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Convenience function to check features using dot notation
 * @param path - Feature path in dot notation (e.g., 'dashboard.enabled', 'incomingInvoices.tracking')
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * checkFeature('dashboard.enabled') // checks ACCOUNTING_CONFIG.dashboard.enabled
 * checkFeature('incomingInvoices.tracking') // checks ACCOUNTING_CONFIG.incomingInvoices.tracking
 */
export function checkFeature(path: string): boolean {
  const config = getAccountingConfig()
  const parts = path.split('.')

  if (parts.length !== 2) {
    console.warn(`Invalid feature path: ${path}. Expected format: 'category.feature'`)
    return false
  }

  const [category, feature] = parts

  // Validate category exists in config
  if (!(category in config)) {
    console.warn(`Unknown category: ${category}`)
    return false
  }

  return isFeatureEnabled(config, category as keyof AccountingConfig, feature)
}

export const ACCOUNTING_CONFIG = getAccountingConfig()
