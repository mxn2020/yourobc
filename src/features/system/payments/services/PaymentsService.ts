// src/features/system/payments/services/PaymentsService.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { useActiveProvider } from '../hooks/useActiveProvider'
import { 
  useAutumnCustomer, 
  useAutumnCheckout, 
  useAutumnFeatureAccess, 
  useAutumnUsage 
} from '../providers/autumn-betterauth/hooks'
import {
  useAutumnConvexCustomer,
  useAutumnConvexCheckout,
  useAutumnConvexFeatureAccess,
  useAutumnConvexUsage,
} from '../providers/autumn-convex/hooks'
import type {
  Subscription,
  FeatureAccess,
  UsageStats,
  CheckoutOptions,
  CheckoutResult,
  PaymentProviderType,
} from '../types'

export class PaymentsService {
  // ============================================================================
  // Query Hooks - Data Fetching
  // ============================================================================

  /**
   * Get current subscription for the user
   */
  useSubscription() {
    const provider = useActiveProvider()
    
    // Autumn Better Auth
    const autumnCustomer = useAutumnCustomer()
    
    // Autumn Convex
    const autumnConvexCustomer = useAutumnConvexCustomer()

    if (provider === 'autumn-betterauth') {
      return {
        data: autumnCustomer.subscription,
        isLoading: autumnCustomer.isLoading,
        error: null,
      }
    }

    if (provider === 'autumn-convex') {
      return {
        data: autumnConvexCustomer.subscription,
        isLoading: autumnConvexCustomer.isLoading,
        error: autumnConvexCustomer.error,
      }
    }

    return {
      data: null,
      isLoading: false,
      error: new Error('No payment provider configured'),
    }
  }

  /**
   * Get all products/subscriptions for the user
   */
  useProducts() {
    const provider = useActiveProvider()
    const autumnCustomer = useAutumnCustomer()

    if (provider === 'autumn-betterauth') {
      return {
        data: autumnCustomer.products || [],
        isLoading: autumnCustomer.isLoading,
        error: null,
      }
    }

    return {
      data: [],
      isLoading: false,
      error: null,
    }
  }

  /**
   * Check feature access for a specific feature
   */
  useFeatureAccess(featureKey: string) {
    const provider = useActiveProvider()
    
    const autumnAccess = useAutumnFeatureAccess(featureKey)
    const autumnConvexAccess = useAutumnConvexFeatureAccess(featureKey)

    if (provider === 'autumn-betterauth') {
      return autumnAccess
    }

    if (provider === 'autumn-convex') {
      return autumnConvexAccess
    }

    return {
      hasAccess: false,
      reason: 'No payment provider configured',
      isLoading: false,
    }
  }

  /**
   * Get usage statistics for a single feature
   * @param featureKey - The feature to get stats for
   * @returns Usage stats with type-safe UsageStats return type
   */
  useSingleFeatureUsage(featureKey: string) {
    const provider = useActiveProvider()

    const autumnUsage = useAutumnUsage()
    const autumnConvexUsage = useAutumnConvexUsage(featureKey)

    if (provider === 'autumn-betterauth') {
      return {
        data: autumnUsage.getSingleFeatureUsage(featureKey),
        isLoading: false,
      }
    }

    if (provider === 'autumn-convex') {
      return {
        data: autumnConvexUsage.getSingleFeatureUsage(featureKey),
        isLoading: autumnConvexUsage.isLoading,
      }
    }

    return {
      data: {
        featureKey,
        currentUsage: 0,
        limit: undefined,
        remaining: undefined,
      } as UsageStats,
      isLoading: false,
    }
  }

  /**
   * Get usage statistics for all features
   * @returns All features' usage stats with type-safe Record<string, UsageStats> return type
   */
  useAllFeatureUsage() {
    const provider = useActiveProvider()

    const autumnUsage = useAutumnUsage()
    const autumnConvexUsage = useAutumnConvexUsage()

    if (provider === 'autumn-betterauth') {
      return {
        data: autumnUsage.getAllFeatureUsage(),
        isLoading: false,
      }
    }

    if (provider === 'autumn-convex') {
      return {
        data: autumnConvexUsage.getAllFeatureUsage(),
        isLoading: autumnConvexUsage.isLoading,
      }
    }

    return {
      data: {} as Record<string, UsageStats>,
      isLoading: false,
    }
  }

