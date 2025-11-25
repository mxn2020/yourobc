// convex/schema/system/types.ts
// Type exports for system schema module
//
// NOTE: Most types are now defined in their respective module's types.ts file.
// This file re-exports them for convenience and backward compatibility.

import type { Doc, Id } from '@/generated/dataModel';

// ============================================================================
// Re-export Module Types
// ============================================================================

// App Settings
export type {
  AppSetting,
  AppSettingId,
  AppSettingSchema,
  AppSettingValue,
  AppSettingMetadata,
  AppSettingValueType,
  AppSettingVisibility,
  AppSettingCategory,
} from './app/app_settings/types';

// App Theme Settings
export type {
  AppThemeSetting,
  AppThemeSettingId,
  AppThemeSettingSchema,
  AppThemeSettingValue,
  AppThemeSettingMetadata,
} from './app/app_theme_settings/types';

// App Configs
export type {
  AppConfig,
  AppConfigId,
  AppConfigSchema,
  AppConfigValueType,
  AppConfigScope,
  AppConfigOverrideSource,
  AppConfigValue,
  AppConfigValidationRules,
  AppConfigChangeHistoryEntry,
  AppConfigMetadata,
} from './app/app_configs/types';

// Dashboards
export type {
  Dashboard,
  DashboardId,
  DashboardSchema,
  DashboardLayout,
  WidgetType,
  ChartType,
  AggregationType,
  FormatType,
  DashboardFilterCondition,
  DashboardFilterGroup,
  DashboardWidgetPosition,
  DashboardWidgetConfig,
  DashboardWidget,
} from './dashboards/types';

// Email
export type {
  EmailConfig,
  EmailConfigId,
  EmailConfigSchema,
  EmailTemplate,
  EmailTemplateId,
  EmailTemplateSchema,
  EmailLog,
  EmailLogId,
  EmailLogSchema,
  EmailProvider,
  EmailTestStatus,
  EmailStatus,
  EmailDeliveryStatus,
  EmailVariableType,
  EmailContentPreview,
  EmailTemplateVariable,
  EmailProviderConfig,
  EmailTemplateSettings,
  EmailConfigSettings,
  EmailConfigMetadata,
  EmailTemplateMetadata,
  EmailLogMetadata,
} from './email/types';

// ============================================================================
// Core Module Types (Analytics, Audit Logs, Notifications, etc.)
// ============================================================================

// Analytics
export type {
  AnalyticsEvent,
  AnalyticsEventId,
  AnalyticsEventSchema,
  AnalyticsMetric,
  AnalyticsMetricId,
  AnalyticsMetricSchema,
  AnalyticsDashboard,
  AnalyticsDashboardId,
  AnalyticsDashboardSchema,
  AnalyticsReport,
  AnalyticsReportId,
  AnalyticsReportSchema,
  AnalyticsProviderSync,
  AnalyticsProviderSyncId,
  AnalyticsProviderSyncSchema,
  AnalyticsEventType,
  DeviceType,
  SyncStatus,
  MetricPeriod,
  DashboardType,
  WidgetType,
  ReportType,
  ReportFrequency,
  ExportFormat,
  AnalyticsProviderType,
  SyncDirection,
  PaymentStatus,
  ErrorSeverity,
  FilterOperator,
  TransformType,
  ChartFormat,
  ColorScheme,
  LastSyncStatus,
  AnalyticsEventProperties,
  AnalyticsFilterGroup,
  AnalyticsDashboardWidget,
  AnalyticsReportQuery,
  AnalyticsReportSchedule,
  AnalyticsReportResult,
  AnalyticsProviderConfig,
  AnalyticsEventMappings,
} from './core/analytics/types';

// Audit Logs
export type {
  AuditLog,
  AuditLogId,
  AuditLogSchema,
  AuditLogSource,
  AuditLogMetadata,
} from './core/audit_logs/types';

// Notifications
export type {
  Notification,
  NotificationId,
  NotificationSchema,
  NotificationType,
  NotificationEntityType,
  NotificationEntityId,
  NotificationContent,
  NotificationMetadata,
} from './core/notifications/types';

