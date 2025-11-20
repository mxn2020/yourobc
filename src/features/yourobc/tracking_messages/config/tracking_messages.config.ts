// src/features/yourobc/tracking_messages/config/tracking_messages.config.ts
/**
 * Tracking Messages Module Configuration
 * This configuration file allows enabling/disabling features of the tracking messages module
 */

export interface TrackingMessagesConfig {
  // Core tracking message features
  core: {
    manualMessages: boolean
    automaticMessages: boolean
    templates: boolean
    statusUpdates: boolean
  }

  // Automatic sending features
  automatic: {
    enabled: boolean
    onStatusChange: boolean
    onDelivery: boolean
    onDelay: boolean
    onException: boolean
    scheduledUpdates: boolean
  }

  // Template features
  templates: {
    enabled: boolean
    defaultTemplates: boolean
    customTemplates: boolean
    multiLanguage: boolean
    variableSubstitution: boolean
    templateLibrary: boolean
  }

  // Status update features
  statusUpdates: {
    enabled: boolean
    pickupConfirmation: boolean
    inTransit: boolean
    outForDelivery: boolean
    delivered: boolean
    exception: boolean
    customStatuses: boolean
  }

  // Communication channels
  channels: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    pushNotification: boolean
    inApp: boolean
  }

  // Customer preferences
  customer: {
    enabled: boolean
    optInOptOut: boolean
    preferenceManagement: boolean
    unsubscribeLink: boolean
    customerPortal: boolean
  }

  // Scheduling features
  scheduling: {
    enabled: boolean
    scheduledSend: boolean
    delayedSend: boolean
    batchSending: boolean
    timezoneAware: boolean
  }

  // Personalization features
  personalization: {
    enabled: boolean
    customerName: boolean
    shipmentDetails: boolean
    estimatedDelivery: boolean
    trackingLink: boolean
    customFields: boolean
  }

  // Tracking features
  tracking: {
    enabled: boolean
    deliveryTracking: boolean
    openTracking: boolean
    clickTracking: boolean
    bounceTracking: boolean
  }

  // Analytics features
  analytics: {
    enabled: boolean
    sendRate: boolean
    openRate: boolean
    clickRate: boolean
    bounceRate: boolean
    customerEngagement: boolean
  }

  // Advanced features
  advanced: {
    abtTesting: boolean
    dynamicContent: boolean
    conditionalSending: boolean
    bulkMessaging: boolean
    messageHistory: boolean
    auditLog: boolean
  }

  // Display preferences
  display: {
    compactView: boolean
    messagePreview: boolean
    statusBadges: boolean
    quickFilters: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_TRACKING_MESSAGES_CONFIG: TrackingMessagesConfig = {
  core: {
    manualMessages: true,
    automaticMessages: true,
    templates: true,
    statusUpdates: true,
  },

  automatic: {
    enabled: true,
    onStatusChange: true,
    onDelivery: true,
    onDelay: true,
    onException: true,
    scheduledUpdates: false,
  },

  templates: {
    enabled: true,
    defaultTemplates: true,
    customTemplates: false,
    multiLanguage: false,
    variableSubstitution: true,
    templateLibrary: true,
  },

  statusUpdates: {
    enabled: true,
    pickupConfirmation: true,
    inTransit: true,
    outForDelivery: true,
    delivered: true,
    exception: true,
    customStatuses: false,
  },

  channels: {
    email: true,
    sms: false,
    whatsapp: false,
    pushNotification: false,
    inApp: true,
  },

  customer: {
    enabled: true,
    optInOptOut: true,
    preferenceManagement: false,
    unsubscribeLink: true,
    customerPortal: false,
  },

  scheduling: {
    enabled: false,
    scheduledSend: false,
    delayedSend: false,
    batchSending: false,
    timezoneAware: false,
  },

  personalization: {
    enabled: true,
    customerName: true,
    shipmentDetails: true,
    estimatedDelivery: true,
    trackingLink: true,
    customFields: false,
  },

  tracking: {
    enabled: false,
    deliveryTracking: false,
    openTracking: false,
    clickTracking: false,
    bounceTracking: false,
  },

  analytics: {
    enabled: false,
    sendRate: false,
    openRate: false,
    clickRate: false,
    bounceRate: false,
    customerEngagement: false,
  },

  advanced: {
    abtTesting: false,
    dynamicContent: false,
    conditionalSending: false,
    bulkMessaging: false,
    messageHistory: true,
    auditLog: false,
  },

  display: {
    compactView: false,
    messagePreview: true,
    statusBadges: true,
    quickFilters: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_TRACKING_MESSAGES_CONFIG: TrackingMessagesConfig = {
  core: {
    manualMessages: true,
    automaticMessages: false,
    templates: true,
    statusUpdates: true,
  },

  automatic: {
    enabled: false,
    onStatusChange: false,
    onDelivery: false,
    onDelay: false,
    onException: false,
    scheduledUpdates: false,
  },

  templates: {
    enabled: true,
    defaultTemplates: true,
    customTemplates: false,
    multiLanguage: false,
    variableSubstitution: false,
    templateLibrary: false,
  },

  statusUpdates: {
    enabled: true,
    pickupConfirmation: false,
    inTransit: false,
    outForDelivery: false,
    delivered: true,
    exception: false,
    customStatuses: false,
  },

  channels: {
    email: true,
    sms: false,
    whatsapp: false,
    pushNotification: false,
    inApp: false,
  },

  customer: {
    enabled: false,
    optInOptOut: false,
    preferenceManagement: false,
    unsubscribeLink: false,
    customerPortal: false,
  },

  scheduling: {
    enabled: false,
    scheduledSend: false,
    delayedSend: false,
    batchSending: false,
    timezoneAware: false,
  },

  personalization: {
    enabled: false,
    customerName: false,
    shipmentDetails: false,
    estimatedDelivery: false,
    trackingLink: false,
    customFields: false,
  },

  tracking: {
    enabled: false,
    deliveryTracking: false,
    openTracking: false,
    clickTracking: false,
    bounceTracking: false,
  },

  analytics: {
    enabled: false,
    sendRate: false,
    openRate: false,
    clickRate: false,
    bounceRate: false,
    customerEngagement: false,
  },

  advanced: {
    abtTesting: false,
    dynamicContent: false,
    conditionalSending: false,
    bulkMessaging: false,
    messageHistory: false,
    auditLog: false,
  },

  display: {
    compactView: true,
    messagePreview: false,
    statusBadges: false,
    quickFilters: false,
  },
}

/**
 * Get the current tracking messages module configuration
 */
export function getTrackingMessagesConfig(): TrackingMessagesConfig {
  const configOverride = process.env.NEXT_PUBLIC_TRACKING_MESSAGES_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_TRACKING_MESSAGES_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse TRACKING_MESSAGES_CONFIG, using defaults')
    }
  }

  return DEFAULT_TRACKING_MESSAGES_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: TrackingMessagesConfig,
  category: keyof TrackingMessagesConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: TrackingMessagesConfig,
  module: keyof TrackingMessagesConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if automatic messages are enabled
 */
export function hasAutomaticMessages(config: TrackingMessagesConfig): boolean {
  return config.automatic.enabled === true
}

/**
 * Check if a specific channel is enabled
 */
export function isChannelEnabled(
  config: TrackingMessagesConfig,
  channel: keyof TrackingMessagesConfig['channels']
): boolean {
  return config.channels[channel] === true
}

export const TRACKING_MESSAGES_CONFIG = getTrackingMessagesConfig()
