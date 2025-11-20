// src/features/yourobc/partners/config/partners.config.ts
/**
 * Partners Module Configuration
 * This configuration file allows enabling/disabling features of the partners module
 */

export interface PartnersConfig {
  // Core partner features
  core: {
    partnerManagement: boolean
    serviceCoverage: boolean
    contactManagement: boolean
    businessTerms: boolean
  }

  // Partner management features
  management: {
    enabled: boolean
    partnerCreation: boolean
    partnerEditing: boolean
    partnerDeletion: boolean
    statusToggle: boolean
  }

  // Search and filtering features
  search: {
    enabled: boolean
    partnerSearch: boolean
    advancedFilters: boolean
    serviceTypeFilter: boolean
    countryFilter: boolean
    cityFilter: boolean
    airportFilter: boolean
  }

  // Service coverage features
  coverage: {
    enabled: boolean
    countryCoverage: boolean
    cityCoverage: boolean
    airportCoverage: boolean
    serviceCapabilities: boolean
  }

  // Contact management features
  contacts: {
    enabled: boolean
    primaryContact: boolean
    quotingEmail: boolean
    multipleContacts: boolean
  }

  // Business terms features
  business: {
    enabled: boolean
    paymentTerms: boolean
    currencySelection: boolean
    partnerCode: boolean
    ranking: boolean
    rankingNotes: boolean
  }

  // NFO process features
  nfo: {
    enabled: boolean
    partnerSuggestions: boolean
    partnerListForNFO: boolean
    emailDisplay: boolean
    quoteRequestTemplate: boolean
  }

  // Performance and analytics features
  analytics: {
    enabled: boolean
    performanceMetrics: boolean
    selectionRate: boolean
    responseTimeTracking: boolean
    quoteAccuracyTracking: boolean
    revenueTracking: boolean
  }

  // Advanced features
  advanced: {
    partnerReviews: boolean
    partnerDocuments: boolean
    partnerCertifications: boolean
    serviceLevelAgreements: boolean
    contractManagement: boolean
  }

  // Communication features
  communication: {
    enabled: boolean
    emailIntegration: boolean
    communicationHistory: boolean
    automatedEmails: boolean
  }

  // Dashboard and reporting features
  reporting: {
    enabled: boolean
    partnerDashboard: boolean
    performanceReports: boolean
    topPartnersWidget: boolean
  }

  // UI/Display features
  display: {
    tableView: boolean
    gridView: boolean
    advancedSorting: boolean
    bulkActions: boolean
    showPerformanceScore: boolean
    showTopPerformerBadge: boolean
    showRecentActivity: boolean
    showQuoteHistory: boolean
    showCoverageStats: boolean
    showPaymentTerms: boolean
    showContactInfo: boolean
    showPartnerCode: boolean
    showRanking: boolean
    showServiceCapabilities: boolean
  }

  // Validation limits
  limits: {
    maxCompanyNameLength: number
    maxShortNameLength: number
    maxPartnerCodeLength: number
    maxContactNameLength: number
    maxPhoneLength: number
    maxEmailLength: number
    maxNotesLength: number
    maxCountries: number
    maxCities: number
    maxAirports: number
    minPaymentTerms: number
    maxPaymentTerms: number
    minRanking: number
    maxRanking: number
  }
}

/**
 * Default configuration matching YOUROBC.md requirements
 */
