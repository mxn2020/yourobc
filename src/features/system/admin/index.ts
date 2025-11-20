// src/features/admin/index.ts - Updated with clean separation

// === Pages ===
export { AdminDashboardPage } from './pages/AdminDashboardPage'
export { UserManagementPage } from './pages/UserManagementPage'
export { AdminSettingsPage } from './pages/AdminSettingsPage'
export { AdminAuditLogsPage } from './pages/AdminAuditLogsPage'

// === Components ===
export { AdminGuard } from './components/AdminGuard'
export { AdminLayout } from './components/AdminLayout'
export { AdminStatsCard } from './components/AdminStatsCard'
export { FeatureConfigTab } from './components/FeatureConfigTab'
export { FeatureConfigSection } from './components/FeatureConfigSection'
export { ConfigField } from './components/ConfigField'
export { ConfigChangeDialog } from './components/ConfigChangeDialog'

// === Services (New Modular Structure) ===
export { userManagementService } from './services/UserManagementService'
export { appSettingsService } from './services/AppSettingsService'
export { auditAnalyticsService } from './services/AuditAnalyticsService'
export { default as FeatureConfigService } from './services/FeatureConfigService'

// === Hooks (New Modular Structure) ===
// Main combined hook
export { 
  useAdmin,
  useUserManagementOnly,
  useAppSettingsOnly,
  useAnalyticsOnly,
  useAdminDashboard,
  useAdminPermissions
} from './hooks/useAdmin'

// Individual specialized hooks
export { useUserManagement } from './hooks/useUserManagement'
export { useAppSettingsManagement } from './hooks/useAppSettingsManagement'
export { useAnalyticsAudit } from './hooks/useAnalyticsAudit'
export { useFeatureConfigManagement } from './hooks/useFeatureConfigManagement'

// === Types ===
export type {
  // Component types
  AdminLayoutProps,
  AdminStatsCardProps,
  
  // User Management types
  UserManagementFilters,
  RoleUpdateRequest,
  UserCreationRequest,
  BulkUserAction,
  UserAction,
  
  // Better Auth types
  BetterAuthUser,
  UserSession,
  BanUserRequest,
  SetPasswordRequest,
  ImpersonationRequest,
  SessionManagementRequest,
  RoleDefinition,
  ListUsersResponse,
  ListUsersOptions,
  CreateUserResponse,
  AdminOperationResponse,
  
  // Audit types
  AuditLogEntry,
  AuditLogFilters,
  AuditLogStats,
  
  // Settings types
  AppSetting,
  AISettings,
  SystemSettings,
  
  // Analytics types
  AdminStats,
  UserAnalytics,
  
  // Session Management types
  SessionInfo,
  SessionManagementStats,
  
  // Impersonation types
  ImpersonationSession,
  ImpersonationStats,
  
  // System types
  AdminAction,
  DashboardMetric,
  AdminError,

} from './types/admin.types'

// Feature Configuration types
export type {
  FeatureName,
  FeatureCategory,
  ConfigScope,
  ValueType,
  OverrideSource,
  FeatureInfo,
  FeatureConfig,
  AppConfig,
  ConfigChange,
  FeatureConfigState,
  UnsavedChanges,
  ValidationError,
  ValidationResult,
  ValidationSummary,
  ConfigFieldProps,
  FeatureConfigSectionProps,
  ConfigChangeDialogProps,
  SetConfigResponse,
  ResetConfigResponse,
  BatchUpdateResponse,
  ConfigSection,
  FeatureConfigDefinition,
} from './types/config.types'

// === Query Keys ===
export { adminQueryKeys } from './types/admin.types'

// === Role Configuration ===
export { ROLE_DEFINITIONS } from './types/admin.types'

