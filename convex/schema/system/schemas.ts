// convex/schema/system/schemas.ts

// Core system table imports
import { userProfilesTable } from './userProfiles/user_profiles'
import { systemAuditLogsSchemas } from './auditLogs/schemas'
import { systemNotificationsSchemas } from './notifications/schemas'
import { systemAppSettingsSchemas } from './appSettings/schemas'
import { systemSystemSystemMetricsSchemas } from './systemMetrics/schemas'
import { systemSystemAppThemeSettingsSchemas } from './appThemeSettings/schemas'
import { systemAppConfigsSchemas } from './appConfigs/schemas'
import { systemSystemPermissionRequestsSchemas } from './permissionRequests/schemas'
import { userSettingsTable } from './userSettings/user_settings/user_settings'
import { userModelPreferencesTable } from './userSettings/user_model_preferences/user_model_preferences'
import { systemDashboardsSchemas } from './dashboards/schemas'
import { systemAnalyticsSchemas } from './analytics/schemas'
import { systemEmailSchemas } from './email/schemas'
import { systemSupportingSchemas } from './supporting/schemas'

export const systemSchemas = {
  // User & Profile
  userProfiles: userProfilesTable,
  userSettings: userSettingsTable,
  userModelPreferences: userModelPreferencesTable,
  
  // System
  ...systemAuditLogsSchemas,
  ...systemNotificationsSchemas,
  ...systemAppSettingsSchemas,
  ...systemSystemSystemMetricsSchemas,
  ...systemSystemAppThemeSettingsSchemas,
  ...systemAppConfigsSchemas,
  ...systemSystemPermissionRequestsSchemas,

  // Supporting
  ...systemSupportingSchemas,
  
  // Dashboards
  ...systemDashboardsSchemas,

  // Analytics
  ...systemAnalyticsSchemas,

  // Email
  ...systemEmailSchemas,

}

