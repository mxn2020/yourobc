// src/features/system/auth/hooks/useAuth.ts

import { useMemo } from 'react'
import { useAuthentication } from './useAuthentication'
import { useProfile } from './useProfile'
import { useUserSettings } from './useUserSettings'
import { usePermissions } from './usePermissions'
import { AuthUser, UnifiedUser } from '../types/auth.types'
import { useConvexAuth } from '@/routes/__root'

/**
 * Main authentication hook - optimized to prevent unnecessary queries
 * Only fetches profile/settings when user is authenticated
 */
export function useAuth() {
  const authentication = useAuthentication()
  const { isConvexAuthReady } = useConvexAuth()

  // Only enable profile/settings queries if authenticated
  const shouldFetchData = authentication.isAuthenticated && !!authentication.user?.id

  // Conditional hook calls with enabled flag
  const profile = useProfile(shouldFetchData)
  const settings = useUserSettings(shouldFetchData)
  const permissions = usePermissions(profile.profile)

  // Unified user object
  const unifiedUser: UnifiedUser = useMemo(() => ({
    auth: authentication.user as AuthUser,
    profile: profile.profile,
    settings: settings.settings,
    isAuthLoading: authentication.isAuthLoading,
    isProfileLoading: profile.isLoading,
    isSettingsLoading: settings.isLoading,
    isReady: authentication.isReady && !profile.isLoading && !settings.isLoading && isConvexAuthReady,
    isAuthenticated: authentication.isAuthenticated,
    hasCompleteProfile: profile.hasCompleteProfile,
  }), [authentication, profile, settings, isConvexAuthReady])

  // Return early for unauthenticated users with default state
  if (!shouldFetchData) {
    return {
      // Unified User Data
      ...unifiedUser,
      
      // Authentication
      user: null,
      session: null,
      signOut: authentication.signOut,
      
      // Permissions (all false for unauthenticated)
      canManageUsers: false,
      canAccessAdmin: false,
      canManageSettings: false,
      canViewAuditLogs: false,
      canViewAnalytics: false,
      hasPermission: () => false,
      canEdit: false,
      canDelete: false,
      canManage: false,
      isAdmin: false,
      isModerator: false,

      // Profile Management
      profileStats: null,
      isLoading: false,
      error: null,

      // Mutations (throw errors for unauthenticated)
      mutations: {
        updateProfile: async () => { throw new Error('Not authenticated') },
        updateActivity: async () => {},
        updateSettings: async () => { throw new Error('Not authenticated') },
        resetSettings: async () => { throw new Error('Not authenticated') },
        updateModelPreferences: async () => { throw new Error('Not authenticated') },
        setDefaultModel: async () => { throw new Error('Not authenticated') },
        toggleFavoriteModel: async () => { throw new Error('Not authenticated') },
        clearDefaultModel: async () => { throw new Error('Not authenticated') },
      }
    }
  }

  // Return full authenticated state
  return {
    // Unified User Data
    ...unifiedUser,
    
    // Authentication
    ...authentication,
    
    // Profile Management
    ...profile,
    
    // User Settings
    ...settings,
    
    // Permissions
    ...permissions,
    
    // Organized Mutations
    mutations: {
      // Profile mutations
      updateProfile: profile.mutations.updateProfile,
      updateActivity: profile.mutations.updateActivity,

      // Settings mutations
      updateSettings: settings.mutations.updateSettings,
      resetSettings: settings.mutations.resetSettings,
      updateModelPreferences: settings.mutations.updateModelPreferences,
      setDefaultModel: settings.mutations.setDefaultModel,
      toggleFavoriteModel: settings.mutations.toggleFavoriteModel,
      clearDefaultModel: settings.mutations.clearDefaultModel,
    }
  }
}

// === Specialized Hooks ===

export function useAuthOnly() {
  return useAuthentication()
}

export function useProfileOnly() {
  const auth = useAuthentication()
  return useProfile(auth.isAuthenticated)
}

export function useSettingsOnly() {
  const auth = useAuthentication()
  return useUserSettings(auth.isAuthenticated)
}

export function usePermissionsOnly(profile: Parameters<typeof usePermissions>[0]) {
  return usePermissions(profile)
}

export function useAuthStatus() {
  const { user, isAuthenticated, isAuthLoading, isReady } = useAuthentication()
  const { isConvexAuthReady } = useConvexAuth()

  return {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
    isReady: isReady && isConvexAuthReady,
  }
}

export function useCurrentUser() {
  const { user } = useAuthentication()
  const profile = useProfile(!!user?.id)

  return {
    user,
    profile: profile.profile,
    profileStats: profile.profileStats,
    isLoading: profile.isLoading,
    error: profile.error,
  }
}