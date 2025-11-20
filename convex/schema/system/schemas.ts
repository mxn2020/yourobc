// convex/schema/system/schemas.ts

// Core system table imports
import { userProfilesTable } from './user_profiles/user_profiles/user_profiles'
import { systemProjectsProjectsSchemas } from './projects/projects/schemas'
import { systemTasksSchemas } from './projects/tasks/tasks/schemas'
import { projectMilestonesTable } from './projects/milestones/milestones'
import { systemSystemAuditLogsSchemas } from './system/auditLogs/schemas'
import { systemSystemNotificationsSchemas } from './system/notifications/schemas'
import { systemSystemAppSettingsSchemas } from './system/appSettings/schemas'
import { systemSystemSystemMetricsSchemas } from './system/systemMetrics/schemas'
import { systemSystemAppThemeSettingsSchemas } from './system/appThemeSettings/schemas'
import { systemSystemAppConfigsSchemas } from './system/appConfigs/schemas'
import { systemSystemPermissionRequestsSchemas } from './system/permissionRequests/schemas'
import { aiLogsTable } from './ai/ai_logs/schemas'
import { aiTestsTable } from './ai/ai_tests/schemas'
import { userSettingsTable } from './user_settings/user_settings/user_settings'
import { userModelPreferencesTable } from './user_settings/user_model_preferences/user_model_preferences'
import { systemDashboardsSchemas } from './dashboards/dashboards/schemas'
import { systemSupportingSupportingSchemas } from './supporting/supporting/schemas'
import { blogSchemas } from './blog/blog/schemas'
import { systemWebsitesWebsitesSchemas } from './websites/websites/schemas'
// TODO: Add imports for other website-related tables (pages, sections, themes, templates, collaborators) when refactored
import { websitePagesTable, websiteSectionsTable, websiteThemesTable, websiteTemplatesTable, websiteCollaboratorsTable } from './projects/milestones/websites'
import { systemAnalyticsAnalyticsSchemas } from './analytics/analytics/schemas'
import { systemIntegrationsIntegrationsSchemas } from './integrations/integrations/schemas'
import { systemEmailConfigsSchemas } from './email/configs/schemas'
import { systemEmailLogsSchemas } from './email/logs/schemas'
import { systemEmailTemplatesSchemas } from './email/templates/schemas'
import { systemPaymentsPaymentsSchemas } from './payments/payments/schemas'
import { systemAutumnCustomersSchemas } from './autumn/autumn_customers/schemas'
import { systemAutumnUsageLogsSchemas } from './autumn/autumn_usage_logs/schemas'
import { systemStripeConnectSchemas } from './stripe_connect/stripe_connect/schemas'
import { stripeSchemas } from './stripe/stripe/schemas'
import { systemGameScoresSchemas } from './game_scores/game_scores/schemas'

export const systemSchemas = {
  // User & Profile
  userProfiles: userProfilesTable,
  userSettings: userSettingsTable,
  userModelPreferences: userModelPreferencesTable,
  
  // Projects
  ...systemProjectsProjectsSchemas,
  ...systemTasksSchemas,
  projectMilestones: projectMilestonesTable,
  
  // System
  ...systemSystemAuditLogsSchemas,
  ...systemSystemNotificationsSchemas,
  ...systemSystemAppSettingsSchemas,
  ...systemSystemSystemMetricsSchemas,
  ...systemSystemAppThemeSettingsSchemas,
  ...systemSystemAppConfigsSchemas,
  ...systemSystemPermissionRequestsSchemas,
  
  // AI
  aiLogs: aiLogsTable,
  aiTests: aiTestsTable,

  // Dashboards
  ...systemDashboardsSchemas,

  // Supporting
  ...systemSupportingSupportingSchemas,

  // Blog
  ...blogSchemas,
  
  // Websites
  ...systemWebsitesWebsitesSchemas,
  websitePages: websitePagesTable,
  websiteSections: websiteSectionsTable,
  websiteThemes: websiteThemesTable,
  websiteTemplates: websiteTemplatesTable,
  websiteCollaborators: websiteCollaboratorsTable,
  
  // Analytics
  ...systemAnalyticsAnalyticsSchemas,
  
  // Integrations
  ...systemIntegrationsIntegrationsSchemas,
  
  // Email
  ...systemEmailConfigsSchemas,
  ...systemEmailLogsSchemas,
  ...systemEmailTemplatesSchemas,
  
  // Payments
  ...systemPaymentsPaymentsSchemas,

  // Autumn
  ...systemAutumnCustomersSchemas,
  ...systemAutumnUsageLogsSchemas,

  // Stripe Connect
  ...systemStripeConnectSchemas,

  // Stripe Standard
  ...stripeSchemas,

  // Game Scores
  ...systemGameScoresSchemas,

}

