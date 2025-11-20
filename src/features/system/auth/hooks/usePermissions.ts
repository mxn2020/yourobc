// src/features/system/auth/hooks/usePermissions.ts

import { useMemo, useCallback } from 'react'
import { permissionService } from '../services/PermissionService'
import { UserProfile, UserRole } from '../types/auth.types'
import { Id } from "@/convex/_generated/dataModel"

/**
 * Permissions hook - handles role-based permission checking
 * Optimized with memoization
 */
export function usePermissions(profile: UserProfile | null | undefined) {
  const safeProfile = profile === undefined ? null : profile

  // === Basic Permission Checks ===
  const hasPermission = useCallback((permission: string) => {
    return permissionService.hasPermission(safeProfile, permission)
  }, [safeProfile])

  const hasAnyPermission = useCallback((permissions: string[]) => {
    return permissionService.hasAnyPermission(safeProfile, permissions)
  }, [safeProfile])

  const hasAllPermissions = useCallback((permissions: string[]) => {
    return permissionService.hasAllPermissions(safeProfile, permissions)
  }, [safeProfile])

  // === Generic Resource Access ===
  const canAccessResource = useCallback((
    resource: string,
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'moderate',
    scope?: 'own' | 'all'
  ) => {
    return permissionService.canAccessResource(safeProfile, resource, action, scope)
  }, [safeProfile])

  // === Role Checks (Memoized) ===
  const hasRole = useCallback((role: UserRole) => {
    return permissionService.hasRole(safeProfile, role)
  }, [safeProfile])

  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return permissionService.hasAnyRole(safeProfile, roles)
  }, [safeProfile])

  const isAdmin = useMemo(() => permissionService.isAdmin(safeProfile), [safeProfile])
  const isModerator = useMemo(() => permissionService.isModerator(safeProfile), [safeProfile])

  // === Resource-specific Permissions (Memoized) ===
  const canViewAllProjects = useMemo(() => permissionService.canViewAllProjects(safeProfile), [safeProfile])
  const canManageProjects = useMemo(() => permissionService.canManageProjects(safeProfile), [safeProfile])
  const canViewOwnProjects = useMemo(() => permissionService.canViewOwnProjects(safeProfile), [safeProfile])
  const canManageUsers = useMemo(() => permissionService.canManageUsers(safeProfile), [safeProfile])
  const canViewUsers = useMemo(() => permissionService.canViewUsers(safeProfile), [safeProfile])
  const canViewAuditLogs = useMemo(() => permissionService.canViewAuditLogs(safeProfile), [safeProfile])
  const canViewAnalytics = useMemo(() => permissionService.canViewAnalytics(safeProfile), [safeProfile])
  const canManageSettings = useMemo(() => permissionService.canManageSettings(safeProfile), [safeProfile])
  const canAccessAdmin = useMemo(() => permissionService.canAccessAdmin(safeProfile), [safeProfile])

  // === Resource Ownership Checks ===
  const canEditProject = useCallback((projectOwnerId: string) => {
    return permissionService.canEditProject(safeProfile, projectOwnerId)
  }, [safeProfile])

  const canDeleteProject = useCallback((projectOwnerId: string) => {
    return permissionService.canDeleteProject(safeProfile, projectOwnerId)
  }, [safeProfile])

  const canEditUser = useCallback((targetUserId: Id<"userProfiles">) => {
    return permissionService.canEditUser(safeProfile, targetUserId)
  }, [safeProfile])

  const canDeleteUser = useCallback((targetUserId: Id<"userProfiles">) => {
    return permissionService.canDeleteUser(safeProfile, targetUserId)
  }, [safeProfile])

  // === Role Management ===
  const canManageRole = useCallback((targetRole: UserRole) => {
    if (!safeProfile) return false
    return permissionService.canManageRole(safeProfile.role, targetRole)
  }, [safeProfile])

  // === Better Auth Integration ===
  const checkRolePermission = useCallback(async (role: UserRole, permission: string) => {
    return await permissionService.checkRolePermission(role, permission)
  }, [])

  const hasPermissionAsync = useCallback(async (permission: string) => {
    return await permissionService.hasPermissionAsync(permission)
  }, [])

  // === Permission Information (Memoized) ===
  const userPermissions = useMemo(() => {
    if (!safeProfile) return []
    return permissionService.getRolePermissions(safeProfile.role)
  }, [safeProfile])

  const roleInfo = useMemo(() => {
    if (!safeProfile) return null
    return permissionService.getRoleDisplayInfo(safeProfile.role)
  }, [safeProfile])

  const allPermissions = useMemo(() => {
    return permissionService.getAllPermissions()
  }, [])

  const permissionsByCategory = useMemo(() => {
    return permissionService.getPermissionsByCategory()
  }, [])

  return {
    // Basic Checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Generic Resource Access
    canAccessResource,
    
    // Role Checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    
    // Resource Permissions
    canViewAllProjects,
    canManageProjects,
    canViewOwnProjects,
    canManageUsers,
    canViewUsers,
    canViewAuditLogs,
    canViewAnalytics,
    canManageSettings,
    canAccessAdmin,
    
    // Ownership Checks
    canEditProject,
    canDeleteProject,
    canEditUser,
    canDeleteUser,
    canManageRole,
    
    // Async Better Auth Integration
    checkRolePermission,
    hasPermissionAsync,
    
    // Information
    userPermissions,
    roleInfo,
    allPermissions,
    permissionsByCategory,
    
    // Current user info
    currentRole: safeProfile?.role || 'guest',
    isActive: safeProfile?.isActive || false,
  }
}