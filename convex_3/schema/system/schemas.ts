// convex/schema/system/schemas.ts

// Core system table imports
import { systemUserProfilesSchemas } from './user/user_profiles/schemas'
import { systemAuditLogsSchemas } from './system/audit_logs/schemas'
import { systemNotificationsSchemas } from './system/notifications/schemas'
import { systemAppSettingsSchemas } from './app/app_settings/schemas'
import { systemMetricsSchemas } from './system/system_metrics/schemas'
import { systemAppThemeSettingsSchemas } from './app/app_theme_settings/schemas'
import { systemAppConfigsSchemas } from './app/app_configs/schemas'
import { systemPermissionRequestsSchemas } from './system/permission_requests/schemas'
import { systemUserSettingsSchemas } from './user/user_settings/schemas'
import { systemUserModelPreferencesSchemas } from './user/user_model_preferences/schemas'
import { systemDashboardsSchemas } from './dashboards/schemas'
import { systemAnalyticsSchemas } from './system/analytics/schemas'
import { systemEmailSchemas } from '../../../convex/schema/system/email/schemas'
import { systemSupportingSchemas } from './supporting/schemas'

export const systemSchemas = {
  // User & Profile
  ...systemUserProfilesSchemas,
  ...systemUserSettingsSchemas,
  ...systemUserModelPreferencesSchemas,

  // System
  ...systemAuditLogsSchemas,
  ...systemNotificationsSchemas,
  ...systemAppSettingsSchemas,
  ...systemMetricsSchemas,
  ...systemAppThemeSettingsSchemas,
  ...systemAppConfigsSchemas,
  ...systemPermissionRequestsSchemas,

  // Supporting
  ...systemSupportingSchemas,

  // Dashboards
  ...systemDashboardsSchemas,

  // Analytics
  ...systemAnalyticsSchemas,

  // Email
  ...systemEmailSchemas,

}
