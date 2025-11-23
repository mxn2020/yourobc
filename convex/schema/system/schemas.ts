// convex/schema/system/schemas.ts

// Core system table imports
import { systemUserProfilesUserProfilesSchemas } from './user_profiles/user_profiles/schemas'
import { systemAuditLogsSchemas } from './audit_logs/audit_logs/schemas'
import { systemNotificationsNotificationsSchemas } from './notifications/notifications/schemas'
import { systemAppSettingsAppSettingsSchemas } from './app_settings/app_settings/schemas'
import { systemSystemMetricsSystemMetricsSchemas } from './system_metrics/system_metrics/schemas'
import { systemAppThemeSettingsAppThemeSettingsSchemas } from './app_theme_settings/app_theme_settings/schemas'
import { systemAppConfigsAppConfigsSchemas } from './app_configs/app_configs/schemas'
import { systemPermissionRequestsPermissionRequestsSchemas } from './permission_requests/permission_requests/schemas'
import { systemUserSettingsUserSettingsSchemas } from './user_settings/user_settings/schemas'
import { systemUserModelPreferencesSchemas } from './user_settings/user_model_preferences/schemas'
import { systemDashboardsSchemas } from './dashboards/schemas'
import { systemAnalyticsSchemas } from './analytics/schemas'
import { systemEmailSchemas } from './email/schemas'
import { systemSupportingSchemas } from './supporting/schemas'

export const systemSchemas = {
  // User & Profile
  ...systemUserProfilesUserProfilesSchemas,
  ...systemUserSettingsUserSettingsSchemas,
  ...systemUserModelPreferencesSchemas,
  
  // System
  ...systemAuditLogsSchemas,
  ...systemNotificationsNotificationsSchemas,
  ...systemAppSettingsAppSettingsSchemas,
  ...systemSystemMetricsSystemMetricsSchemas,
  ...systemAppThemeSettingsAppThemeSettingsSchemas,
  ...systemAppConfigsAppConfigsSchemas,
  ...systemPermissionRequestsPermissionRequestsSchemas,

  // Supporting
  ...systemSupportingSchemas,
  
  // Dashboards
  ...systemDashboardsSchemas,

  // Analytics
  ...systemAnalyticsSchemas,

  // Email
  ...systemEmailSchemas,

}
