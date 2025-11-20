// src/features/boilerplate/auth/server.ts - Server-side exports only

// === Core Auth Server ===
export { auth } from './lib/auth-config'

// === Server Functions ===
export { 
  getSessionServer,
  requireAuthServer, 
  requireAdminServer,
  getCurrentUserServer 
} from './lib/server-functions'

// === Server Route Guards ===
export {
  createAuthLoader,
  createAdminLoader,
  createUserLoader,
  beforeLoadGuest,
  checkAuthOptional,
  redirectIfAuthenticated
} from './lib/route-guards-server'

// === Types ===
export type {
  // Core types
  AuthUser,
  UserProfile,
  UnifiedUser,
  AuthSession,
  UserSettings,
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