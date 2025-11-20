// src/features/admin/components/AdminGuard.tsx
import React from 'react'
import { useAdminPermissions } from '../hooks/useAdmin'
import { Loading } from '@/components/ui'
import { useTranslation } from '@/features/system/i18n'

interface AdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredRole?: 'admin' | 'superadmin' | 'moderator'
  requiredPermission?: string
}

export function AdminGuard({
  children,
  fallback,
  requiredRole,
  requiredPermission
}: AdminGuardProps) {
  const { t } = useTranslation('admin')
  const {
    isAdmin,
    canAccessAdmin,
    canManageUsers,
    canManageSettings,
    canViewAuditLogs,
    canViewAnalytics,
    adminProfile,
    role
  } = useAdminPermissions()

  // Show loading while checking auth
  if (!adminProfile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    )
  }

  // Check if user is admin
  if (!canAccessAdmin) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('guard.accessDenied.title')}</h1>
          <p className="text-gray-600">{t('guard.accessDenied.message')}</p>
        </div>
      </div>
    )
  }

  // Check specific role requirement
  if (requiredRole && role !== requiredRole) {
    // Special case: superadmin can access admin-only areas
    if (!(requiredRole === 'admin' && role === 'superadmin')) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('guard.insufficientRole.title')}</h1>
            <p className="text-gray-600">
              {t('guard.insufficientRole.message', { requiredRole, userRole: role })}
            </p>
          </div>
        </div>
      )
    }
  }

  // Check specific permission if provided
  if (requiredPermission) {
    let hasPermission = false
    
    switch (requiredPermission) {
      case 'users.manage':
        hasPermission = canManageUsers
        break
      case 'settings.manage':
        hasPermission = canManageSettings
        break
      case 'audit.view':
        hasPermission = canViewAuditLogs
        break
      case 'analytics.view':
        hasPermission = canViewAnalytics
        break
      default:
        hasPermission = true // Default to allow if permission not recognized
    }

    if (!hasPermission) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('guard.insufficientPermissions.title')}</h1>
            <p className="text-gray-600">{t('guard.insufficientPermissions.message')}</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

/**
 * Role-based guard for specific roles
 */
export function RoleGuard({
  children,
  role,
  allowHigherRoles = true,
  fallback
}: {
  children: React.ReactNode
  role: 'admin' | 'superadmin' | 'moderator' | 'editor' | 'analyst' | 'user'
  allowHigherRoles?: boolean
  fallback?: React.ReactNode
}) {
  const { t } = useTranslation('admin')
  const { adminProfile, role: userRole } = useAdminPermissions()

  if (!adminProfile) {
    return <Loading size="md" />
  }

  if (!userRole) {
    return fallback || <div>{t('guard.notAuthenticated')}</div>
  }

  // Role hierarchy for higher role checking
  const roleHierarchy = ['user', 'guest', 'analyst', 'editor', 'moderator', 'admin', 'superadmin']
  const userRoleIndex = roleHierarchy.indexOf(userRole)
  const requiredRoleIndex = roleHierarchy.indexOf(role)

  const hasAccess = allowHigherRoles 
    ? userRoleIndex >= requiredRoleIndex 
    : userRole === role

  if (!hasAccess) {
    return fallback || (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🚫</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('guard.accessRestricted.title')}</h2>
        <p className="text-gray-600">
          {t('guard.accessRestricted.message', { requiredRole: role, userRole })}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Permission-based guard using Better Auth permissions
 */
export function PermissionGuard({
  children,
  permission,
  fallback
}: {
  children: React.ReactNode
  permission: string
  fallback?: React.ReactNode
}) {
  const { t } = useTranslation('admin')
  const {
    canManageUsers,
    canManageSettings,
    canViewAuditLogs,
    canViewAnalytics,
    adminProfile
  } = useAdminPermissions()

  if (!adminProfile) {
    return <Loading size="md" />
  }

  let hasPermission = false
  
  switch (permission) {
    case 'users.manage':
      hasPermission = canManageUsers
      break
    case 'settings.manage':
      hasPermission = canManageSettings
      break
    case 'audit.view':
      hasPermission = canViewAuditLogs
      break
    case 'analytics.view':
      hasPermission = canViewAnalytics
      break
    default:
      hasPermission = true // Default to allow if permission not recognized
  }

  if (!hasPermission) {
    return fallback || (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('guard.permissionRequired.title')}</h2>
        <p className="text-gray-600">
          {t('guard.permissionRequired.message', { permission })}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Impersonation guard - shows content only when not impersonating
 */
export function ImpersonationGuard({
  children,
  showWhenImpersonating = false,
  fallback
}: {
  children: React.ReactNode
  showWhenImpersonating?: boolean
  fallback?: React.ReactNode
}) {
  const { t } = useTranslation('admin')
  // TODO: Add impersonation state from Better Auth
  const isImpersonating = false // This would come from auth context

  const shouldShow = showWhenImpersonating ? isImpersonating : !isImpersonating

  if (!shouldShow) {
    return fallback || (
      <div className="text-center py-4">
        <div className="text-2xl mb-2">👤</div>
        <p className="text-sm text-gray-600">
          {isImpersonating ?
            t('guard.impersonation.disabled') :
            t('guard.impersonation.onlyDuringImpersonation')
          }
        </p>
      </div>
    )
  }

  return <>{children}</>
}