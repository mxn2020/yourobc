// src/features/system/payments/hooks/useUsageTracking.ts
import { useCallback } from 'react'
import { paymentsService } from '../services/PaymentsService'
import { useAuth } from '@/features/system/auth'
import type { UsageStats } from '../types'

/**
 * Hook for usage tracking and statistics
 *
 * Provides type-safe methods to get usage stats for features:
 * - getSingleFeatureUsage(key) - Get stats for a specific feature
 * - getAllFeatureUsage() - Get stats for all features
 */
export function useUsageTracking(featureKey?: string) {
  const { user } = useAuth()

  // Fetch all feature usage data or single feature data based on parameter
  const { data: singleFeatureData, isLoading: singleLoading } = featureKey
    ? paymentsService.useSingleFeatureUsage(featureKey)
    : { data: null, isLoading: false }

  const { data: allFeaturesData, isLoading: allLoading } = !featureKey
    ? paymentsService.useAllFeatureUsage()
    : { data: null, isLoading: false }

  const trackUsageMutation = paymentsService.useTrackUsage()

  const trackUsage = useCallback(
    async (key: string, quantity: number = 1) => {
      if (!user?.id) {
        console.warn('Cannot track usage: User not authenticated')
        return
      }

      try {
        await paymentsService.trackUsage(trackUsageMutation, key, quantity)
      } catch (error) {
        console.error('Failed to track usage:', error)
        throw error
      }
    },
    [user, trackUsageMutation]
  )

  /**
   * Get usage stats for a single feature (type-safe)
   * @param key - The feature key
   * @returns UsageStats for the feature or null if not found
   */
  const getSingleFeatureUsage = useCallback(
    (key: string): UsageStats | null => {
      // If we have single feature data and it matches the key
      if (singleFeatureData && singleFeatureData.featureKey === key) {
        return singleFeatureData
      }

      // If we have all features data, extract the specific feature
      if (allFeaturesData && allFeaturesData[key]) {
        return allFeaturesData[key]
      }

      return null
    },
    [singleFeatureData, allFeaturesData]
  )

  /**
   * Get usage stats for all features (type-safe)
   * @returns Record of all features with their usage stats or null
   */
  const getAllFeatureUsage = useCallback(
    (): Record<string, UsageStats> | null => {
      return allFeaturesData || null
    },
    [allFeaturesData]
  )

  const getUsagePercentage = useCallback(
    (key?: string) => {
      const stats = key ? getSingleFeatureUsage(key) : singleFeatureData
      if (!stats) return 0
      return paymentsService.getUsagePercentage(stats)
    },
    [getSingleFeatureUsage, singleFeatureData]
  )

  const isNearLimit = useCallback(
    (key?: string, threshold: number = 80) => {
      const stats = key ? getSingleFeatureUsage(key) : singleFeatureData
      if (!stats) return false
      return paymentsService.isNearUsageLimit(stats, threshold)
    },
    [getSingleFeatureUsage, singleFeatureData]
  )

  const isLimitExceeded = useCallback(
    (key?: string) => {
      const stats = key ? getSingleFeatureUsage(key) : singleFeatureData
      if (!stats) return false
      return paymentsService.isUsageLimitExceeded(stats)
    },
    [getSingleFeatureUsage, singleFeatureData]
  )

  return {
    usageData: singleFeatureData || allFeaturesData,
    isLoading: singleLoading || allLoading,
    trackUsage,
    getSingleFeatureUsage,
    getAllFeatureUsage,
    getUsagePercentage,
    isNearLimit,
    isLimitExceeded,
  }
}