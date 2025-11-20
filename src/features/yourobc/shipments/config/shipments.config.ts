// src/features/yourobc/shipments/config/shipments.config.ts
/**
 * Shipments Module Configuration
 * This configuration file allows enabling/disabling features of the shipments module
 */

export interface ShipmentsConfig {
  // Core shipment features
  core: {
    shipmentTracking: boolean
    statusManagement: boolean
    documentManagement: boolean
    sla: boolean
  }

  // SLA (Service Level Agreement) features
  sla: {
    enabled: boolean
    automaticCalculation: boolean
    customSlaRules: boolean
    slaNotifications: boolean
    overdueTracking: boolean
    performanceReporting: boolean
  }

  // Tracking features
  tracking: {
    enabled: boolean
    statusUpdates: boolean
    locationTracking: boolean
    estimatedDelivery: boolean
    customerNotifications: boolean
    trackingHistory: boolean
  }

  // Document management features
  documents: {
    enabled: boolean
    podUpload: boolean // Proof of Delivery
    customsDocuments: boolean
    commercialInvoice: boolean
    packingList: boolean
    hawbMawb: boolean // House/Master Air Waybill
    bulkDocumentUpload: boolean
  }

  // Customs handling features
  customs: {
    enabled: boolean
    customsClearance: boolean
    dutyCalculation: boolean
    customsDocuments: boolean
    brokerIntegration: boolean
  }

  // Cost tracking features
  costs: {
    enabled: boolean
    excessBaggage: boolean
    customsDuties: boolean
    additionalCharges: boolean
    costApprovalWorkflow: boolean
  }

  // Reference data features
  references: {
    customerReference: boolean
    internalReference: boolean
    externalReference: boolean
    multipleReferences: boolean
  }

  // Advanced features
  advanced: {
    bulkOperations: boolean
    shipmentTemplates: boolean
    routeOptimization: boolean
    carrierIntegration: boolean
    automatedStatusUpdates: boolean
    advancedReporting: boolean
    auditLog: boolean
  }

  // UI/Display preferences
  display: {
    compactView: boolean
    columnCustomization: boolean
    advancedFilters: boolean
    quickActions: boolean
    mapView: boolean
  }

  // Notification features
  notifications: {
    statusChangeAlerts: boolean
    slaWarnings: boolean
    documentUploadReminders: boolean
    deliveryNotifications: boolean
  }
}

/**
 * Default configuration with all features enabled
 */
export const DEFAULT_SHIPMENTS_CONFIG: ShipmentsConfig = {
  core: {
    shipmentTracking: true,
    statusManagement: true,
    documentManagement: true,
    sla: true,
  },

  sla: {
    enabled: true,
    automaticCalculation: true,
    customSlaRules: false,
    slaNotifications: true,
    overdueTracking: true,
    performanceReporting: false,
  },

  tracking: {
    enabled: true,
    statusUpdates: true,
    locationTracking: true,
    estimatedDelivery: true,
    customerNotifications: true,
    trackingHistory: true,
  },

  documents: {
    enabled: true,
    podUpload: true,
    customsDocuments: true,
    commercialInvoice: true,
    packingList: true,
    hawbMawb: true,
    bulkDocumentUpload: false,
  },

  customs: {
    enabled: true,
    customsClearance: true,
    dutyCalculation: true,
    customsDocuments: true,
    brokerIntegration: false,
  },

  costs: {
    enabled: true,
    excessBaggage: true,
    customsDuties: true,
    additionalCharges: true,
    costApprovalWorkflow: true,
  },

  references: {
    customerReference: true,
    internalReference: true,
    externalReference: true,
    multipleReferences: false,
  },

  advanced: {
    bulkOperations: false,
    shipmentTemplates: false,
    routeOptimization: false,
    carrierIntegration: false,
    automatedStatusUpdates: true,
    advancedReporting: false,
    auditLog: true,
  },

  display: {
    compactView: false,
    columnCustomization: false,
    advancedFilters: true,
    quickActions: true,
    mapView: false,
  },

  notifications: {
    statusChangeAlerts: true,
    slaWarnings: true,
    documentUploadReminders: true,
    deliveryNotifications: true,
  },
}

/**
 * Minimal configuration - only core requirements
 */
export const MINIMAL_SHIPMENTS_CONFIG: ShipmentsConfig = {
  core: {
    shipmentTracking: true,
    statusManagement: true,
    documentManagement: true,
    sla: true,
  },

  sla: {
    enabled: true,
    automaticCalculation: true,
    customSlaRules: false,
    slaNotifications: true,
    overdueTracking: false,
    performanceReporting: false,
  },

  tracking: {
    enabled: true,
    statusUpdates: true,
    locationTracking: false,
    estimatedDelivery: false,
    customerNotifications: false,
    trackingHistory: false,
  },

  documents: {
    enabled: true,
    podUpload: true,
    customsDocuments: false,
    commercialInvoice: false,
    packingList: false,
    hawbMawb: false,
    bulkDocumentUpload: false,
  },

  customs: {
    enabled: false,
    customsClearance: false,
    dutyCalculation: false,
    customsDocuments: false,
    brokerIntegration: false,
  },

  costs: {
    enabled: false,
    excessBaggage: false,
    customsDuties: false,
    additionalCharges: false,
    costApprovalWorkflow: false,
  },

  references: {
    customerReference: true,
    internalReference: false,
    externalReference: false,
    multipleReferences: false,
  },

  advanced: {
    bulkOperations: false,
    shipmentTemplates: false,
    routeOptimization: false,
    carrierIntegration: false,
    automatedStatusUpdates: false,
    advancedReporting: false,
    auditLog: false,
  },

  display: {
    compactView: true,
    columnCustomization: false,
    advancedFilters: false,
    quickActions: false,
    mapView: false,
  },

  notifications: {
    statusChangeAlerts: true,
    slaWarnings: true,
    documentUploadReminders: false,
    deliveryNotifications: false,
  },
}

/**
 * Get the current shipments module configuration
 */
export function getShipmentsConfig(): ShipmentsConfig {
  const configOverride = process.env.NEXT_PUBLIC_SHIPMENTS_CONFIG

  if (configOverride) {
    try {
      const parsed = JSON.parse(configOverride)
      return { ...DEFAULT_SHIPMENTS_CONFIG, ...parsed }
    } catch (error) {
      console.warn('Failed to parse SHIPMENTS_CONFIG, using defaults')
    }
  }

  return DEFAULT_SHIPMENTS_CONFIG
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(
  config: ShipmentsConfig,
  category: keyof ShipmentsConfig,
  feature: string
): boolean {
  const categoryConfig = config[category] as any
  return categoryConfig?.enabled !== false && categoryConfig?.[feature] === true
}

/**
 * Check if a core module is enabled
 */
export function isCoreModuleEnabled(
  config: ShipmentsConfig,
  module: keyof ShipmentsConfig['core']
): boolean {
  return config.core[module] === true
}

/**
 * Check if SLA tracking is available
 */
export function hasSlaTracking(config: ShipmentsConfig): boolean {
  return config.sla.enabled === true
}

/**
 * Check if customs handling is available
 */
export function hasCustomsHandling(config: ShipmentsConfig): boolean {
  return config.customs.enabled === true
}

export const SHIPMENTS_CONFIG = getShipmentsConfig()