// Permission Requests
export type {
  PermissionRequest,
  PermissionRequestId,
  PermissionRequestSchema,
  PermissionRequestStatus,
  PermissionRequestRequester,
  PermissionRequestRequest,
  PermissionRequestReview,
} from './core/permission_requests/types';

// System Metrics
export type {
  SystemMetric,
  SystemMetricId,
  SystemMetricSchema,
  SystemMetricType,
  SystemMetricUnit,
  SystemMetricMeasurement,
  SystemMetricTimestamps,
} from './core/system_metrics/types';

// ============================================================================
// Supporting Modules (Independent Sibling Modules)
// ============================================================================

// Comments
export type {
  Comment,
  CommentId,
  CommentSchema,
  CommentType,
  CommentMention,
  CommentReaction,
  CommentAttachment,
  CommentEditHistoryEntry,
} from './supporting/comments/types';

// Counters
export type {
  Counter,
  CounterId,
  CounterSchema,
  CounterType,
} from './supporting/counters/types';

// Documents
export type {
  Document,
  DocumentId,
  DocumentSchema,
  DocumentType,
  DocumentStatus,
} from './supporting/documents/types';

// Exchange Rates
export type {
  ExchangeRate,
  ExchangeRateId,
  ExchangeRateSchema,
  Currency,
} from './supporting/exchange_rates/types';

// Followup Reminders
export type {
  FollowupReminder,
  FollowupReminderId,
  FollowupReminderSchema,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  RecurrenceFrequency,
  RecurrencePattern,
} from './supporting/followup_reminders/types';

// Inquiry Sources
export type {
  InquirySource,
  InquirySourceId,
  InquirySourceSchema,
  InquirySourceType,
} from './supporting/inquiry_sources/types';

// Supporting Notifications (different from core notifications)
export type {
  SupportingNotification,
  SupportingNotificationId,
  SupportingNotificationSchema,
  SupportingNotificationType,
  SupportingNotificationPriority,
} from './supporting/notifications/types';

// Wiki Entries
export type {
  WikiEntry,
  WikiEntryId,
  WikiEntrySchema,
  WikiEntryType,
  WikiEntryStatus,
} from './supporting/wikiEntries/types';

// ============================================================================
// User Modules
// ============================================================================

// User Profiles
export type {
  UserProfile,
  UserProfileId,
  UserProfileSchema,
  UserProfileRole,
  UserProfileStats,
  UserProfileExtendedMetadata,
} from './user/user_profiles/types';

// User Settings
export type {
  UserSettings,
  UserSettingsId,
  UserSettingsSchema,
  UserSettingsTheme,
  UserSettingsLayout,
  UserSettingsDashboardView,
  UserSettingsLayoutPreferences,
  UserSettingsNotificationPreferences,
  UserSettingsDashboardPreferences,
} from './user/user_settings/types';

// User Model Preferences
export type {
  UserModelPreference,
  UserModelPreferenceId,
  UserModelPreferenceSchema,
  PreferredView,
  SortDirection,
  SortPreference,
  TestingDefaults,
} from './user/user_model_preferences/types';

// ============================================================================
// Legacy/Commented Out Types
// ============================================================================

// System Types (commented out - not active)
export type AuditLog = Doc<'auditLogs'>;
export type AuditLogId = Id<'auditLogs'>;
export type Notification = Doc<'notifications'>;
export type NotificationId = Id<'notifications'>;
export type SystemMetric = Doc<'systemMetrics'>;
export type SystemMetricId = Id<'systemMetrics'>;

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
// export type AnalyticsEventSchema = Infer<typeof validators.analyticsEvent>;
// export type AnalyticsMetricSchema = Infer<typeof validators.analyticsMetric>;
// export type AnalyticsDashboardSchema = Infer<typeof validators.analyticsDashboard>;
// export type AnalyticsReportSchema = Infer<typeof validators.analyticsReport>;
// export type AnalyticsProviderSyncSchema = Infer<typeof validators.analyticsProviderSync>;

