// convex/schema/system/types.ts
// Type exports for system schema module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import * as validators from './validators';

// ============================================================================
// User & Profile Types
// ============================================================================

// Full document types (includes _id and _creationTime)
export type UserProfile = Doc<'userProfiles'>;
export type UserProfileId = Id<'userProfiles'>;

export type UserSettings = Doc<'userSettings'>;
export type UserSettingsId = Id<'userSettings'>;

export type UserModelPreference = Doc<'userModelPreferences'>;
export type UserModelPreferenceId = Id<'userModelPreferences'>;

// Validator types (field definitions only)
export type UserProfileSchema = Infer<typeof validators.userProfile>;
export type UserSettingsSchema = Infer<typeof validators.userSettings>;
export type UserModelPreferenceSchema = Infer<typeof validators.userModelPreference>;

// ============================================================================
// System Types
// ============================================================================

// Full document types
export type AuditLog = Doc<'auditLogs'>;
export type AuditLogId = Id<'auditLogs'>;

export type Notification = Doc<'notifications'>;
export type NotificationId = Id<'notifications'>;

export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

export type SystemMetric = Doc<'systemMetrics'>;
export type SystemMetricId = Id<'systemMetrics'>;

export type AppThemeSetting = Doc<'appThemeSettings'>;
export type AppThemeSettingId = Id<'appThemeSettings'>;

export type AppConfig = Doc<'appConfigs'>;
export type AppConfigId = Id<'appConfigs'>;

export type Dashboard = Doc<'dashboards'>;
export type DashboardId = Id<'dashboards'>;

// Validator types
export type AuditLogSchema = Infer<typeof validators.auditLog>;
export type NotificationSchema = Infer<typeof validators.notification>;
export type AppSettingSchema = Infer<typeof validators.appSetting>;
export type SystemMetricSchema = Infer<typeof validators.systemMetric>;
export type AppThemeSettingSchema = Infer<typeof validators.appThemeSetting>;
export type AppConfigSchema = Infer<typeof validators.appConfig>;
export type DashboardSchema = Infer<typeof validators.dashboard>;

// ============================================================================
// Analytics Types
// ============================================================================

// Full document types
export type AnalyticsEvent = Doc<'analyticsEvents'>;
export type AnalyticsEventId = Id<'analyticsEvents'>;

export type AnalyticsMetric = Doc<'analyticsMetrics'>;
export type AnalyticsMetricId = Id<'analyticsMetrics'>;

export type AnalyticsDashboard = Doc<'analyticsDashboards'>;
export type AnalyticsDashboardId = Id<'analyticsDashboards'>;

export type AnalyticsReport = Doc<'analyticsReports'>;
export type AnalyticsReportId = Id<'analyticsReports'>;

export type AnalyticsProviderSync = Doc<'analyticsProviderSync'>;
export type AnalyticsProviderSyncId = Id<'analyticsProviderSync'>;

// Validator types
export type AnalyticsEventSchema = Infer<typeof validators.analyticsEvent>;
export type AnalyticsMetricSchema = Infer<typeof validators.analyticsMetric>;
export type AnalyticsDashboardSchema = Infer<typeof validators.analyticsDashboard>;
export type AnalyticsReportSchema = Infer<typeof validators.analyticsReport>;
export type AnalyticsProviderSyncSchema = Infer<typeof validators.analyticsProviderSync>;

// ============================================================================
// Email Types
// ============================================================================

// Full document types
export type EmailConfig = Doc<'emailConfigs'>;
export type EmailConfigId = Id<'emailConfigs'>;

export type EmailTemplate = Doc<'emailTemplates'>;
export type EmailTemplateId = Id<'emailTemplates'>;

// Validator types
export type EmailConfigSchema = Infer<typeof validators.emailConfig>;
export type EmailTemplateSchema = Infer<typeof validators.emailTemplate>;

