// convex/schema/boilerplate/schemas.ts

// Core system table imports
import { userProfilesTable } from './user_profiles/user_profiles/user_profiles'
import { boilerplateProjectsProjectsSchemas } from './projects/projects/schemas'
import { boilerplateTasksSchemas } from './tasks/tasks/schemas'
import { projectMilestonesTable } from './tables/tasks'
import { boilerplateSystemAuditLogsSchemas } from './system/auditLogs/schemas'
import { boilerplateSystemNotificationsSchemas } from './system/notifications/schemas'
import { boilerplateSystemAppSettingsSchemas } from './system/appSettings/schemas'
import { boilerplateSystemSystemMetricsSchemas } from './system/systemMetrics/schemas'
import { boilerplateSystemAppThemeSettingsSchemas } from './system/appThemeSettings/schemas'
import { boilerplateSystemAppConfigsSchemas } from './system/appConfigs/schemas'
import { boilerplateSystemPermissionRequestsSchemas } from './system/permissionRequests/schemas'
import { aiLogsTable } from './ai/ai_logs/schemas'
import { aiTestsTable } from './ai/ai_tests/schemas'
import { userSettingsTable } from './user_settings/user_settings/user_settings'
import { userModelPreferencesTable } from './user_settings/user_model_preferences/user_model_preferences'
import { boilerplateDashboardsSchemas } from './dashboards/dashboards/schemas'
import { boilerplateSupportingSupportingSchemas } from './supporting/supporting/schemas'
import { blogSchemas } from './blog/blog/schemas'
import { boilerplateWebsitesWebsitesSchemas } from './websites/websites/schemas'
// TODO: Add imports for other website-related tables (pages, sections, themes, templates, collaborators) when refactored
import { websitePagesTable, websiteSectionsTable, websiteThemesTable, websiteTemplatesTable, websiteCollaboratorsTable } from './tables/websites'
import { boilerplateAnalyticsAnalyticsSchemas } from './analytics/analytics/schemas'
import { boilerplateIntegrationsIntegrationsSchemas } from './integrations/integrations/schemas'
import { boilerplateEmailConfigsSchemas } from './email/configs/schemas'
import { boilerplateEmailLogsSchemas } from './email/logs/schemas'
import { boilerplateEmailTemplatesSchemas } from './email/templates/schemas'
import { boilerplatePaymentsPaymentsSchemas } from './payments/payments/schemas'
import { boilerplateAutumnCustomersSchemas } from './autumn/autumn_customers/schemas'
import { boilerplateAutumnUsageLogsSchemas } from './autumn/autumn_usage_logs/schemas'
import { boilerplateStripeConnectSchemas } from './stripe_connect/stripe_connect/schemas'
import { stripeSchemas } from './stripe/stripe/schemas'
import { boilerplateGameScoresSchemas } from './game_scores/game_scores/schemas'

export const boilerplateSchemas = {
  // User & Profile
  userProfiles: userProfilesTable,
  userSettings: userSettingsTable,
  userModelPreferences: userModelPreferencesTable,
  
  // Projects
  ...boilerplateProjectsProjectsSchemas,
  ...boilerplateTasksSchemas,
  projectMilestones: projectMilestonesTable,
  
  // System
  ...boilerplateSystemAuditLogsSchemas,
  ...boilerplateSystemNotificationsSchemas,
  ...boilerplateSystemAppSettingsSchemas,
  ...boilerplateSystemSystemMetricsSchemas,
  ...boilerplateSystemAppThemeSettingsSchemas,
  ...boilerplateSystemAppConfigsSchemas,
  ...boilerplateSystemPermissionRequestsSchemas,
  
  // AI
  aiLogs: aiLogsTable,
  aiTests: aiTestsTable,

  // Dashboards
  ...boilerplateDashboardsSchemas,

  // Supporting
  ...boilerplateSupportingSupportingSchemas,

  // Blog
  ...blogSchemas,
  
  // Websites
  ...boilerplateWebsitesWebsitesSchemas,
  websitePages: websitePagesTable,
  websiteSections: websiteSectionsTable,
  websiteThemes: websiteThemesTable,
  websiteTemplates: websiteTemplatesTable,
  websiteCollaborators: websiteCollaboratorsTable,
  
  // Analytics
  ...boilerplateAnalyticsAnalyticsSchemas,
  
  // Integrations
  ...boilerplateIntegrationsIntegrationsSchemas,
  
  // Email
  ...boilerplateEmailConfigsSchemas,
  ...boilerplateEmailLogsSchemas,
  ...boilerplateEmailTemplatesSchemas,
  
  // Payments
  ...boilerplatePaymentsPaymentsSchemas,

  // Autumn
  ...boilerplateAutumnCustomersSchemas,
  ...boilerplateAutumnUsageLogsSchemas,

  // Stripe Connect
  ...boilerplateStripeConnectSchemas,

  // Stripe Standard
  ...stripeSchemas,

  // Game Scores
  ...boilerplateGameScoresSchemas,

}

