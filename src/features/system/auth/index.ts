// src/features/system/auth/index.ts - Updated with clean separation
// CLIENT-SAFE EXPORTS ONLY - For client-side imports use this file

// === Core Auth Client ===
export { authClient } from './lib/auth-client'

// === Client Route Guards ===
export {
  requireAuth,
  requireAdmin,
  getAuthStatus,
  requireGuestBeforeLoad,
  beforeLoadAuth,
  beforeLoadAdmin,
  hasPermission
} from './lib/route-guards-client'

// === Services (Singletons) ===
export { authService } from './services/AuthService'
export { profileManagementService } from './services/ProfileManagementService'
export { userSettingsManagementService } from './services/UserSettingsManagementService'
export { permissionService } from './services/PermissionService'

// === Hooks (New Modular Structure) ===
// Main combined hook
export { 
  useAuth,
  useAuthOnly,
  useProfileOnly,
  useSettingsOnly,
  usePermissionsOnly,
  useAuthStatus,
  useCurrentUser
} from './hooks/useAuth'

// Individual specialized hooks
export { useAuthentication } from './hooks/useAuthentication'
export { useProfile } from './hooks/useProfile'
export { useUserSettings } from './hooks/useUserSettings'
export { usePermissions } from './hooks/usePermissions'
export { useAuthenticatedUser } from './hooks/useAuthenticatedUser'
export { useAuthForm } from './hooks/useAuthForm'

// === Error Handling ===
export {
  AUTH_ERROR_CODES,
  PROFILE_ERROR_CODES,
  createAuthError,
  createProfileError,
  parseAuthError,
  parseProfileError,
  getErrorMessage,
  isRetryableError,
  getErrorSeverity,
  useErrorHandler
} from './utils/ErrorHandling'

// === Components - Auth ===
export { AuthGuard } from './components/AuthGuard'
export { AuthLayout } from './components/AuthLayout'
export { LoginForm } from './components/LoginForm'
export { SignupForm } from './components/SignupForm'
export { ForgotPasswordForm } from './components/ForgotPasswordForm'
export { ResetPasswordForm } from './components/ResetPasswordForm'

// === Pages ===
export { LoginPage } from './pages/LoginPage'
export { SignupPage } from './pages/SignupPage'
export { ForgotPasswordPage } from './pages/ForgotPasswordPage'
export { ResetPasswordPage } from './pages/ResetPasswordPage'

// === Types ===
export type {
  // Core types
  AuthUser,
  UserProfile,
  UnifiedUser,
  AuthSession,
  UserSettings,
  UserSettingsData,
  UserStats,
  UserRole,
  ThemeMode,
  AuthProvider,
  ActivityType,
  
  // Form types
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ProfileUpdateFormData,
  UserSettingsUpdate,
  
  // Settings types
  NotificationSettings,
  DashboardSettings,
  LayoutPreferences,
  UserModelPreferences,
  
  // Error types
  AuthenticationError,
  ProfileError,
  ActivityMetadata,
  AuthResponse,
  
  // Component props
  AuthFormProps,
  AuthGuardProps,
  ProfileFormProps,
  
  // Utility types
  PermissionCheck,
} from './types/auth.types'

// Shared identifier types used across features
export type { AuthUserId, UserProfileId } from '../_shared/types'

// === Query Keys ===
export { queryKeys } from './types/auth.types'
