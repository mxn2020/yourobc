// src/routes/api/payments/stripe/cancel-subscription.ts

/**
 * API Route: Cancel Subscription
 *
 * POST /api/payments/stripe/cancel-subscription
 * Cancels a Stripe subscription
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeService } from '@/features/boilerplate/payments/providers/stripe/services/StripeService';
import { auth } from '@/features/boilerplate/auth/lib/auth-config';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const Route = createFileRoute('/api/payments/stripe/cancel-subscription')({
  server: {
    handlers: {
      POST: handleCancelSubscription,
    },
  },
})

async function handleCancelSubscription({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { subscriptionId, cancelImmediately } = body

    if (!subscriptionId) {
      return Response.json({ error: 'Missing required field: subscriptionId' }, { status: 400 })
    }

    // Cancel subscription with Stripe
    const subscription = await stripeService.cancelSubscription(
      subscriptionId,
      !cancelImmediately
    )

    // Update subscription in Convex
    await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.updateSubscriptionStatus, {
      stripeSubscriptionId: subscriptionId,
      status: subscription.status as any,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? subscription.canceled_at * 1000 : undefined,
    })

    return Response.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
