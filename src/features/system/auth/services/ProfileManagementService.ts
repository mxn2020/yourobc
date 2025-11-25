// src/features/system/auth/services/ProfileManagementService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import {
  UserProfile,
  ProfileUpdateFormData,
  ActivityType,
  ActivityMetadata,
  createProfileError,
  PROFILE_ERROR_CODES
} from '../types/auth.types'

/**
 * Profile management service - handles user profile operations
 * Optimized with conditional query execution
 */
class ProfileManagementService {
  
  // === Profile Queries ===
  useCurrentUserProfile(enabled = true) {
    return useQuery({
      ...convexQuery(api.lib.system.user.user_profiles.queries.getProfileByAuthId, {}),
      enabled, // Only run when enabled
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    })
  }

  // === Profile Mutations ===
  useUpdateProfile() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.user.user_profiles.mutations.updateProfile),
    })
  }

  useUpdateActivity() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.user.user_profiles.mutations.updateActivity),
    })
  }

  // === Profile Operations ===
  async updateProfile(
    updateMutation: ReturnType<typeof this.useUpdateProfile>,
    updates: ProfileUpdateFormData
  ): Promise<void> {
    try {
      await updateMutation.mutateAsync({ updates })
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to update profile',
        { updates, originalError: error }
      )
    }
  }

  async trackActivity(
    activityMutation: ReturnType<typeof this.useUpdateActivity>,
    activityType?: ActivityType,
    metadata?: ActivityMetadata
  ): Promise<void> {
    try {
      await activityMutation.mutateAsync({
        activityType,
        metadata,
      })
    } catch (error) {
      // Don't throw for activity tracking failures - log only
      console.warn('Failed to track activity:', error)
    }
  }

  // === Profile Utilities ===
  calculateCompletionPercentage(profile: UserProfile): number {
    let score = 0
    const maxScore = 5

    if (profile.name) score += 1
    if (profile.avatar) score += 1
    if (profile.bio) score += 1
    if (profile.isEmailVerified) score += 1
    if (profile.permissions.length > 0) score += 1

    return Math.round((score / maxScore) * 100)
  }

  getCompletionSuggestions(profile: UserProfile): string[] {
    const suggestions: string[] = []

    if (!profile.name) suggestions.push('Add your name')
    if (!profile.avatar) suggestions.push('Upload a profile picture')
    if (!profile.bio) suggestions.push('Write a brief bio')
    if (!profile.isEmailVerified) suggestions.push('Verify your email address')

    return suggestions
  }

  getKarmaLevel(karma: number): { level: string; color: string; icon: string } {
    if (karma >= 1000) return { level: 'Expert', color: 'text-purple-600', icon: '👑' }
    if (karma >= 500) return { level: 'Advanced', color: 'text-blue-600', icon: '⭐' }
    if (karma >= 100) return { level: 'Intermediate', color: 'text-green-600', icon: '🌟' }
    if (karma >= 10) return { level: 'Beginner', color: 'text-yellow-600', icon: '🔰' }
    return { level: 'Newcomer', color: 'text-gray-600', icon: '👋' }
  }

  getRoleDisplayInfo(role: string): { name: string; color: string } {
    const roleInfo = {
      superadmin: { name: 'Super Admin', color: 'text-purple-600 bg-purple-50 border-purple-200' },
      admin: { name: 'Administrator', color: 'text-red-600 bg-red-50 border-red-200' },
      moderator: { name: 'Moderator', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      editor: { name: 'Editor', color: 'text-green-600 bg-green-50 border-green-200' },
      analyst: { name: 'Analyst', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
      user: { name: 'User', color: 'text-gray-600 bg-gray-50 border-gray-200' },
      guest: { name: 'Guest', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    }
    return roleInfo[role as keyof typeof roleInfo] || roleInfo.user
  }

  generateAvatarUrl(email: string, size: number = 128): string {
    const hash = this.generateEmailHash(email)
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`
  }

  formatRelativeTime(timestamp: number): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const diff = Date.now() - timestamp
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return rtf.format(-diffInDays, 'day')
    if (diffInDays < 30) return rtf.format(-Math.floor(diffInDays / 7), 'week')
    return rtf.format(-Math.floor(diffInDays / 30), 'month')
  }

  private generateEmailHash(email: string): string {
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}

export const profileManagementService = new ProfileManagementService()