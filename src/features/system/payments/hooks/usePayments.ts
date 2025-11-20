// src/features/system/payments/hooks/usePayments.ts
import { useCallback } from 'react'
import { useAuth } from '@/features/system/auth'
import { paymentsService } from '../services/PaymentsService'
import { useActiveProvider } from './useActiveProvider'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import type { CheckoutOptions } from '../types'

/**
 * Main hook for payment operations
 * 
 * This is the primary interface for components to interact with payments
 */
export function usePayments() {
  const { user } = useAuth()
  const provider = useActiveProvider()
  const toast = useToast()

  // Core data queries
  const subscription = paymentsService.useSubscription()
  const products = paymentsService.useProducts()

  // Mutations
  const createCheckoutMutation = paymentsService.useCreateCheckout()
  const trackUsageMutation = paymentsService.useTrackUsage()
  const cancelSubscriptionMutation = paymentsService.useCancelSubscription()

  // Enhanced action: Create checkout with validation and error handling
  const createCheckout = useCallback(
    async (options: CheckoutOptions) => {
      if (!user?.id) {
        toast.error('You must be logged in to checkout')
        return { error: 'Authentication required' }
      }

      const errors = paymentsService.validateCheckoutData(options)
      if (errors.length > 0) {
        const errorMessage = errors.join(', ')
        toast.error(errorMessage)
        return { error: errorMessage }
      }

      try {
        const result = await paymentsService.createCheckout(createCheckoutMutation, options)

        if (result.error) {
          toast.error(result.error)
          return result
        }

        if (result.url) {
          // Success - redirect will happen in component
          return result
        }

        return result
      } catch (error: any) {
        console.error('Checkout error:', error)
        const { message } = parseConvexError(error)
        toast.error(message)
        return { error: message }
      }
    },
    [user, createCheckoutMutation, toast]
  )

  // Enhanced action: Track usage with validation and error handling
  const trackUsage = useCallback(
    async (featureKey: string, quantity: number = 1) => {
      if (!user?.id) {
        console.warn('Cannot track usage: User not authenticated')
        return
      }

      const errors = paymentsService.validateFeatureKey(featureKey)
      if (errors.length > 0) {
        console.warn('Invalid feature key:', errors.join(', '))
        return
      }

      if (quantity < 0) {
        console.warn('Invalid quantity: Must be positive')
        return
      }

      try {
        await paymentsService.trackUsage(trackUsageMutation, featureKey, quantity)
      } catch (error: any) {
        console.error('Failed to track usage:', error)
        const { message } = parseConvexError(error)
        toast.error(message)
      }
    },
    [user, trackUsageMutation, toast]
  )

  // Enhanced action: Cancel subscription with confirmation
  const cancelSubscription = useCallback(
    async (immediate: boolean = false) => {
      if (!user?.id) {
        toast.error('You must be logged in to cancel subscription')
        return
      }

      if (!subscription.data) {
        toast.error('No active subscription to cancel')
        return
      }

      try {
        await paymentsService.cancelSubscription(cancelSubscriptionMutation, immediate)
        toast.success('Subscription cancelled successfully')
      } catch (error: any) {
        console.error('Cancellation error:', error)
        const { message } = parseConvexError(error)
        toast.error(message)
      }
    },
    [user, subscription.data, cancelSubscriptionMutation, toast]
  )

  // Open billing portal (provider-specific implementation)
  const openBillingPortal = useCallback(async () => {
    if (!user?.id) {
      toast.error('You must be logged in to access billing portal')
      return
    }

    toast.info('Use BillingPortalButton component for this action')
  }, [user, toast])

  const isLoading = subscription.isLoading || products.isLoading
  const isUpdating =
    createCheckoutMutation.isPending ||
    trackUsageMutation.isPending ||
    cancelSubscriptionMutation.isPending

  return {
    // Provider info
    provider,

    // Data
    subscription: subscription.data,
    products: products.data,
    isLoading,
    error: subscription.error,

    // Actions (enhanced with validation and error handling)
    createCheckout,
    trackUsage,
    cancelSubscription,
    openBillingPortal,

    // Loading states
    isUpdating,
    isCreatingCheckout: createCheckoutMutation.isPending,
    isTrackingUsage: trackUsageMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,

    // Raw mutation objects (for advanced usage)
    mutations: {
      createCheckout: createCheckoutMutation,
      trackUsage: trackUsageMutation,
      cancelSubscription: cancelSubscriptionMutation,
    },

    // Utility functions
    formatPrice: paymentsService.formatPrice,
    calculateSubscriptionHealth: paymentsService.calculateSubscriptionHealth,
    getDaysUntilRenewal: paymentsService.getDaysUntilRenewal,
  }
}
