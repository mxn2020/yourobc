// filepath: src/features/boilerplate/auth/types/auth.types.ts
import { EntityType } from '@/convex/types'
import type { Id } from '@/convex/_generated/dataModel'
import type { AuthUserId, UserProfileId } from '../../_shared/types'

// === Core Auth Types (from Better Auth) ===

export interface Session {
  session: AuthSession | null
  user: AuthUser | null
}
export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  createdAt: Date
  updatedAt: Date
  image?: string | null | undefined
  
  role?: UserRole | null | undefined
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
}

export interface AuthSession {
  id: string
  userId: string // Better Auth user ID (AuthUserId)
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token: string
  ipAddress?: string | null | undefined
  userAgent?: string | null | undefined

  impersonatedBy?: string | null
}

// === Convex Profile Types ===
export interface UserProfile {
  _id: UserProfileId // Convex document ID
  _creationTime: number

  // Better-Auth linked fields
  authUserId: AuthUserId // Better Auth user ID
  email: string
  isEmailVerified: boolean // -> AuthUser.emailVerified
  name?: string
  createdAt: number
  updatedAt?: number // Optional per schema auditFields
  avatar?: string // -> AuthUser.image
  role: UserRole
  banned: boolean
  banReason?: string | null
  banExpires?: number | null

  // Application-specific fields
  bio?: string
  permissions: string[]
  stats: UserStats
  badges: string[]
  lastActiveAt: number
  lastLoginAt: number
  ipAddress?: string
  userAgent?: string
  isActive: boolean
  isProfileComplete: boolean
}

export interface UserStats {
  karmaLevel: number
  tasksCompleted: number
  tasksAssigned: number
  projectsCreated: number
  loginCount: number
  totalAIRequests: number
  totalAICost: number
}

export interface UserSettings {
  _id: Id<"userSettings">
  userId: UserProfileId // Reference to user profile
  theme: ThemeMode
  language: string
  timezone: string
  dateFormat: string
  layoutPreferences: LayoutPreferences
  notificationPreferences: NotificationSettings
  dashboardPreferences: DashboardSettings
  version: number
  createdAt: number
  updatedAt: number
}

// Simplified settings object returned by queries (without DB metadata)
export interface UserSettingsData {
  theme: ThemeMode
  language: string
  timezone: string
  dateFormat: string
  layoutPreferences: LayoutPreferences
  notificationPreferences: NotificationSettings
  dashboardPreferences: DashboardSettings
  version: number
}

export interface LayoutPreferences {
  layout: 'header' | 'sidebar'
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  projectUpdates: boolean
  assignments: boolean
  deadlines: boolean
}

export interface DashboardSettings {
  defaultView: 'cards' | 'table'
  itemsPerPage: number
  showCompletedProjects: boolean
}

export interface UserModelPreferences {
  defaultLanguageModel?: string
  defaultEmbeddingModel?: string
  defaultImageModel?: string
  defaultMultimodalModel?: string
  favoriteModels: string[]
  hiddenProviders: string[]
  preferredView: 'grid' | 'list'
  sortPreference: {
    field: string
    direction: 'asc' | 'desc'
  }
  testingDefaults?: {
    temperature: number
    maxTokens: number
    topP: number
  }
}

// === Unified User Type ===
export interface UnifiedUser {
  // Auth data (from Better Auth)
  auth: AuthUser | null
  // Profile data (from Convex)
  profile: UserProfile | null | undefined
  // Settings data (from Convex) - undefined during loading, null when doesn't exist
  settings: UserSettingsData | null | undefined
  // Loading states
  isAuthLoading: boolean
  isProfileLoading: boolean
  isSettingsLoading: boolean
  // Computed states
  isReady: boolean
  isAuthenticated: boolean
  hasCompleteProfile: boolean
}

// === Enums and Literals ===
export type UserRole = 'superadmin' | 'admin' | 'user' | 'moderator' | 'editor' | 'analyst' | 'guest'
export type ThemeMode = 'light' | 'dark' | 'auto'
export type AuthProvider = 'email' | 'google' | 'apple' | 'twitter'
export type ActivityType = 'login' | 'ai_request' | 'project_created' | 'task_completed'

// === Form Types ===
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
  token: string
}

export interface ProfileUpdateFormData {
  name?: string
  avatar?: string
  bio?: string
}

export interface UserSettingsUpdate {
  theme?: ThemeMode
  language?: string
  timezone?: string
  dateFormat?: string
  layoutPreferences?: Partial<LayoutPreferences>
  notificationPreferences?: Partial<NotificationSettings>
  dashboardPreferences?: Partial<DashboardSettings>
}

// === API Response Types ===
export interface AuthResponse<T = any> {
  success: boolean
  data?: T
  error?: AuthenticationError
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, any>
}

// === Permission Types ===
export interface PermissionCheck {
  hasPermission: (permission: string) => boolean
  canAccessAdmin: boolean
  canManageUsers: boolean
  canViewAuditLogs: boolean
}

// === Activity Tracking ===
export interface ActivityMetadata {
  cost?: number
  ipAddress?: string
  userAgent?: string
}

// === Component Props ===
export interface AuthFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export interface ProfileFormProps {
  user: UserProfile
  onUpdate: (profile: Partial<UserProfile>) => Promise<void>
  isLoading?: boolean
}

// === Type Guards ===
export function isAuthUser(user: any): user is AuthUser {
  return user && typeof user.id === 'string' && typeof user.email === 'string'
}

