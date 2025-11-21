// convex/schema/system/schemas.ts

// Core system table imports
import { userProfilesTable } from './user_profiles/user_profiles/user_profiles'
import { systemSystemAuditLogsSchemas } from './system/auditLogs/schemas'
import { systemSystemNotificationsSchemas } from './system/notifications/schemas'
import { systemSystemAppSettingsSchemas } from './system/appSettings/schemas'
import { systemSystemSystemMetricsSchemas } from './system/systemMetrics/schemas'
import { systemSystemAppThemeSettingsSchemas } from './system/appThemeSettings/schemas'
import { systemSystemAppConfigsSchemas } from './system/appConfigs/schemas'
import { systemSystemPermissionRequestsSchemas } from './system/permissionRequests/schemas'
import { userSettingsTable } from './user_settings/user_settings/user_settings'
import { userModelPreferencesTable } from './user_settings/user_model_preferences/user_model_preferences'
import { systemDashboardsSchemas } from './dashboards/dashboards/schemas'
import { systemSupportingWikiSchemas } from './supporting/wiki/schemas'
import { systemSupportingCommentsSchemas } from './supporting/comments/schemas'
import { systemSupportingRemindersSchemas } from './supporting/reminders/schemas'
import { systemSupportingDocumentsSchemas } from './supporting/documents/schemas'
import { systemSupportingSchedulingSchemas } from './supporting/scheduling/schemas'
import { systemSupportingAvailabilitySchemas } from './supporting/availability/schemas'
import { blogSchemas } from './blog/blog/schemas'
import { systemAnalyticsAnalyticsSchemas } from './analytics/analytics/schemas'
import { systemEmailConfigsSchemas } from './email/configs/schemas'
import { systemEmailTemplatesSchemas } from './email/templates/schemas'

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
  
  // Dashboards
  ...systemDashboardsSchemas,

  // Supporting
  ...systemSupportingWikiSchemas,
  ...systemSupportingCommentsSchemas,
  ...systemSupportingRemindersSchemas,
  ...systemSupportingDocumentsSchemas,
  ...systemSupportingSchedulingSchemas,
  ...systemSupportingAvailabilitySchemas,

  // Blog
  ...blogSchemas,
  
  // Analytics
  ...systemAnalyticsAnalyticsSchemas,
  
  // Email
  ...systemEmailConfigsSchemas,
  ...systemEmailTemplatesSchemas,

}

