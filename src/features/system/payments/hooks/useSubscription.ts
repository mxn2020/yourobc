// src/features/boilerplate/payments/hooks/useSubscription.ts
import { paymentsService } from '../services/PaymentsService'
import { useAuth } from '@/features/boilerplate/auth'

/**
 * Hook to get subscription data
 */
export function useSubscription() {
  const { user } = useAuth()
  const { data, isLoading, error } = paymentsService.useSubscription()

  if (!user?.id) {
    return {
      subscription: null,
      isLoading: false,
      error: new Error('User not authenticated'),
    }
  }

  return {
    subscription: data,
    isLoading,
    error,
    health: data ? paymentsService.calculateSubscriptionHealth(data) : null,
    daysUntilRenewal: data ? paymentsService.getDaysUntilRenewal(data) : null,
    isAboutToRenew: data ? paymentsService.isAboutToRenew(data) : false,
  }
}