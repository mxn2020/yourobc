// src/features/yourobc/mobile/config/mobile.config.ts
/**
 * Mobile Module Configuration
 * This configuration file allows enabling/disabling features of the mobile module
 */

export interface MobileConfig {
  // Core mobile features
  core: {
    mobileLayout: boolean
    bottomNavigation: boolean
    mobileDashboard: boolean
    mobileQuoteForms: boolean
  }

  // Layout features
  layout: {
    enabled: boolean
    responsiveDesign: boolean
    bottomTabBar: boolean
    hamburgerMenu: boolean
    swipeNavigation: boolean
    pullToRefresh: boolean
  }

  // Dashboard features
  dashboard: {
    enabled: boolean
    shipmentsList: boolean
    quickActions: boolean
    summaryCards: boolean
    recentActivities: boolean
    notifications: boolean
    searchBar: boolean
  }

  // Quote creation features
  quotes: {
    enabled: boolean
    obcQuoteForm: boolean
    nfoQuoteForm: boolean
    quickQuote: boolean
    formValidation: boolean
    autosave: boolean
    offlineMode: boolean
  }

  // Shipment management features
  shipments: {
    enabled: boolean
    shipmentCards: boolean
    statusUpdates: boolean
    shipmentDetails: boolean
    documentUpload: boolean
    tracking: boolean
    filtering: boolean
  }

  // Status update features
  statusUpdate: {
    enabled: boolean
    mobileStatusForm: boolean
    locationCapture: boolean
    photoCapture: boolean
    signatureCapture: boolean
    timestampTracking: boolean
    offlineSync: boolean
  }

  // Filter features
  filters: {
    enabled: boolean
    mobileFilters: boolean
    quickFilters: boolean
    savedFilters: boolean
    advancedFilters: boolean
    dateRangeFilter: boolean
  }

  // Navigation features
  navigation: {
    enabled: boolean
    bottomTabs: boolean
    sideDrawer: boolean
    breadcrumbs: boolean
    backButton: boolean
    deepLinking: boolean
  }

  // Performance features
  performance: {
    enabled: boolean
    lazyLoading: boolean
    imageOptimization: boolean
    caching: boolean
    offlineSupport: boolean
    backgroundSync: boolean
  }

  // UI/UX features
  ux: {
    enabled: boolean
    touchGestures: boolean
    hapticFeedback: boolean
    animations: boolean
    skeletonLoaders: boolean
    errorBoundaries: boolean
    loadingStates: boolean
  }

  // Notifications features
  notifications: {
    enabled: boolean
    pushNotifications: boolean
    inAppNotifications: boolean
    badgeCount: boolean
    notificationCenter: boolean
  }

  // Security features
  security: {
    enabled: boolean
    biometricAuth: boolean
    pinCode: boolean
    sessionTimeout: boolean
    secureStorage: boolean
  }