export const DEFAULT_PARTNERS_CONFIG: PartnersConfig = {
  core: {
    partnerManagement: true,
    serviceCoverage: true,
    contactManagement: true,
    businessTerms: true,
  },

  management: {
    enabled: true,
    partnerCreation: true,
    partnerEditing: true,
    partnerDeletion: true,
    statusToggle: true,
  },

  search: {
    enabled: true,
    partnerSearch: true,
    advancedFilters: true,
    serviceTypeFilter: true,
    countryFilter: true,
    cityFilter: true,
    airportFilter: true,
  },

  coverage: {
    enabled: true,
    countryCoverage: true,
    cityCoverage: true,
    airportCoverage: true,
    serviceCapabilities: true,
  },

  contacts: {
    enabled: true,
    primaryContact: true,
    quotingEmail: true,
    multipleContacts: false,
  },

  business: {
    enabled: true,
    paymentTerms: true,
    currencySelection: true,
    partnerCode: true,
    ranking: true,
    rankingNotes: true,
  },

  nfo: {
    enabled: true,
    partnerSuggestions: true,
    partnerListForNFO: true,
    emailDisplay: true,
    quoteRequestTemplate: true,
  },

  analytics: {
    enabled: false,
    performanceMetrics: false,
    selectionRate: false,
    responseTimeTracking: false,
    quoteAccuracyTracking: false,
    revenueTracking: false,
  },

  advanced: {
    partnerReviews: false,
    partnerDocuments: false,
    partnerCertifications: false,
    serviceLevelAgreements: false,
    contractManagement: false,
  },

  communication: {
    enabled: false,
    emailIntegration: false,
    communicationHistory: false,
    automatedEmails: false,
  },

  reporting: {
    enabled: false,
    partnerDashboard: false,
    performanceReports: false,
    topPartnersWidget: false,
  },

  display: {
    tableView: true,
    gridView: true,
    advancedSorting: false,
    bulkActions: false,
    showPerformanceScore: false,
    showTopPerformerBadge: false,
    showRecentActivity: false,
    showQuoteHistory: false,
    showCoverageStats: true,
    showPaymentTerms: true,
    showContactInfo: true,
    showPartnerCode: true,
    showRanking: true,
    showServiceCapabilities: true,
  },

  limits: {
    maxCompanyNameLength: 100,
    maxShortNameLength: 50,
    maxPartnerCodeLength: 20,
    maxContactNameLength: 100,
    maxPhoneLength: 20,
    maxEmailLength: 100,
    maxNotesLength: 1000,
    maxCountries: 50,
    maxCities: 100,
    maxAirports: 100,
    minPaymentTerms: 0,
    maxPaymentTerms: 365,
    minRanking: 1,
    maxRanking: 5,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_PARTNERS_CONFIG: PartnersConfig = {
  core: {
    partnerManagement: true,
    serviceCoverage: true,
    contactManagement: true,
    businessTerms: true,
  },

  management: {
    enabled: true,
    partnerCreation: true,
    partnerEditing: true,
    partnerDeletion: false,
    statusToggle: true,
  },

  search: {
    enabled: true,
    partnerSearch: true,
    advancedFilters: false,
    serviceTypeFilter: true,
    countryFilter: false,
    cityFilter: false,
    airportFilter: false,
  },

  coverage: {
    enabled: true,
    countryCoverage: true,
    cityCoverage: false,
    airportCoverage: false,
    serviceCapabilities: false,
  },

  contacts: {
    enabled: true,
    primaryContact: true,
    quotingEmail: true,
    multipleContacts: false,
  },

  business: {
    enabled: true,
    paymentTerms: true,
    currencySelection: true,
    partnerCode: false,
    ranking: false,
    rankingNotes: false,
  },

  nfo: {
    enabled: true,
    partnerSuggestions: true,
    partnerListForNFO: true,
    emailDisplay: true,
    quoteRequestTemplate: false,
  },

  analytics: {
    enabled: false,
    performanceMetrics: false,
    selectionRate: false,
    responseTimeTracking: false,
    quoteAccuracyTracking: false,
    revenueTracking: false,
  },

  advanced: {
    partnerReviews: false,
    partnerDocuments: false,
    partnerCertifications: false,
    serviceLevelAgreements: false,
    contractManagement: false,
  },

  communication: {
    enabled: false,
    emailIntegration: false,
    communicationHistory: false,
    automatedEmails: false,
  },

  reporting: {
    enabled: false,
    partnerDashboard: false,
    performanceReports: false,
    topPartnersWidget: false,
  },

  display: {
    tableView: true,
    gridView: false,
    advancedSorting: false,
    bulkActions: false,
    showPerformanceScore: false,
    showTopPerformerBadge: false,
    showRecentActivity: false,
    showQuoteHistory: false,
    showCoverageStats: true,
    showPaymentTerms: true,
    showContactInfo: true,
    showPartnerCode: false,
    showRanking: false,
    showServiceCapabilities: false,
  },

  limits: {
    maxCompanyNameLength: 100,
    maxShortNameLength: 50,
    maxPartnerCodeLength: 20,
    maxContactNameLength: 100,
    maxPhoneLength: 20,
    maxEmailLength: 100,
    maxNotesLength: 1000,
    maxCountries: 50,
    maxCities: 100,
    maxAirports: 100,
    minPaymentTerms: 0,
    maxPaymentTerms: 365,
    minRanking: 1,
    maxRanking: 5,
  },
}

/**
 * Get the current partners module configuration
 */
export function getPartnersConfig(): PartnersConfig {
  const configOverride = process.env.NEXT_PUBLIC_PARTNERS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_PARTNERS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse PARTNERS_CONFIG, using defaults')
    }
  }

  return DEFAULT_PARTNERS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: PartnersConfig,
  category: keyof PartnersConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: PartnersConfig,
  module: keyof PartnersConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Get a limit value
 */
export function getLimit(
  config: PartnersConfig,
  limitName: keyof PartnersConfig['limits']
): number {
  return config.limits[limitName]
}

/**
 * Get a display option
 */
export function getDisplayOption(
  config: PartnersConfig,
  optionName: keyof PartnersConfig['display']
): boolean {
  return config.display[optionName]
}

/**
 * Check if advanced features are enabled
 */
export function hasAdvancedFeatures(config: PartnersConfig): boolean {
  return (
    config.analytics.enabled ||
    config.advanced.partnerReviews ||
    config.communication.enabled ||
    config.reporting.enabled
  )
}

/**
 * Convenience function to check features using dot notation
 * @param path - Feature path in dot notation (e.g., 'nfo.partnerListForNFO', 'display.showContactInfo')
 * @returns boolean indicating if the feature is enabled
 *
 * @example
 * checkFeature('nfo.partnerListForNFO') // checks PARTNERS_CONFIG.nfo.partnerListForNFO
 * checkFeature('display.showContactInfo') // checks PARTNERS_CONFIG.display.showContactInfo
 */
export function checkFeature(path: string): boolean {
  const config = getPartnersConfig()
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

  // Special handling for display options (direct boolean access, no .enabled check)
  if (category === 'display' || category === 'limits') {
    const categoryConfig = config[category] as any
    return categoryConfig?.[feature] === true || typeof categoryConfig?.[feature] === 'number'
  }

  return isFeatureEnabled(config, category as keyof PartnersConfig, feature)
}

/**
 * Create a flat config object for backward compatibility
 * This allows accessing features with the old pattern like PARTNERS_MODULE_CONFIG.enablePartnerListForNFO
 */
export const PARTNERS_MODULE_CONFIG = {
  // NFO features
  get enablePartnerListForNFO() {
    return checkFeature('nfo.partnerListForNFO')
  },
  get enablePartnerQuoteRequestTemplate() {
    return checkFeature('nfo.quoteRequestTemplate')
  },

  // Display options (nested under displayOptions for compatibility)
  displayOptions: {
    get showContactInfo() {
      return checkFeature('display.showContactInfo')
    },
    get showPaymentTerms() {
      return checkFeature('display.showPaymentTerms')
    },
    get showPartnerCode() {
      return checkFeature('display.showPartnerCode')
    },
    get showRanking() {
      return checkFeature('display.showRanking')
    },
    get showServiceCapabilities() {
      return checkFeature('display.showServiceCapabilities')
    },
  },
}

export const PARTNERS_CONFIG = getPartnersConfig()

// ============================================================================
// COMMON DATA
// ============================================================================

/**
 * Common countries list
 */
export const COMMON_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'FI', name: 'Finland' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'RU', name: 'Russia' },
  { code: 'SG', name: 'Singapore' },
] as const

