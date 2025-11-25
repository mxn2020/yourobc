// convex/schema/system/validators.ts

import { systemSchemas } from './schemas'

// User & Profile validators
// export const userProfile = systemSchemas.userProfiles.validator
// export const userSettings = systemSchemas.userSettings.validator
// export const userModelPreference = systemSchemas.userModelPreferences.validator

// System validators
export const appSetting = systemSchemas.appSettings.validator
export const appThemeSetting = systemSchemas.appThemeSettings.validator
export const appConfig = systemSchemas.appConfigs.validator
// export const auditLog = systemSchemas.auditLogs.validator
// export const notification = systemSchemas.notifications.validator
// export const systemMetric = systemSchemas.systemMetrics.validator

// Dashboard validators
export const dashboard = systemSchemas.dashboards.validator

// Analytics validators
// export const analyticsEvent = systemSchemas.analyticsEvents.validator
// export const analyticsMetric = systemSchemas.analyticsMetrics.validator
// export const analyticsDashboard = systemSchemas.analyticsDashboards.validator
// export const analyticsReport = systemSchemas.analyticsReports.validator
// export const analyticsProviderSync = systemSchemas.analyticsProviderSync.validator

// Email validators
// export const emailConfig = systemSchemas.emailConfigs.validator
// export const emailTemplate = systemSchemas.emailTemplates.validator
// export const emailLog = systemSchemas.emailLogs.validator

