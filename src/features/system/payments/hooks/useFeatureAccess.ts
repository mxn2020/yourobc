// src/features/system/payments/hooks/useFeatureAccess.ts
import { paymentsService } from '../services/PaymentsService'
import { useAuth } from '@/features/system/auth'

/**
 * Hook to check feature access
 */
export function useFeatureAccess(featureKey: string) {
  const { user } = useAuth()
  const featureAccess = paymentsService.useFeatureAccess(featureKey)

  if (!user?.id) {
    return {
      hasAccess: false,
      reason: 'User not authenticated',
      isLoading: false,
      currentUsage: 0,
      limit: undefined,
      remaining: undefined,
    }
  }

  return {
    ...featureAccess,
    summary: paymentsService.getFeatureAccessSummary(featureAccess),
  }
}