  // ============================================================================
  // Mutation Hooks - Data Modification
  // ============================================================================

  /**
   * Create checkout session
   */
  useCreateCheckout() {
    const provider = useActiveProvider()
    const autumnCheckout = useAutumnCheckout()
    const autumnConvexCheckout = useAutumnConvexCheckout()

    return useMutation({
      mutationFn: async (options: CheckoutOptions): Promise<CheckoutResult> => {
        if (provider === 'autumn-betterauth') {
          return await autumnCheckout.createCheckout(options)
        }

        if (provider === 'autumn-convex') {
          return await autumnConvexCheckout.createCheckout(options)
        }

        return {
          error: `Provider ${provider} not implemented`,
        }
      },
      onError: () => {
        // Intentionally empty - let components handle errors
      },
    })
  }

  /**
   * Track feature usage
   */
  useTrackUsage() {
    const provider = useActiveProvider()
    const autumnUsage = useAutumnUsage()
    const autumnConvexUsage = useAutumnConvexUsage()

    return useMutation({
      mutationFn: async ({ featureKey, quantity }: { featureKey: string; quantity: number }) => {
        if (provider === 'autumn-betterauth') {
          return await autumnUsage.trackUsage(featureKey, quantity)
        }

        if (provider === 'autumn-convex') {
          return await autumnConvexUsage.trackUsage(featureKey, quantity)
        }

        throw new Error(`Provider ${provider} not implemented`)
      },
      onError: () => {
        // Intentionally empty - let components handle errors
      },
    })
  }

  /**
   * Cancel subscription
   */
  useCancelSubscription() {
    const provider = useActiveProvider()

    return useMutation({
      mutationFn: async (immediate: boolean = false) => {
        if (provider === 'autumn-betterauth') {
          // Implement Autumn cancellation
          throw new Error('Use BillingPortalButton for cancellation')
        }

        if (provider === 'autumn-convex') {
          // Implement Convex cancellation
          throw new Error('Use BillingPortalButton for cancellation')
        }

        throw new Error(`Provider ${provider} not implemented`)
      },
      onError: () => {
        // Intentionally empty - let components handle errors
      },
    })
  }

  // ============================================================================
  // Business Operations - Using Mutations
  // ============================================================================

  /**
   * Create a checkout session with validation
   */
  async createCheckout(
    mutation: ReturnType<typeof this.useCreateCheckout>,
    options: CheckoutOptions
  ): Promise<CheckoutResult> {
    const errors = this.validateCheckoutData(options)
    if (errors.length > 0) {
      return {
        error: `Validation failed: ${errors.join(', ')}`,
      }
    }

    try {
      return await mutation.mutateAsync(options)
    } catch (error: any) {
      return {
        error: error.message || 'Failed to create checkout',
      }
    }
  }

  /**
   * Track usage with validation
   */
  async trackUsage(
    mutation: ReturnType<typeof this.useTrackUsage>,
    featureKey: string,
    quantity: number = 1
  ): Promise<void> {
    if (quantity < 0) {
      throw new Error('Quantity must be positive')
    }

    if (!featureKey || featureKey.trim() === '') {
      throw new Error('Feature key is required')
    }

    try {
      await mutation.mutateAsync({ featureKey, quantity })
    } catch (error: any) {
      throw new Error(`Failed to track usage: ${error.message}`)
    }
  }