  // Advanced features
  advanced: {
    offlineMode: boolean
    syncQueue: boolean
    conflictResolution: boolean
    dataCompression: boolean
    analytics: boolean
    crashReporting: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    cardLayout: boolean
    listLayout: boolean
    darkMode: boolean
    fontSize: 'small' | 'medium' | 'large'
    density: 'comfortable' | 'compact'
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_MOBILE_CONFIG: MobileConfig = {
  core: {
    mobileLayout: true,
    bottomNavigation: true,
    mobileDashboard: true,
    mobileQuoteForms: true,
  },

  layout: {
    enabled: true,
    responsiveDesign: true,
    bottomTabBar: true,
    hamburgerMenu: false,
    swipeNavigation: true,
    pullToRefresh: true,
  },

  dashboard: {
    enabled: true,
    shipmentsList: true,
    quickActions: true,
    summaryCards: true,
    recentActivities: true,
    notifications: true,
    searchBar: true,
  },

  quotes: {
    enabled: true,
    obcQuoteForm: true,
    nfoQuoteForm: true,
    quickQuote: true,
    formValidation: true,
    autosave: true,
    offlineMode: false,
  },

  shipments: {
    enabled: true,
    shipmentCards: true,
    statusUpdates: true,
    shipmentDetails: true,
    documentUpload: true,
    tracking: true,
    filtering: true,
  },

  statusUpdate: {
    enabled: true,
    mobileStatusForm: true,
    locationCapture: true,
    photoCapture: true,
    signatureCapture: false,
    timestampTracking: true,
    offlineSync: false,
  },

  filters: {
    enabled: true,
    mobileFilters: true,
    quickFilters: true,
    savedFilters: false,
    advancedFilters: true,
    dateRangeFilter: true,
  },

  navigation: {
    enabled: true,
    bottomTabs: true,
    sideDrawer: false,
    breadcrumbs: false,
    backButton: true,
    deepLinking: true,
  },

  performance: {
    enabled: true,
    lazyLoading: true,
    imageOptimization: true,
    caching: true,
    offlineSupport: false,
    backgroundSync: false,
  },

  ux: {
    enabled: true,
    touchGestures: true,
    hapticFeedback: false,
    animations: true,
    skeletonLoaders: true,
    errorBoundaries: true,
    loadingStates: true,
  },

  notifications: {
    enabled: true,
    pushNotifications: false,
    inAppNotifications: true,
    badgeCount: true,
    notificationCenter: true,
  },

  security: {
    enabled: true,
    biometricAuth: false,
    pinCode: false,
    sessionTimeout: true,
    secureStorage: true,
  },

  advanced: {
    offlineMode: false,
    syncQueue: false,
    conflictResolution: false,
    dataCompression: false,
    analytics: true,
    crashReporting: false,
  },

  display: {
    compactView: false,
    cardLayout: true,
    listLayout: true,
    darkMode: false,
    fontSize: 'medium',
    density: 'comfortable',
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_MOBILE_CONFIG: MobileConfig = {
  core: {
    mobileLayout: true,
    bottomNavigation: true,
    mobileDashboard: true,
    mobileQuoteForms: true,
  },

  layout: {
    enabled: true,
    responsiveDesign: true,
    bottomTabBar: true,
    hamburgerMenu: false,
    swipeNavigation: false,
    pullToRefresh: false,
  },

  dashboard: {
    enabled: true,
    shipmentsList: true,
    quickActions: false,
    summaryCards: true,
    recentActivities: false,
    notifications: false,
    searchBar: true,
  },

  quotes: {
    enabled: true,
    obcQuoteForm: true,
    nfoQuoteForm: true,
    quickQuote: false,
    formValidation: true,
    autosave: false,
    offlineMode: false,
  },

  shipments: {
    enabled: true,
    shipmentCards: true,
    statusUpdates: true,
    shipmentDetails: true,
    documentUpload: false,
    tracking: false,
    filtering: false,
  },

  statusUpdate: {
    enabled: true,
    mobileStatusForm: true,
    locationCapture: false,
    photoCapture: false,
    signatureCapture: false,
    timestampTracking: true,
    offlineSync: false,
  },

  filters: {
    enabled: false,
    mobileFilters: false,
    quickFilters: false,
    savedFilters: false,
    advancedFilters: false,
    dateRangeFilter: false,
  },

  navigation: {
    enabled: true,
    bottomTabs: true,
    sideDrawer: false,
    breadcrumbs: false,
    backButton: true,
    deepLinking: false,
  },

  performance: {
    enabled: true,
    lazyLoading: true,
    imageOptimization: true,
    caching: false,
    offlineSupport: false,
    backgroundSync: false,
  },

  ux: {
    enabled: true,
    touchGestures: true,
    hapticFeedback: false,
    animations: false,
    skeletonLoaders: false,
    errorBoundaries: true,
    loadingStates: true,
  },

  notifications: {
    enabled: false,
    pushNotifications: false,
    inAppNotifications: false,
    badgeCount: false,
    notificationCenter: false,
  },

  security: {
    enabled: true,
    biometricAuth: false,
    pinCode: false,
    sessionTimeout: true,
    secureStorage: false,
  },

  advanced: {
    offlineMode: false,
    syncQueue: false,
    conflictResolution: false,
    dataCompression: false,
    analytics: false,
    crashReporting: false,
  },

  display: {
    compactView: false,
    cardLayout: true,
    listLayout: false,
    darkMode: false,
    fontSize: 'medium',
    density: 'comfortable',
  },
}

/**
 * Get the current mobile module configuration
 */
export function getMobileConfig(): MobileConfig {
  const configOverride = process.env.NEXT_PUBLIC_MOBILE_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_MOBILE_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse MOBILE_CONFIG, using defaults')
    }
  }

  return DEFAULT_MOBILE_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: MobileConfig,
  category: keyof MobileConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: MobileConfig,
  module: keyof MobileConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if offline mode is available
 */
export function hasOfflineMode(config: MobileConfig): boolean {
  return config.advanced.offlineMode === true
}

/**
 * Check if push notifications are enabled
 */
export function hasPushNotifications(config: MobileConfig): boolean {
  return config.notifications.pushNotifications === true
}

/**
 * Get display preference
 */
export function getDisplayPreference<K extends keyof MobileConfig['display']>(
  config: MobileConfig,
  preference: K
): MobileConfig['display'][K] {
  return config.display[preference]
}

export const MOBILE_CONFIG = getMobileConfig()