export function isUserProfile(profile: any): profile is UserProfile {
  return profile && typeof profile.authUserId === 'string' && profile._id
}

export function isUnifiedUserReady(user: UnifiedUser): boolean {
  return !user.isAuthLoading && !user.isProfileLoading && user.isAuthenticated
}

export function isUserSettings(settings: any): settings is UserSettings {
  return settings && settings._id && typeof settings.theme === 'string'
}

export function isUserModelPreferences(preferences: any): preferences is UserModelPreferences {
  return preferences && Array.isArray(preferences.favoriteModels)
}

// === Extracted Error Code Types ===
export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES]
export type ProfileErrorCode = typeof PROFILE_ERROR_CODES[keyof typeof PROFILE_ERROR_CODES]


// === Error Classes ===
export class AuthenticationError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class ProfileError extends Error {
  constructor(
    public code: ProfileErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ProfileError'
  }
}

// === Error Factory Functions ===
export function createAuthError(
  code: AuthErrorCode, 
  customMessage?: string, 
  details?: Record<string, any>
): AuthenticationError {
  return new AuthenticationError(code, customMessage || 'Authentication error', details)
}

export function createProfileError(
  code: ProfileErrorCode, 
  customMessage?: string, 
  details?: Record<string, any>
): ProfileError {
  return new ProfileError(code, customMessage || 'Profile error', details)
}

// === Error Code Constants ===
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_EXISTS: 'USER_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  OAUTH_ERROR: 'OAUTH_ERROR',
  OAUTH_CANCELLED: 'OAUTH_CANCELLED',
  OAUTH_ACCESS_DENIED: 'OAUTH_ACCESS_DENIED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export const PROFILE_ERROR_CODES = {
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  UPDATE_FAILED: 'UPDATE_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INVALID_DATA: 'INVALID_DATA',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

// === Query Key Factories ===
export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
    user: (userId?: UserProfileId) => ['auth', 'user', userId] as const,
  },
  profile: {
    byAuthId: (authUserId?: AuthUserId) => ['profile', 'byAuthId', authUserId] as const,
    all: (filters?: Record<string, any>) => ['profile', 'all', filters] as const,
    stats: () => ['profile', 'stats'] as const,
  },
  settings: {
    user: (userId?: UserProfileId) => ['settings', 'user', userId] as const,
    app: (category?: string) => ['settings', 'app', category] as const,
    ai: (userId?: UserProfileId) => ['settings', 'ai', userId] as const,
    models: (userId?: UserProfileId) => ['settings', 'models', userId] as const,
  },
  models: {
    preferences: (userId?: UserProfileId) => ['models', 'preferences', userId] as const,
    favorites: (userId?: UserProfileId) => ['models', 'favorites', userId] as const,
    defaults: (userId?: UserProfileId) => ['models', 'defaults', userId] as const,
  },
} as const

// === Utility Types ===
export type QueryKey = ReturnType<typeof queryKeys[keyof typeof queryKeys][keyof typeof queryKeys[keyof typeof queryKeys]]>

export type ServiceResponse<T = any> = {
  success: boolean
  data?: T
  error?: Error
}

export type MutationOptions<T = any> = {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}

// === Settings Export/Import Types ===
export interface SettingsExport {
  version: string
  exportedAt: string
  settings: Omit<UserSettings, '_id' | 'userId' | 'version' | 'createdAt' | 'updatedAt'>
  modelPreferences: UserModelPreferences
}

export interface SettingsImport {
  version: string
  settings: Partial<UserSettings>
  modelPreferences: Partial<UserModelPreferences>
}

// === Admin Types ===
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  verifiedUsers: number
  completeProfiles: number
  totalAIRequests: number
  totalAICost: number
  totalKarma: number
}

export interface UserManagementFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  limit?: number
  offset?: number
}

// === AI Settings Types ===
export interface AISettings {
  defaultModel: string
  defaultProvider: string
  maxTokensDefault: number
  temperatureDefault: number
  enableAILogging: boolean
}

// === Theme Types ===
export interface ThemeConfig {
  mode: ThemeMode
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    sans: string[]
    mono: string[]
  }
}

// === Validation Types ===
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface PasswordStrength {
  score: number
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
}

// === Audit Log Types ===
export interface AuditLogEntry {
  id: string
  userId: UserProfileId // Reference to user profile
  action: string
  entityType: EntityType
  entityId?: string
  description: string
  timestamp: number
  metadata?: Record<string, any>
}

// === Notification Types ===
export interface Notification {
  id: string
  userId: UserProfileId // Reference to user profile
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: number
  actionUrl?: string
}

// === Model Provider Types ===
export interface ModelProvider {
  id: string
  name: string
  icon?: string
  models: Model[]
  enabled: boolean
}

export interface Model {
  id: string
  name: string
  provider: string
  type: 'language' | 'embedding' | 'image' | 'multimodal'
  description?: string
  maxTokens?: number
  pricing?: {
    input: number
    output: number
  }
  capabilities: string[]
}

// === Feature Flag Types ===
export interface FeatureFlags {
  enableAI: boolean
  enableProjects: boolean
  enableCollaboration: boolean
  enableAdvancedSettings: boolean
  enableBetaFeatures: boolean
}

// === Cache Types ===
export interface CacheConfig {
  ttl: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'ttl'
}

// === Environment Types ===
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  CONVEX_URL: string
  BETTER_AUTH_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
}