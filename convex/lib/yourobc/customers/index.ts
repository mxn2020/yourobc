// convex/lib/yourobc/customers/index.ts
// convex/yourobc/customers/index.ts

/**
 * Customer Module Exports
 *
 * Main entry point for the YourOBC customer management module.
 * Provides comprehensive customer management functionality.
 *
 * @module convex/lib/yourobc/customers
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export {
  CUSTOMER_CONSTANTS,
  CUSTOMER_STATUS_COLORS,
  PAYMENT_METHODS,
  COMMON_CURRENCIES,
  COMMON_PAYMENT_TERMS,
  COMMON_COUNTRIES,
  COMMON_COUNTRY_CODES
} from './constants'

// ============================================================================
// TYPES
// ============================================================================

export * from './types'

// ============================================================================
// VALIDATORS
// ============================================================================

export {
  // Core validators
  customerStatsValidator,
  marginConfigValidator,
  riskLevelValidator,

  // Input validators
  createCustomerDataValidator,
  updateCustomerDataValidator,
  updateCustomerStatsValidator,
  customerFilterValidator,
  customerListOptionsValidator,

  // Validation functions
  validateCustomerData,
  validateEmail,
  validatePhone,
  validateWebsite,
  validateTag,
  sanitizeTag,
  validateMarginConfig,
} from './validators'

// ============================================================================
// QUERIES
// ============================================================================

export {
  getCustomers,
  getCustomer,
  getCustomerStats,
  searchCustomers,
  getCustomerActivity,
  getTopCustomers,
  getCustomerTags,
} from './queries'

// ============================================================================
// MUTATIONS
// ============================================================================

export {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStats,
  addCustomerTag,
  removeCustomerTag,
} from './mutations'

// ============================================================================
// UTILITIES
// ============================================================================

export {
  validateCustomerData as utilValidateCustomerData,
  generateCustomerNumber,
  getCustomerStatusColor,
  formatCustomerDisplayName,
  getCustomerFullAddress,
  sanitizeCustomerForExport,
  calculateCustomerScore,
  getCustomerRiskLevel,
  isCustomerActive,
  getPaymentTermsLabel,
  formatCurrency,
} from './utils'

// ============================================================================
// SUBMODULES
// ============================================================================

/**
 * Customer Margin Management
 * Advanced margin rules (percentage, fixed, hybrid)
 */
export * as margins from './margins'

/**
 * Contact Protocol
 * Contact logging and follow-up management
 */
export * as contacts from './contacts'

/**
 * Customer Analytics
 * Lifetime value, payment behavior, performance metrics
 */
export * as analytics from './analytics'

/**
 * Payment Dunning
 * Payment reminders and service suspension
 */
export * as dunning from './dunning'