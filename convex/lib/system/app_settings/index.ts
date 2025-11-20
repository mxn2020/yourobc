// convex/lib/boilerplate/app_settings/index.ts
// convex/appSettings/index.ts

// Export constants and types
export { APP_SETTINGS_CONSTANTS, DEFAULT_APP_SETTING_VALUES } from './constants'
export * from './types'

// Export all queries
export {
  // Generic queries
  getAppSettings,
  getAppSetting,
  getPublicSettings,
  getSettingsStats,
  searchSettings,
  getSettingsHistory,
  
  // AI settings
  getAISettings,
  getAISetting,
  
  // General settings
  getGeneralSettings,
  getGeneralSetting,
  
  // Security settings
  getSecuritySettings,
  getSecuritySetting,
  
  // Notification settings
  getNotificationSettings,
  getNotificationSetting,
  
  // Billing settings
  getBillingSettings,
  getBillingSetting,
  
  // Integration settings
  getIntegrationSettings,
  getIntegrationSetting,
} from './queries'

// Export all mutations
export {
  // Generic mutations
  createOrUpdateAppSetting,
  deleteAppSetting,
  batchUpdateSettings,
  resetCategoryToDefaults,
  
  // AI settings
  updateAISettings,
  updateAISetting,
  
  // General settings
  updateGeneralSettings,
  updateGeneralSetting,
  
  // Security settings
  updateSecuritySettings,
  updateSecuritySetting,
  
  // Notification settings
  updateNotificationSettings,
  updateNotificationSetting,
  
  // Billing settings
  updateBillingSettings,
  updateBillingSetting,
  
  // Integration settings
  updateIntegrationSettings,
  updateIntegrationSetting,
  
  // Utility mutations
  testAIConnection,
} from './mutations'

// Export utilities
export {
  validateAppSettingData,
  validateSettingByCategory,
  getSettingDescription,
  getDefaultValue,
  isPublicSetting,
  transformSettingsArrayToObject,
  mergeSettingsWithDefaults,
  canUserAccessSetting,
  sanitizeSettingValue,
} from './utils'