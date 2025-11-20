// src/features/admin/hooks/useAdmin.ts
import { useMemo } from 'react'
import { useAuth } from '@/features/system/auth'
import { useUserManagement } from './useUserManagement'
import { useAppSettingsManagement } from './useAppSettingsManagement'
import { useAnalyticsAudit } from './useAnalyticsAudit'

/**
 * Main admin hook - combines all admin functionality
 * This is the primary hook that should be used for admin operations
 * Requires admin permissions to access
 */
export function useAdmin() {
  const { profile, canAccessAdmin } = useAuth()

  if (!profile || !canAccessAdmin) {
    throw new Error('Admin access required')
  }

  const userManagement = useUserManagement()
  const appSettings = useAppSettingsManagement()
  const analytics = useAnalyticsAudit()

  // === Admin Dashboard Data ===
  const dashboardData = useMemo(() => {
    return {
      userStats: userManagement.userStats,
      settingsStats: appSettings.settingsStats,
      auditStats: analytics.auditStats,
      formattedStats: analytics.dashboardStats,
    }
  }, [userManagement.userStats, appSettings.settingsStats, analytics.auditStats, analytics.dashboardStats])

  // === Loading States ===
  const isLoading = useMemo(() => {
    return (
      userManagement.isLoadingUsers ||
      userManagement.isLoadingStats ||
      appSettings.isLoading ||
      analytics.isLoading
    )
  }, [
    userManagement.isLoadingUsers,
    userManagement.isLoadingStats,
    appSettings.isLoading,
    analytics.isLoading,
  ])

  const isUpdating = useMemo(() => {
    return userManagement.isUpdating || appSettings.isUpdating
  }, [userManagement.isUpdating, appSettings.isUpdating])

  return {
    // === Admin Profile Info ===
    adminProfile: profile,
    canAccessAdmin,

    // === Dashboard Data ===
    dashboardData,
    isLoading,
    isUpdating,

    // === User Management ===
    userManagement,

    // === App Settings Management ===
    appSettings,

    // === Analytics & Audit ===
    analytics,

    // === Quick Access to Common Operations ===
    // User operations
    createUser: userManagement.createUser,
    updateUserRole: userManagement.updateUserRole,
    banUser: userManagement.banUser,
    unbanUser: userManagement.unbanUser,
    impersonateUser: userManagement.impersonateUser,
    stopImpersonating: userManagement.stopImpersonating,
    
    // Settings operations
    updateSetting: appSettings.updateSetting,
    updateAISettings: appSettings.updateAISettings,
    updateGeneralSettings: appSettings.updateGeneralSettings,
    testAIConnection: appSettings.testAIConnection,
    
    // Analytics operations
    generateUserAnalytics: analytics.generateUserAnalytics,
    exportAuditLogs: analytics.exportAuditLogs,
    exportUserAnalytics: analytics.exportUserAnalytics,
    downloadExport: analytics.downloadExport,
  }
}

// === Specialized Admin Hooks (for when you only need specific functionality) ===

/**
 * Hook for user management operations only
 */
export function useUserManagementOnly() {
  const { profile, canManageUsers } = useAuth()
  
  if (!profile || !canManageUsers) {
    throw new Error('User management permission required')
  }

  return useUserManagement()
}

/**
 * Hook for app settings management only
 */
export function useAppSettingsOnly() {
  const { profile, canManageSettings } = useAuth()
  
  if (!profile || !canManageSettings) {
    throw new Error('Settings management permission required')
  }

  return useAppSettingsManagement()
}

/**
 * Hook for analytics and audit logs only
 */
export function useAnalyticsOnly() {
  const { profile, canViewAuditLogs, canViewAnalytics } = useAuth()
  
  if (!profile || (!canViewAuditLogs && !canViewAnalytics)) {
    throw new Error('Analytics or audit log permission required')
  }

  return useAnalyticsAudit()
}

/**
 * Hook for admin dashboard statistics only
 */
export function useAdminDashboard() {
  const { profile, canAccessAdmin } = useAuth()

  if (!profile || !canAccessAdmin) {
    throw new Error('Admin access required')
  }

  const userManagement = useUserManagement()
  const appSettings = useAppSettingsManagement()
  const analytics = useAnalyticsAudit()

  const dashboardStats = useMemo(() => {
    const rawStats = userManagement.userStats
    if (!rawStats) return null

    return analytics.formatStatsForDisplay(
      analytics.formatAdminStats(rawStats)
    )
  }, [userManagement.userStats, analytics])

  const isLoading = useMemo(() => {
    return (
      userManagement.isLoadingStats ||
      appSettings.isLoading ||
      analytics.isLoadingProfileStats
    )
  }, [userManagement.isLoadingStats, appSettings.isLoading, analytics.isLoadingProfileStats])

  return {
    stats: dashboardStats,
    rawStats: userManagement.userStats,
    settingsStats: appSettings.settingsStats,
    auditStats: analytics.auditStats,
    isLoading,
    error: userManagement.error,
  }
}

/**
 * Hook for checking admin permissions
 */
export function useAdminPermissions() {
  const { profile, canAccessAdmin, canManageUsers, canManageSettings, canViewAuditLogs, canViewAnalytics } = useAuth()
  
  return {
    isAdmin: !!profile && canAccessAdmin,
    canAccessAdmin,
    canManageUsers,
    canManageSettings,
    canViewAuditLogs,
    canViewAnalytics,
    adminProfile: profile,
    role: profile?.role || 'guest',
  }
}