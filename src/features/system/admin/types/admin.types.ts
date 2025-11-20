// filepath: src/features/boilerplate/admin/types/admin.types.ts
import type { Id } from '@/convex/_generated/dataModel'
import { EntityType } from '@/convex/types'
import { UserProfile, UserRole, AuthUserId, UserProfileId } from '@/features/boilerplate/auth/types/auth.types'
import { LucideIcon } from 'lucide-react'
import type { SettingCategory } from '@/convex/lib/boilerplate/app_settings/types'

// === Admin Component Types ===
export interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export interface AdminStatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
}

// === User Management Types ===
export interface UserManagementFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  isEmailVerified?: boolean
  isBanned?: boolean
  limit?: number
  offset?: number
}

export interface BulkUserAction {
  type: 'ban' | 'unban' | 'setRole' | 'revokeAllSessions' | 'activate' | 'deactivate',
  userIds: AuthUserId[] // Better Auth user IDs (strings)
  metadata?: {
    newRole?: UserRole
    reason?: string
    banReason?: string
    banExpiresIn?: number
  }
}

export interface UserAction {
  id: string
  label: string | ((user: UserProfile) => string)
  icon: LucideIcon | ((user: UserProfile) => LucideIcon)
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | ((user: UserProfile) => string)
  requiresConfirmation?: boolean
  confirmationMessage?: (user: UserProfile) => string
  action: (user: UserProfile) => Promise<void>
}

// === Better Auth Admin Types ===
export interface BetterAuthUser {
  id: string // Better-auth uses string IDs
  email: string
  emailVerified: boolean
  name?: string | null
  createdAt: Date
  updatedAt: Date
  image?: string | null
}

// Type alias for users with properly typed roles (used in user management UI)
export type UserWithRole = BetterAuthUser & {
  role?: string | UserRole | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null

}

export interface UserSession {
  id: string
  userId: AuthUserId // Better Auth user ID (string)
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  impersonatedBy?: string | null
}

export interface BanUserRequest {
  userId: AuthUserId // Better Auth user ID (string)
  banReason?: string
  banExpiresIn?: number // seconds
}

export interface SetPasswordRequest {
  userId: AuthUserId // Better Auth user ID (string)
  newPassword: string
}

export interface ImpersonationRequest {
  userId: AuthUserId // Better Auth user ID (string)
}

export interface SessionManagementRequest {
  userId?: AuthUserId // Better Auth user ID (string)
  sessionToken?: string
}

// === Role Management Types ===
export interface RoleDefinition {
  value: string
  label: string
  description: string
  color: 'red' | 'blue' | 'green' | 'yellow' | 'gray' | 'purple'
  permissions?: string[] // For display purposes only
}

export interface RoleUpdateRequest {
  authUserId: AuthUserId // Better Auth user ID (for BetterAuth operations)
  userProfileId: UserProfileId // Convex user profile ID (for Convex operations)
  newRole: UserRole
  permissions?: string[]
  reason?: string
}

export interface UserCreationRequest {
  email: string
  name: string
  password: string
  role?: UserRole
  sendInvite?: boolean
}

// === Admin Management Types ===
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  verifiedUsers: number
  bannedUsers: number
  completeProfiles: number
  totalAIRequests: number
  totalAICost: number
  totalKarma: number
  avgAIRequestsPerUser: number
  avgKarmaPerUser: number
}

export interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  usersByRole: Record<UserRole, number>
  userActivity: {
    date: string
    logins: number
    registrations: number
    bans: number
  }[]
  topActiveUsers: {
    user: UserProfile
    activityScore: number
  }[]
  impersonationActivity: {
    adminId: AuthUserId // Better Auth user ID (string)
    adminName: string
    targetUserId: AuthUserId // Better Auth user ID (string)
    targetUserEmail: string
    timestamp: number
    duration?: number
  }[] | null
}

// === Audit Log Types ===
export interface AuditLogEntry {
  id: string
  userId: UserProfileId // Convex user profile ID (for internal reference)
  userName: string
  action: AdminAction
  entityType: EntityType
  entityId?: string
  entityTitle?: string
  description: string
  createdAt: number
  metadata?: Record<string, any>
}

export interface AuditLogFilters {
  query?: string
  userId?: UserProfileId // Convex user profile ID (for filtering)
  action?: AdminAction
  entityType?: string
  entityId?: string
  dateFrom?: number
  dateTo?: number
  limit?: number
  offset?: number
}

export interface AuditLogStats {
  totalLogs: number
  logsToday: number
  logsThisWeek: number
  logsThisMonth: number
  actionCounts: Record<AdminAction, number>
  entityTypeCounts: Record<string, number>
  recentActivity: AuditLogEntry[]
}

// === Admin Action Types ===
export type AdminAction = 
  | 'user.created'
  | 'user.role_changed'
  | 'user.activated'
  | 'user.deactivated'
  | 'user.banned'
  | 'user.unbanned'
  | 'user.password_reset'
  | 'user.impersonated'
  | 'user.sessions_revoked'
  | 'user.deleted'
  | 'bulk.action_performed'
  | 'settings.updated'
  | 'audit.viewed'
  | 'data.exported'

// === Better Auth Specific Types ===
export interface ListUsersResponse {
  users: BetterAuthUser[]
  total: number
  limit?: number
  offset?: number
}

export interface ListUsersOptions {
  searchValue?: string
  searchField?: 'email' | 'name'
  searchOperator?: 'contains' | 'starts_with' | 'ends_with'
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte'
}

