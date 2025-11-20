// src/features/boilerplate/auth/hooks/useProfile.ts

import { useCallback, useMemo } from 'react'
import { profileManagementService } from '../services/ProfileManagementService'
import {
  ProfileUpdateFormData,
  ActivityType,
  ActivityMetadata,
} from '../types/auth.types'

/**
 * Profile management hook - handles current user profile operations
 * Optimized with conditional query execution
 */
export function useProfile(enabled = true) {
  const { data: profile, isPending: isLoading, error } = profileManagementService.useCurrentUserProfile(enabled)

  const updateProfileMutation = profileManagementService.useUpdateProfile()
  const updateActivityMutation = profileManagementService.useUpdateActivity()

  // === Profile Actions ===
  const updateProfile = useCallback(async (updates: ProfileUpdateFormData) => {
    return await profileManagementService.updateProfile(
      updateProfileMutation,
      updates
    )
  }, [updateProfileMutation])

  const trackActivity = useCallback(async (activityType?: ActivityType, metadata?: ActivityMetadata) => {
    return await profileManagementService.trackActivity(
      updateActivityMutation,
      activityType,
      metadata
    )
  }, [updateActivityMutation])

  // === Computed Profile Data ===
  const profileStats = useMemo(() => {
    if (!profile) return null
    
    return {
      completionPercentage: profileManagementService.calculateCompletionPercentage(profile),
      suggestions: profileManagementService.getCompletionSuggestions(profile),
      karmaLevel: profileManagementService.getKarmaLevel(profile.stats.karmaLevel),
      roleInfo: profileManagementService.getRoleDisplayInfo(profile.role),
      isComplete: profile.isProfileComplete,
      lastActiveFormatted: profileManagementService.formatRelativeTime(profile.lastActiveAt),
      avatarUrl: profile.avatar || profileManagementService.generateAvatarUrl(profile.email),
    }
  }, [profile])

  // === Loading States ===
  const isUpdating = updateProfileMutation.isPending || updateActivityMutation.isPending

  return {
    // Data
    profile,
    profileStats,
    isLoading,
    isUpdating,
    error,

    // Actions
    updateProfile,
    trackActivity,

    // Computed
    hasCompleteProfile: profile?.isProfileComplete || false,

    // Loading states for specific actions
    isUpdatingProfile: updateProfileMutation.isPending,
    isTrackingActivity: updateActivityMutation.isPending,

    // Raw mutations (for advanced usage)
    mutations: {
      updateProfile: updateProfileMutation,
      updateActivity: updateActivityMutation,
    }
  }
}