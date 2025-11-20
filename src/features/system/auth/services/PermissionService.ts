// src/features/system/auth/services/PermissionService.ts

import { authClient } from '../lib/auth-client'
import { UserProfile, UserRole } from '../types/auth.types'
import { Id } from "@/convex/_generated/dataModel"

type ResourceAction = 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'moderate'

/**
 * Permission service - handles role-based permission checking
 * Optimized with generic resource checking
 */
class PermissionService {
  
  // === Role-based Permission Definitions ===
  private readonly rolePermissions: Record<UserRole, string[]> = {
    superadmin: ['*'], // All permissions
    admin: [
      'users.view',
      'users.manage',
      'users.create', 
      'users.delete',
      'settings.manage',
      'audit.view',
      'projects.view.all',
      'projects.manage.all',
      'analytics.view',
      'system.admin'
    ],
    moderator: [
      'users.view',
      'users.edit',
      'projects.view.all',
      'projects.moderate',
      'content.moderate',
      'audit.view'
    ],
    editor: [
      'projects.create',
      'projects.edit.all',
      'content.create',
      'content.edit',
      'analytics.view'
    ],
    analyst: [
      'analytics.view',
      'reports.generate',
      'usage.view',
      'financial.view',
      'projects.view.all'
    ],
    user: [
      'projects.view.own',
      'projects.create',
      'projects.edit.own',
      'profile.edit'
    ],
    guest: [
      'projects.view'
    ],
  }

  // === Permission Checking ===
  hasPermission(profile: UserProfile | null, permission: string): boolean {
    if (!profile || !profile.isActive) return false
    
    const rolePermissions = this.rolePermissions[profile.role]
    
    // Check for admin wildcard
    if (rolePermissions.includes('*')) return true
    
    // Check specific permission
    return rolePermissions.includes(permission)
  }

