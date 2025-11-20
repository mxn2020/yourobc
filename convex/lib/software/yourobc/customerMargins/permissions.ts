// convex/lib/software/yourobc/customerMargins/permissions.ts
/**
 * Customer Margins Permissions
 *
 * Access control and authorization for customer margins module operations.
 * Defines who can read, create, update, and delete margin configurations,
 * contact logs, analytics, and dunning configurations.
 *
 * @module convex/lib/software/yourobc/customerMargins/permissions
 */

import { Id } from '../../../../_generated/dataModel'

// ============================================================================
// Permission Types
// ============================================================================

/**
 * User context for permission checks
 */
export interface UserContext {
  userId: string // authUserId
  role: string
  isAdmin: boolean
  isSuperAdmin: boolean
  ownerId?: Id<'owners'>
}

/**
 * Permission check result
 */
export interface PermissionResult {
  allowed: boolean
  reason?: string
}

// ============================================================================
// Role Definitions
// ============================================================================

/**
 * User roles with different permission levels
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  ACCOUNTING: 'accounting',
  CUSTOMER_SERVICE: 'customer_service',
  VIEWER: 'viewer',
} as const

/**
 * Permission levels for different operations
 */
export const PERMISSIONS = {
  // Customer Margins
  MARGINS_READ: 'margins:read',
  MARGINS_CREATE: 'margins:create',
  MARGINS_UPDATE: 'margins:update',
  MARGINS_DELETE: 'margins:delete',
  MARGINS_APPROVE: 'margins:approve',

  // Contact Log
  CONTACTS_READ: 'contacts:read',
  CONTACTS_CREATE: 'contacts:create',
  CONTACTS_UPDATE: 'contacts:update',
  CONTACTS_DELETE: 'contacts:delete',
  CONTACTS_ASSIGN: 'contacts:assign',

  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_CALCULATE: 'analytics:calculate',

  // Dunning Config
  DUNNING_READ: 'dunning:read',
  DUNNING_CREATE: 'dunning:create',
  DUNNING_UPDATE: 'dunning:update',
  DUNNING_DELETE: 'dunning:delete',
  DUNNING_SUSPEND: 'dunning:suspend',
  DUNNING_REACTIVATE: 'dunning:reactivate',
} as const

/**
 * Role permission mappings
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // All permissions
  [ROLES.MANAGER]: [
    PERMISSIONS.MARGINS_READ,
    PERMISSIONS.MARGINS_CREATE,
    PERMISSIONS.MARGINS_UPDATE,
    PERMISSIONS.MARGINS_APPROVE,
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_UPDATE,
    PERMISSIONS.CONTACTS_ASSIGN,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_CALCULATE,
    PERMISSIONS.DUNNING_READ,
    PERMISSIONS.DUNNING_UPDATE,
    PERMISSIONS.DUNNING_SUSPEND,
    PERMISSIONS.DUNNING_REACTIVATE,
  ],
  [ROLES.ACCOUNTING]: [
    PERMISSIONS.MARGINS_READ,
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.DUNNING_READ,
    PERMISSIONS.DUNNING_UPDATE,
    PERMISSIONS.DUNNING_SUSPEND,
    PERMISSIONS.DUNNING_REACTIVATE,
  ],
  [ROLES.SALES]: [
    PERMISSIONS.MARGINS_READ,
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_UPDATE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.DUNNING_READ,
  ],
  [ROLES.CUSTOMER_SERVICE]: [
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_UPDATE,
    PERMISSIONS.DUNNING_READ,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.MARGINS_READ,
    PERMISSIONS.CONTACTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.DUNNING_READ,
  ],
}

// ============================================================================
// Permission Check Functions
// ============================================================================

/**
 * Check if user has specific permission
 */
export function hasPermission(user: UserContext, permission: string): boolean {
  // Super admin and admin have all permissions
  if (user.isSuperAdmin || user.isAdmin) return true

  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if user can read customer margins
 */
export function canReadMargins(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.MARGINS_READ)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to view customer margins',
  }
}

