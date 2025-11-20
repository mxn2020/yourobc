// src/features/yourobc/couriers/config/couriers.config.ts
/**
 * Couriers Module Configuration
 * This configuration file allows enabling/disabling features of the couriers module
 */

export interface CouriersConfig {
  // Core courier features
  core: {
    courierManagement: boolean
    commissionTracking: boolean
    workStatusTracking: boolean
    skillsManagement: boolean
  }

  // Courier management features
  management: {
    enabled: boolean
    courierCreation: boolean
    courierEditing: boolean
    courierDeletion: boolean
    statusToggle: boolean
    profileManagement: boolean
  }

  // Work status tracking features
  workStatus: {
    enabled: boolean
    loginLogoutTracking: boolean
    todayHoursTracking: boolean
    onlineStatus: boolean
    locationTracking: boolean
    timezoneSupport: boolean
  }

  // Skills and capabilities features
  skills: {
    enabled: boolean
    languageTracking: boolean
    maxWeightTracking: boolean
    serviceTypes: boolean // OBC/NFO
    certifications: boolean
    customSkills: boolean
  }

  // Commission features
  commissions: {
    enabled: boolean
    percentageBased: boolean
    fixedAmount: boolean
    automaticCalculation: boolean
    commissionApproval: boolean
    paymentTracking: boolean
    paymentMethods: boolean
    multiCurrency: boolean
  }

  // Performance tracking features
  performance: {
    enabled: boolean
    deliveryMetrics: boolean
    ratingSystem: boolean
    performanceScores: boolean
    highPerformerBadges: boolean
    activityTracking: boolean
  }

  // Search and filtering features
  search: {
    enabled: boolean
    courierSearch: boolean
    advancedFilters: boolean
    locationFilter: boolean
    skillsFilter: boolean
    availabilityFilter: boolean
    statusFilter: boolean
  }

  // Location features
  location: {
    enabled: boolean
    countryTracking: boolean
    cityTracking: boolean
    currentLocation: boolean
    locationHistory: boolean
  }

  // Advanced features
  advanced: {
    bulkOperations: boolean
    courierDashboard: boolean
    performanceReports: boolean
    commissionReports: boolean
    exportData: boolean
    auditLog: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    cardView: boolean
    tableView: boolean
    showRatings: boolean
    showPerformanceIndicators: boolean
    showWorkStatus: boolean
    showLocation: boolean
    columnCustomization: boolean
  }

