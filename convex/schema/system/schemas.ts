// convex/schema/system/schemas.ts

// Core system table imports
import { userProfilesTable } from './user_profiles/user_profiles'
import { systemSystemAuditLogsSchemas } from './auditLogs/schemas'
import { systemSystemNotificationsSchemas } from './notifications/schemas'
import { systemSystemAppSettingsSchemas } from './appSettings/schemas'
import { systemSystemSystemMetricsSchemas } from './systemMetrics/schemas'
import { systemSystemAppThemeSettingsSchemas } from './appThemeSettings/schemas'
import { systemSystemAppConfigsSchemas } from './appConfigs/schemas'
import { systemSystemPermissionRequestsSchemas } from './permissionRequests/schemas'
import { userSettingsTable } from './user_settings/user_settings/user_settings'
import { userModelPreferencesTable } from './user_settings/user_model_preferences/user_model_preferences'
import { systemDashboardsSchemas } from './dashboards/schemas'
import { systemAnalyticsAnalyticsSchemas } from './analytics/schemas'
import { systemEmailSchemas } from './email/schemas'
import { systemSupportingSchemas } from './supporting/schemas'

export const systemSchemas = {
  // User & Profile
  userProfiles: userProfilesTable,
  userSettings: userSettingsTable,
  userModelPreferences: userModelPreferencesTable,
  
  // System
  ...systemSystemAuditLogsSchemas,
  ...systemSystemNotificationsSchemas,
  ...systemSystemAppSettingsSchemas,
  ...systemSystemSystemMetricsSchemas,
  ...systemSystemAppThemeSettingsSchemas,
  ...systemSystemAppConfigsSchemas,
  ...systemSystemPermissionRequestsSchemas,

  // Supporting
  ...systemSupportingSchemas,
  
  // Dashboards
  ...systemDashboardsSchemas,

  // Analytics
  ...systemAnalyticsAnalyticsSchemas,

  // Email
  ...systemEmailSchemas,

}