/**
 * Check if user can create customer margins
 */
export function canCreateMargins(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.MARGINS_CREATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to create customer margins',
  }
}

/**
 * Check if user can update customer margins
 */
export function canUpdateMargins(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.MARGINS_UPDATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to update customer margins',
  }
}

/**
 * Check if user can delete customer margins
 */
export function canDeleteMargins(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.MARGINS_DELETE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to delete customer margins',
  }
}

/**
 * Check if user can read contact logs
 */
export function canReadContacts(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.CONTACTS_READ)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to view contact logs',
  }
}

/**
 * Check if user can create contact logs
 */
export function canCreateContacts(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.CONTACTS_CREATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to create contact logs',
  }
}

/**
 * Check if user can update contact logs
 */
export function canUpdateContacts(user: UserContext, contactedBy?: string): PermissionResult {
  // User can always update their own contacts
  if (contactedBy && contactedBy === user.userId) {
    return { allowed: true }
  }

  // Otherwise check permission
  if (hasPermission(user, PERMISSIONS.CONTACTS_UPDATE)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You can only update your own contact logs',
  }
}

/**
 * Check if user can assign follow-up tasks
 */
export function canAssignFollowUp(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.CONTACTS_ASSIGN)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to assign follow-up tasks',
  }
}

/**
 * Check if user can read analytics
 */
export function canReadAnalytics(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.ANALYTICS_READ)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to view customer analytics',
  }
}

/**
 * Check if user can calculate analytics
 */
export function canCalculateAnalytics(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.ANALYTICS_CALCULATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to calculate analytics',
  }
}

/**
 * Check if user can read dunning config
 */
export function canReadDunningConfig(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.DUNNING_READ)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to view dunning configuration',
  }
}

/**
 * Check if user can update dunning config
 */
export function canUpdateDunningConfig(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.DUNNING_UPDATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to update dunning configuration',
  }
}

/**
 * Check if user can suspend customer service
 */
export function canSuspendService(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.DUNNING_SUSPEND)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to suspend customer service',
  }
}

/**
 * Check if user can reactivate customer service
 */
export function canReactivateService(user: UserContext): PermissionResult {
  if (hasPermission(user, PERMISSIONS.DUNNING_REACTIVATE)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: 'You do not have permission to reactivate customer service',
  }
}

// ============================================================================
// Ownership Checks
// ============================================================================

/**
 * Check if user owns the resource
 */
export function isOwner(user: UserContext, ownerId?: Id<'owners'>): boolean {
  if (!ownerId || !user.ownerId) return false
  return user.ownerId === ownerId
}

/**
 * Check if user can access resource based on ownership
 */
export function canAccessByOwnership(
  user: UserContext,
  ownerId?: Id<'owners'>
): PermissionResult {
  // Super admin and admin can access all resources
  if (user.isSuperAdmin || user.isAdmin) {
    return { allowed: true }
  }

  // Check ownership
  if (isOwner(user, ownerId)) {
    return { allowed: true }
  }

  return {
    allowed: false,
    reason: 'You can only access resources you own',
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Assert permission or throw error
 */
export function assertPermission(result: PermissionResult): void {
  if (!result.allowed) {
    throw new Error(result.reason || 'Permission denied')
  }
}

/**
 * Get user role permissions
 */
export function getRolePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if role exists
 */
export function isValidRole(role: string): boolean {
  return Object.values(ROLES).includes(role as any)
}

// ============================================================================
// Export All Functions
// ============================================================================

export default {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canReadMargins,
  canCreateMargins,
  canUpdateMargins,
  canDeleteMargins,
  canReadContacts,
  canCreateContacts,
  canUpdateContacts,
  canAssignFollowUp,
  canReadAnalytics,
  canCalculateAnalytics,
  canReadDunningConfig,
  canUpdateDunningConfig,
  canSuspendService,
  canReactivateService,
  isOwner,
  canAccessByOwnership,
  assertPermission,
  getRolePermissions,
  isValidRole,
}
