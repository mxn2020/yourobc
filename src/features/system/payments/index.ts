// src/features/system/payments/index.ts
/**
 * Payments Feature - Main Exports
 * 
 * Modular payment system supporting multiple providers
 */

// === Services ===
export { PaymentsService, paymentsService } from './services/PaymentsService'

// === Types ===
export * from './types'

// === Configuration ===
export { PAYMENT_CONFIG, getPaymentConfig } from './config/payment-config'
export { DEFAULT_PLANS, getPlanById, formatPrice } from './config/plans-config'

// === Main Hooks ===
export { usePayments } from './hooks/usePayments'
export { useSubscription } from './hooks/useSubscription'
export { useFeatureAccess } from './hooks/useFeatureAccess'
export { useUsageTracking } from './hooks/useUsageTracking'

// === Utility Hooks ===
export {
  useActiveProvider,
  useEnabledProviders,
  useIsProviderEnabled,
} from './hooks'

// === Shared Components (provider-agnostic) ===
export {
  PricingCard,
  PricingPlans,
  FeatureGate,
  UpgradePrompt,
  UsageIndicator,
} from './shared/components'

// === Pages ===
export { PricingPage } from './pages/PricingPage'
export { BillingPage } from './pages/BillingPage'

// === Provider-Specific Exports ===
// Only export these if users need provider-specific functionality
export * as AutumnBetterAuth from './providers/autumn-betterauth'
export * as AutumnConvex from './providers/autumn-convex'
export * as Stripe from './providers/stripe'
export * as StripeConnect from './providers/stripe-connect'

// === Provider Configs (for setup) ===
export { autumnBetterAuthConfig } from './providers/autumn-betterauth/config/autumn-plugin'
export { AUTUMN_CONVEX_SETUP_DOCS } from './providers/autumn-convex/config/autumn-setup'