/**
 * Common airport codes
 */
export const COMMON_AIRPORTS = [
  'FRA', 'MUC', 'DUS', 'BER', 'HAM', 'CGN', 'STR', // Germany
  'LHR', 'LGW', 'MAN', 'BHX', 'EDI', // UK
  'CDG', 'ORY', 'LYS', 'NCE', // France
  'AMS', 'RTM', // Netherlands
  'BRU', // Belgium
  'ZRH', 'GVA', // Switzerland
  'VIE', // Austria
  'FCO', 'MXP', // Italy
  'MAD', 'BCN', // Spain
  'CPH', // Denmark
  'ARN', // Sweden
  'OSL', // Norway
  'HEL', // Finland
  'WAW', // Poland
  'PRG', // Czech Republic
  'JFK', 'LAX', 'ORD', 'MIA', 'ATL', 'DFW', // USA
  'PEK', 'PVG', 'CAN', 'HKG', // China
  'NRT', 'HND', // Japan
  'ICN', // South Korea
  'DEL', 'BOM', // India
  'SIN', // Singapore
  'DXB', 'AUH', // UAE
  'JED', 'RUH', // Saudi Arabia
  'IST', // Turkey
  'SYD', 'MEL', // Australia
  'GRU', 'GIG', // Brazil
  'MEX', // Mexico
  'YYZ', 'YVR', // Canada
  'JNB', // South Africa
] as const

/**
 * Service type options for partners
 */
export const SERVICE_TYPES = ['OBC', 'NFO', 'both'] as const

/**
 * Currency options
 */
export const CURRENCIES = ['EUR', 'USD'] as const
