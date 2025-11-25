// convex/schema/system/schemas.ts

// Core system table imports
import { systemAppSettingsSchemas } from './app/app_settings/schemas'
import { systemAppThemeSettingsSchemas } from './app/app_theme_settings/schemas'
import { systemAppConfigsSchemas } from './app/app_configs/schemas'

import { systemAnalyticsSchemas } from './core/analytics/schemas'
import { systemAuditLogsSchemas } from './core/audit_logs/schemas'
import { systemNotificationsSchemas } from './core/notifications/schemas'
import { systemMetricsSchemas } from './core/system_metrics/schemas'
import { systemPermissionRequestsSchemas } from './core/permission_requests/schemas'

import { systemUserProfilesSchemas } from './user/user_profiles/schemas'
import { systemUserSettingsSchemas } from './user/user_settings/schemas'
import { systemUserModelPreferencesSchemas } from './user/user_model_preferences/schemas'

import { systemSupportingSchemas } from './supporting/schemas'

import { systemDashboardsSchemas } from './dashboards/schemas'
import { systemEmailSchemas } from './email/schemas'

export const systemSchemas = {
  // User & Profile
  ...systemUserProfilesSchemas,
  ...systemUserSettingsSchemas,
  ...systemUserModelPreferencesSchemas,

  // System
  ...systemAppSettingsSchemas,
  ...systemAppThemeSettingsSchemas,
  ...systemAppConfigsSchemas,
  ...systemPermissionRequestsSchemas,
  ...systemAuditLogsSchemas,
  ...systemNotificationsSchemas,
  ...systemMetricsSchemas,

  // Supporting
  ...systemSupportingSchemas,

  // Dashboards
  ...systemDashboardsSchemas,

  // Analytics
  ...systemAnalyticsSchemas,

  // Email
  ...systemEmailSchemas,

}
