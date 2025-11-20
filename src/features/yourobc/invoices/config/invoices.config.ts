// src/features/yourobc/invoices/config/invoices.config.ts
/**
 * Invoices Module Configuration
 * This configuration file allows enabling/disabling features of the invoices module
 */

export interface InvoicesConfig {
  // Core invoice features
  core: {
    invoiceGeneration: boolean
    invoiceTracking: boolean
    paymentTracking: boolean
    numbering: boolean
  }

  // Numbering features
  numbering: {
    enabled: boolean
    automaticNumbering: boolean
    customPrefix: boolean
    customFormat: boolean
    sequenceManagement: boolean
    yearlyReset: boolean
  }

  // Generation features
  generation: {
    enabled: boolean
    automaticGeneration: boolean // Auto-create after POD
    manualGeneration: boolean
    bulkGeneration: boolean
    templateSelection: boolean
    customization: boolean
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

  // Payment tracking features
  payment: {
    enabled: boolean
    paymentStatus: boolean
    partialPayments: boolean
    paymentReminders: boolean
    overdueTracking: boolean
    paymentMethods: boolean
  }

  // Reminder features
  reminders: {
    enabled: boolean
    automaticReminders: boolean
    customReminderSchedule: boolean
    escalationLevels: boolean
    emailReminders: boolean
    inAppNotifications: boolean
  }

  // Currency features
  currency: {
    enabled: boolean
    multiCurrency: boolean
    currencyConversion: boolean
    exchangeRateTracking: boolean
  }

  // Tax features
  tax: {
    enabled: boolean
    taxCalculation: boolean
    multiTaxRates: boolean
    taxExemptions: boolean
    reverseTax: boolean
  }

  // Advanced features
  advanced: {
    creditNotes: boolean
    recurringInvoices: boolean
    invoiceRevisions: boolean
    approvalWorkflow: boolean
    exportData: boolean
    bulkOperations: boolean
    auditLog: boolean
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
export const DEFAULT_INVOICES_CONFIG: InvoicesConfig = {
  core: {
    invoiceGeneration: true,
    invoiceTracking: true,
    paymentTracking: true,
    numbering: true,
  },

  numbering: {
    enabled: true,
    automaticNumbering: true,
    customPrefix: true,
    customFormat: false,
    sequenceManagement: true,
    yearlyReset: true,
  },

  generation: {
    enabled: true,
    automaticGeneration: true,
    manualGeneration: true,
    bulkGeneration: false,
    templateSelection: true,
    customization: false,
  },

  templates: {
    enabled: true,
    defaultTemplate: true,
    customTemplates: false,
    multiLanguage: false,
    logoCustomization: true,
    footerCustomization: false,
  },

  payment: {
    enabled: true,
    paymentStatus: true,
    partialPayments: true,
    paymentReminders: true,
    overdueTracking: true,
    paymentMethods: true,
  },

  reminders: {
    enabled: true,
    automaticReminders: false,
    customReminderSchedule: false,
    escalationLevels: false,
    emailReminders: true,
    inAppNotifications: true,
  },

  currency: {
    enabled: true,
    multiCurrency: true,
    currencyConversion: true,
    exchangeRateTracking: false,
  },

  tax: {
    enabled: true,
    taxCalculation: true,
    multiTaxRates: true,
    taxExemptions: false,
    reverseTax: false,
  },

  advanced: {
    creditNotes: true,
    recurringInvoices: false,
    invoiceRevisions: false,
    approvalWorkflow: false,
    exportData: true,
    bulkOperations: false,
    auditLog: true,
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
export const MINIMAL_INVOICES_CONFIG: InvoicesConfig = {
  core: {
    invoiceGeneration: true,
    invoiceTracking: true,
    paymentTracking: true,
    numbering: true,
  },

  numbering: {
    enabled: true,
    automaticNumbering: true,
    customPrefix: false,
    customFormat: false,
    sequenceManagement: true,
    yearlyReset: false,
  },

  generation: {
    enabled: true,
    automaticGeneration: false,
    manualGeneration: true,
    bulkGeneration: false,
    templateSelection: false,
    customization: false,
  },

  templates: {
    enabled: true,
    defaultTemplate: true,
    customTemplates: false,
    multiLanguage: false,
    logoCustomization: false,
    footerCustomization: false,
  },

  payment: {
    enabled: true,
    paymentStatus: true,
    partialPayments: false,
    paymentReminders: false,
    overdueTracking: false,
    paymentMethods: false,
  },

  reminders: {
    enabled: false,
    automaticReminders: false,
    customReminderSchedule: false,
    escalationLevels: false,
    emailReminders: false,
    inAppNotifications: false,
  },

  currency: {
    enabled: false,
    multiCurrency: false,
    currencyConversion: false,
    exchangeRateTracking: false,
  },

  tax: {
    enabled: true,
    taxCalculation: true,
    multiTaxRates: false,
    taxExemptions: false,
    reverseTax: false,
  },

  advanced: {
    creditNotes: false,
    recurringInvoices: false,
    invoiceRevisions: false,
    approvalWorkflow: false,
    exportData: false,
    bulkOperations: false,
    auditLog: false,
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
 * Get the current invoices module configuration
 */
export function getInvoicesConfig(): InvoicesConfig {
  const configOverride = process.env.NEXT_PUBLIC_INVOICES_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_INVOICES_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse INVOICES_CONFIG, using defaults')
    }
  }

  return DEFAULT_INVOICES_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: InvoicesConfig,
  category: keyof InvoicesConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: InvoicesConfig,
  module: keyof InvoicesConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if automatic invoice generation is available
 */
export function hasAutomaticGeneration(config: InvoicesConfig): boolean {
  return config.generation.automaticGeneration === true
}

/**
 * Check if payment reminders are available
 */
export function hasPaymentReminders(config: InvoicesConfig): boolean {
  return config.reminders.enabled === true
}

export const INVOICES_CONFIG = getInvoicesConfig()