  // Integration features
  integrations: {
    shipmentIntegration: boolean
    userProfileSync: boolean
    notificationSystem: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_COURIERS_CONFIG: CouriersConfig = {
  core: {
    courierManagement: true,
    commissionTracking: true,
    workStatusTracking: true,
    skillsManagement: true,
  },

  management: {
    enabled: true,
    courierCreation: true,
    courierEditing: true,
    courierDeletion: true,
    statusToggle: true,
    profileManagement: true,
  },

  workStatus: {
    enabled: true,
    loginLogoutTracking: true,
    todayHoursTracking: true,
    onlineStatus: true,
    locationTracking: true,
    timezoneSupport: true,
  },

  skills: {
    enabled: true,
    languageTracking: true,
    maxWeightTracking: true,
    serviceTypes: true,
    certifications: true,
    customSkills: false,
  },

  commissions: {
    enabled: true,
    percentageBased: true,
    fixedAmount: true,
    automaticCalculation: true,
    commissionApproval: true,
    paymentTracking: true,
    paymentMethods: true,
    multiCurrency: true,
  },

  performance: {
    enabled: true,
    deliveryMetrics: true,
    ratingSystem: true,
    performanceScores: true,
    highPerformerBadges: false,
    activityTracking: true,
  },

  search: {
    enabled: true,
    courierSearch: true,
    advancedFilters: true,
    locationFilter: true,
    skillsFilter: true,
    availabilityFilter: true,
    statusFilter: true,
  },

  location: {
    enabled: true,
    countryTracking: true,
    cityTracking: true,
    currentLocation: true,
    locationHistory: false,
  },

  advanced: {
    bulkOperations: false,
    courierDashboard: true,
    performanceReports: false,
    commissionReports: true,
    exportData: true,
    auditLog: true,
  },

  display: {
    compactView: false,
    cardView: true,
    tableView: true,
    showRatings: true,
    showPerformanceIndicators: true,
    showWorkStatus: true,
    showLocation: true,
    columnCustomization: false,
  },

  integrations: {
    shipmentIntegration: true,
    userProfileSync: true,
    notificationSystem: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_COURIERS_CONFIG: CouriersConfig = {
  core: {
    courierManagement: true,
    commissionTracking: true,
    workStatusTracking: false,
    skillsManagement: true,
  },

  management: {
    enabled: true,
    courierCreation: true,
    courierEditing: true,
    courierDeletion: false,
    statusToggle: true,
    profileManagement: true,
  },

  workStatus: {
    enabled: false,
    loginLogoutTracking: false,
    todayHoursTracking: false,
    onlineStatus: false,
    locationTracking: false,
    timezoneSupport: false,
  },

  skills: {
    enabled: true,
    languageTracking: true,
    maxWeightTracking: true,
    serviceTypes: true,
    certifications: false,
    customSkills: false,
  },

  commissions: {
    enabled: true,
    percentageBased: true,
    fixedAmount: true,
    automaticCalculation: true,
    commissionApproval: false,
    paymentTracking: true,
    paymentMethods: false,
    multiCurrency: false,
  },

  performance: {
    enabled: false,
    deliveryMetrics: false,
    ratingSystem: false,
    performanceScores: false,
    highPerformerBadges: false,
    activityTracking: false,
  },

  search: {
    enabled: true,
    courierSearch: true,
    advancedFilters: false,
    locationFilter: false,
    skillsFilter: false,
    availabilityFilter: false,
    statusFilter: true,
  },

  location: {
    enabled: true,
    countryTracking: true,
    cityTracking: false,
    currentLocation: true,
    locationHistory: false,
  },

  advanced: {
    bulkOperations: false,
    courierDashboard: false,
    performanceReports: false,
    commissionReports: false,
    exportData: false,
    auditLog: false,
  },

  display: {
    compactView: true,
    cardView: true,
    tableView: true,
    showRatings: false,
    showPerformanceIndicators: false,
    showWorkStatus: false,
    showLocation: true,
    columnCustomization: false,
  },

  integrations: {
    shipmentIntegration: true,
    userProfileSync: true,
    notificationSystem: false,
  },
}

/**
 * Get the current couriers module configuration
 */
export function getCouriersConfig(): CouriersConfig {
  const configOverride = process.env.NEXT_PUBLIC_COURIERS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_COURIERS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse COURIERS_CONFIG, using defaults')
    }
  }

  return DEFAULT_COURIERS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: CouriersConfig,
  category: keyof CouriersConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: CouriersConfig,
  module: keyof CouriersConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if commission tracking is available
 */
export function hasCommissionTracking(config: CouriersConfig): boolean {
  return config.commissions.enabled === true
}

/**
 * Check if work status tracking is available
 */
export function hasWorkStatusTracking(config: CouriersConfig): boolean {
  return config.workStatus.enabled === true
}

/**
 * Check if performance tracking is available
 */
export function hasPerformanceTracking(config: CouriersConfig): boolean {
  return config.performance.enabled === true
}

export const COURIERS_CONFIG = getCouriersConfig()

// ============================================================================
// COMMON DATA
// ============================================================================

/**
 * Common languages for couriers
 */
export const COMMON_LANGUAGES = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Portuguese',
  'Dutch',
  'Polish',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Turkish',
] as const

/**
 * Service types available
 */
export const SERVICE_TYPES = ['OBC', 'NFO'] as const

/**
 * Courier status options
 */
export const COURIER_STATUSES = ['active', 'inactive', 'suspended'] as const

/**
 * Commission types
 */
export const COMMISSION_TYPES = ['percentage', 'fixed'] as const

/**
 * Commission status options
 */
export const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'rejected'] as const

/**
 * Payment methods
 */
export const PAYMENT_METHODS = ['bank_transfer', 'paypal', 'cash', 'check', 'other'] as const

/**
 * Currencies
 */
export const CURRENCIES = ['EUR', 'USD'] as const