  /**
   * Cancel subscription with confirmation
   */
  async cancelSubscription(
    mutation: ReturnType<typeof this.useCancelSubscription>,
    immediate: boolean = false
  ): Promise<void> {
    try {
      await mutation.mutateAsync(immediate)
    } catch (error: any) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }
  }

  // ============================================================================
  // Utility Functions
  // ============================================================================

  /**
   * Validate checkout data
   */
  validateCheckoutData(data: CheckoutOptions): string[] {
    const errors: string[] = []

    if (!data.planId || data.planId.trim() === '') {
      errors.push('Plan ID is required')
    }

    if (data.trialDays !== undefined && data.trialDays < 0) {
      errors.push('Trial days cannot be negative')
    }

    if (data.successUrl && !this.isValidUrl(data.successUrl)) {
      errors.push('Success URL must be a valid URL')
    }

    if (data.cancelUrl && !this.isValidUrl(data.cancelUrl)) {
      errors.push('Cancel URL must be a valid URL')
    }

    return errors
  }

  /**
   * Validate feature key
   */
  validateFeatureKey(featureKey: string): string[] {
    const errors: string[] = []

    if (!featureKey || featureKey.trim() === '') {
      errors.push('Feature key is required')
    }

    if (featureKey.length > 100) {
      errors.push('Feature key must be less than 100 characters')
    }

    return errors
  }

  /**
   * Format price for display
   */
  formatPrice(priceInCents: number, currency: string = 'USD'): string {
    const price = priceInCents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price)
  }

  /**
   * Calculate subscription health
   */
  calculateSubscriptionHealth(subscription: Subscription): {
    health: 'excellent' | 'good' | 'warning' | 'critical'
    score: number
  } {
    let score = 100

    // Status penalties
    if (subscription.status === 'past_due') score -= 40
    if (subscription.status === 'cancelled') score -= 60
    if (subscription.status === 'unpaid') score -= 50
    if (subscription.status === 'inactive') score -= 30

    // Status bonuses
    if (subscription.status === 'active') score += 10
    if (subscription.status === 'trialing') score += 5

    // Period end evaluation
    if (subscription.currentPeriodEnd && subscription.status === 'active') {
      const now = Date.now()
      const daysUntilRenewal = (subscription.currentPeriodEnd - now) / (1000 * 60 * 60 * 24)

      if (daysUntilRenewal < 3) score -= 10 // Renewal soon
      else if (daysUntilRenewal > 20) score += 5 // Plenty of time
    }

    // Cancel at period end
    if (subscription.cancelAtPeriodEnd) {
      score -= 30
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score))

    let health: 'excellent' | 'good' | 'warning' | 'critical'
    if (score >= 80) health = 'excellent'
    else if (score >= 60) health = 'good'
    else if (score >= 40) health = 'warning'
    else health = 'critical'

    return { health, score }
  }

  /**
   * Check if user has access to feature
   */
  hasFeatureAccess(featureAccess: FeatureAccess): boolean {
    return featureAccess.hasAccess
  }

  /**
   * Get usage percentage
   */
  getUsagePercentage(stats: UsageStats): number {
    if (!stats.limit) return 0
    return Math.round((stats.currentUsage / stats.limit) * 100)
  }

  /**
   * Check if usage is near limit
   */
  isNearUsageLimit(stats: UsageStats, threshold: number = 80): boolean {
    const percentage = this.getUsagePercentage(stats)
    return percentage >= threshold
  }

  /**
   * Check if usage limit is exceeded
   */
  isUsageLimitExceeded(stats: UsageStats): boolean {
    if (!stats.limit) return false
    return stats.currentUsage >= stats.limit
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      unpaid: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Get plan type color for UI
   */
  getPlanTypeColor(planType: string): string {
    const colors: Record<string, string> = {
      free: 'bg-gray-100 text-gray-800',
      paid: 'bg-blue-100 text-blue-800',
    }
    return colors[planType] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: PaymentProviderType): boolean {
    // This would check environment variables or config
    // For now, just return true if provider exists
    return ['autumn-betterauth', 'autumn-convex', 'stripe-standard', 'stripe-connect'].includes(
      provider
    )
  }

  /**
   * Validate URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Format subscription name for display
   */
  formatSubscriptionName(subscription: Subscription): string {
    return subscription.planName || `Plan ${subscription.planId}`
  }

  /**
   * Get days until renewal
   */
  getDaysUntilRenewal(subscription: Subscription): number | null {
    if (!subscription.currentPeriodEnd) return null
    return Math.ceil((subscription.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24))
  }

  /**
   * Check if subscription is about to renew
   */
  isAboutToRenew(subscription: Subscription, daysThreshold: number = 7): boolean {
    const days = this.getDaysUntilRenewal(subscription)
    return days !== null && days <= daysThreshold && days > 0
  }

  /**
   * Get feature access summary
   */
  getFeatureAccessSummary(featureAccess: FeatureAccess): string {
    if (featureAccess.hasAccess) {
      if (featureAccess.remaining !== undefined && featureAccess.limit !== undefined) {
        return `${featureAccess.remaining} of ${featureAccess.limit} remaining`
      }
      return 'Access granted'
    }
    return featureAccess.reason || 'Access denied'
  }
}

export const paymentsService = new PaymentsService()