  hasAnyPermission(profile: UserProfile | null, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(profile, permission))
  }

  hasAllPermissions(profile: UserProfile | null, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(profile, permission))
  }

  // === Generic Resource Access ===
  /**
   * Generic resource access check
   * @param profile - User profile
   * @param resource - Resource name (e.g., 'projects', 'users', 'settings')
   * @param action - Action type
   * @param scope - Optional scope ('own', 'all')
   */
  canAccessResource(
    profile: UserProfile | null,
    resource: string,
    action: ResourceAction,
    scope?: 'own' | 'all'
  ): boolean {
    if (!profile || !profile.isActive) return false

    const permission = scope 
      ? `${resource}.${action}.${scope}`
      : `${resource}.${action}`

    return this.hasPermission(profile, permission)
  }

  // === Role Checking ===
  hasRole(profile: UserProfile | null, role: UserRole): boolean {
    return profile?.role === role
  }

  hasAnyRole(profile: UserProfile | null, roles: UserRole[]): boolean {
    if (!profile) return false
    return roles.includes(profile.role)
  }

  isAdmin(profile: UserProfile | null): boolean {
    return this.hasAnyRole(profile, ['admin', 'superadmin'])
  }

  isModerator(profile: UserProfile | null): boolean {
    return this.hasAnyRole(profile, ['moderator', 'admin', 'superadmin'])
  }

  // === Convenience Methods (using generic resource check) ===
  canViewAllProjects(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'projects', 'view', 'all')
  }

  canManageProjects(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'projects', 'manage', 'all')
  }

  canViewOwnProjects(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'projects', 'view', 'own')
  }

  canManageUsers(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'users', 'manage')
  }

  canViewUsers(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'users', 'view')
  }

  canViewAuditLogs(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'audit', 'view')
  }

  canViewAnalytics(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'analytics', 'view')
  }

  canManageSettings(profile: UserProfile | null): boolean {
    return this.canAccessResource(profile, 'settings', 'manage')
  }

  canAccessAdmin(profile: UserProfile | null): boolean {
    return this.hasPermission(profile, 'system.admin')
  }

  // === Resource Ownership Checks ===
  canEditResource(
    profile: UserProfile | null,
    resource: string,
    ownerId: string
  ): boolean {
    if (!profile) return false
    
    // Can edit all resources of this type
    if (this.canAccessResource(profile, resource, 'edit', 'all')) return true
    
    // Can edit own resources
    if (this.canAccessResource(profile, resource, 'edit', 'own') && profile.authUserId === ownerId) {
      return true
    }
    
    return false
  }

  canDeleteResource(
    profile: UserProfile | null,
    resource: string,
    ownerId: string
  ): boolean {
    if (!profile) return false
    
    // Admins can delete
    if (this.isAdmin(profile)) return true
    
    // Owners can delete their own
    if (profile.authUserId === ownerId) return true
    
    return false
  }

  // Specific implementations for backward compatibility
  canEditProject(profile: UserProfile | null, projectOwnerId: string): boolean {
    return this.canEditResource(profile, 'projects', projectOwnerId)
  }

  canDeleteProject(profile: UserProfile | null, projectOwnerId: string): boolean {
    return this.canDeleteResource(profile, 'projects', projectOwnerId)
  }

  canEditUser(profile: UserProfile | null, targetUserId: Id<"userProfiles">): boolean {
    if (!profile) return false
    
    // Can edit own profile
    if (profile.authUserId === targetUserId) return true
    
    // Can manage users
    return this.hasPermission(profile, 'users.manage')
  }

  canDeleteUser(profile: UserProfile | null, targetUserId: Id<"userProfiles">): boolean {
    if (!profile) return false
    
    // Cannot delete self
    if (profile.authUserId === targetUserId) return false
    
    // Only admins can delete users
    return this.isAdmin(profile)
  }

  // === Better Auth Integration ===
  async checkRolePermission(role: UserRole, permission: string): Promise<boolean> {
    try {
      return authClient.admin.checkRolePermission({
        role,
        permissions: { [permission.split('.')[0]]: [permission.split('.')[1] || permission] }
      })
    } catch {
      // Fallback to local permission check
      const rolePermissions = this.rolePermissions[role]
      return rolePermissions.includes('*') || rolePermissions.includes(permission)
    }
  }

  async hasPermissionAsync(permission: string): Promise<boolean> {
    try {
      const result = await authClient.admin.hasPermission({
        permissions: { [permission.split('.')[0]]: [permission.split('.')[1] || permission] }
      })
      return result.data?.success || false
    } catch {
      return false
    }
  }

  // === Permission Utilities ===
  getRolePermissions(role: UserRole): string[] {
    return [...this.rolePermissions[role]]
  }

  getAllPermissions(): string[] {
    const allPermissions = new Set<string>()
    Object.values(this.rolePermissions).forEach(permissions => {
      permissions.forEach(permission => {
        if (permission !== '*') allPermissions.add(permission)
      })
    })
    return Array.from(allPermissions).sort()
  }

  getPermissionsByCategory(): Record<string, string[]> {
    const categories: Record<string, string[]> = {}
    
    this.getAllPermissions().forEach(permission => {
      const [category] = permission.split('.')
      if (!categories[category]) categories[category] = []
      categories[category].push(permission)
    })
    
    return categories
  }

  // === Role Information ===
  getRoleHierarchy(): Record<UserRole, number> {
    return {
      guest: 0,
      user: 1,
      analyst: 2,
      editor: 3,
      moderator: 4,
      admin: 5,
      superadmin: 6
    }
  }

  isRoleHigherThan(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy()
    return hierarchy[role1] > hierarchy[role2]
  }

  canManageRole(currentRole: UserRole, targetRole: UserRole): boolean {
    // Superadmins can manage anyone
    if (currentRole === 'superadmin') return true
    
    // Admins can manage roles below admin level
    if (currentRole === 'admin' && targetRole !== 'admin' && targetRole !== 'superadmin') {
      return true
    }
    
    return false
  }

  getRoleDisplayInfo(role: UserRole): { name: string; color: string; description: string } {
    const roleInfo = {
      superadmin: {
        name: 'Super Administrator',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        description: 'Ultimate system control with all permissions'
      },
      admin: {
        name: 'Administrator',
        color: 'text-red-600 bg-red-50 border-red-200',
        description: 'Full system access and user management'
      },
      moderator: {
        name: 'Moderator',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        description: 'Content moderation and user assistance'
      },
      editor: {
        name: 'Editor',
        color: 'text-green-600 bg-green-50 border-green-200',
        description: 'Content creation and project management'
      },
      analyst: {
        name: 'Analyst',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        description: 'Analytics and reporting access'
      },
      user: {
        name: 'User',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        description: 'Standard user with basic permissions'
      },
      guest: {
        name: 'Guest',
        color: 'text-gray-500 bg-gray-50 border-gray-200',
        description: 'Limited read-only access'
      },
    }
    
    return roleInfo[role]
  }
}

export const permissionService = new PermissionService()