export interface CreateUserResponse {
  data?: {
    user: BetterAuthUser
  }
  error?: {
    message: string
    status: number
  }
}

export interface AdminOperationResponse {
  success: boolean
  data?: any
  error?: {
    message: string
    code?: string
  }
}

// === Permission System Types (Simplified) ===
export interface Permission {
  id: string
  name: string
  description: string
  category: 'user_management' | 'content_moderation' | 'system_settings' | 'data_access'
}

// === Dashboard Types ===
export interface DashboardMetric {
  id: string
  label: string
  value: number | string
  change?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  format: 'number' | 'currency' | 'percentage' | 'text'
}

// === App Settings Types ===
export interface AppSetting {
  key: string
  value: any
  category: SettingCategory
  description?: string
  isPublic: boolean
  createdAt: number
  updatedAt: number
  updatedBy: string
}

export interface AISettings {
  defaultModel: string
  defaultProvider: string
  maxTokensDefault: number
  temperatureDefault: number
  enableAILogging: boolean
}

export interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    emailVerificationRequired: boolean
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordMinLength: number
    requireTwoFactor: boolean
  }
  notifications: {
    adminAlerts: boolean
    userWelcomeEmail: boolean
    passwordResetEmail: boolean
    securityNotifications: boolean
  }
  ai: AISettings
}

// === Error Handling ===
export interface AdminError {
  code: string
  message: string
  details?: Record<string, any>
}

// === Session Management Types ===
export interface SessionInfo {
  id: string
  userId: AuthUserId // Better Auth user ID (string)
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
  impersonatedBy?: string
}

export interface SessionManagementStats {
  totalSessions: number
  activeSessions: number
  impersonatedSessions: number
  expiredSessions: number
  sessionsToday: number
}

// === Impersonation Types ===
export interface ImpersonationSession {
  adminId: AuthUserId // Better Auth user ID (string)
  adminName: string
  targetUserId: AuthUserId // Better Auth user ID (string)
  targetUserName: string
  targetUserEmail: string
  startedAt: number
  expiresAt: number
  isActive: boolean
}

export interface ImpersonationStats {
  totalSessions: number
  activeSessions: number
  uniqueAdmins: number
  uniqueTargets: number
  averageDuration: number
  recentSessions: ImpersonationSession[]
}

// === Query Keys ===
export const adminQueryKeys = {
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    users: {
      all: (filters?: UserManagementFilters) => ['admin', 'users', 'all', filters] as const,
      byId: (userId: AuthUserId) => ['admin', 'users', 'byId', userId] as const, // Better Auth ID
      stats: () => ['admin', 'users', 'stats'] as const,
      sessions: (userId: AuthUserId) => ['admin', 'users', 'sessions', userId] as const, // Better Auth ID
    },
    audit: {
      logs: (filters?: AuditLogFilters) => ['admin', 'audit', 'logs', filters] as const,
      stats: () => ['admin', 'audit', 'stats'] as const,
    },
    settings: {
      all: () => ['admin', 'settings', 'all'] as const,
      ai: () => ['admin', 'settings', 'ai'] as const,
      category: (category: string) => ['admin', 'settings', 'category', category] as const,
    },
    impersonation: {
      active: () => ['admin', 'impersonation', 'active'] as const,
      stats: () => ['admin', 'impersonation', 'stats'] as const,
      history: (filters?: any) => ['admin', 'impersonation', 'history', filters] as const,
    },
  },
} as const

// === Utility Types ===
export type ServiceResponse<T = any> = {
  success: boolean
  data?: T
  error?: AdminError
}

export type MutationOptions<T = any> = {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}

// === Better Auth API Response Types ===
export interface BetterAuthResponse<T = any> {
  data?: T
  error?: {
    message: string
    status?: number
    code?: string
  }
}

// === Role Configuration ===
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  superadmin: {
    value: 'superadmin',
    label: 'Super Administrator',
    description: 'Ultimate system control with all permissions',
    color: 'purple',
    permissions: ['*'],
  },
  admin: {
    value: 'admin',
    label: 'Administrator',
    description: 'Full system access',
    color: 'red',
    permissions: ['*'],
  },
  user: {
    value: 'user',
    label: 'User',
    description: 'Standard user with basic permissions',
    color: 'gray',
    permissions: ['projects.view.own', 'profile.edit'],
  },
  moderator: {
    value: 'moderator',
    label: 'Moderator',
    description: 'Content moderation and user assistance',
    color: 'blue',
    permissions: ['users.view', 'users.edit', 'content.moderate', 'projects.view.all'],
  },
  editor: {
    value: 'editor',
    label: 'Editor',
    description: 'Content creation and management',
    color: 'green',
    permissions: ['projects.create', 'projects.edit.all', 'content.create', 'content.edit'],
  },
  analyst: {
    value: 'analyst',
    label: 'Analyst',
    description: 'Analytics and reporting access',
    color: 'yellow',
    permissions: ['analytics.view', 'reports.generate', 'usage.view', 'financial.view'],
  },
  guest: {
    value: 'guest',
    label: 'Guest',
    description: 'Limited read-only access',
    color: 'gray',
    permissions: ['projects.view'],
  },

} as const

// === Routes Configuration ===
export interface AdminRoute {
  path: string
  title: string
  description?: string
  icon: LucideIcon
  component: React.ComponentType
  requiresPermission?: string
  isExact?: boolean
}