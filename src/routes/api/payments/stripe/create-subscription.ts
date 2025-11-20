// src/routes/api/payments/stripe/create-subscription.ts

/**
 * API Route: Create Subscription Checkout
 *
 * POST /api/payments/stripe/create-subscription
 * Creates a Stripe checkout session for a subscription
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeService } from '@/features/boilerplate/payments/providers/stripe/services/StripeService';
import { auth } from '@/features/boilerplate/auth/lib/auth-config';

export const Route = createFileRoute('/api/payments/stripe/create-subscription')({
  server: {
    handlers: {
      POST: handleCreateSubscription,
    },
  },
})

async function handleCreateSubscription({ request }: { request: Request }) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      priceId,
      customerId,
      email,
      name,
      successUrl,
      cancelUrl,
      trialPeriodDays,
      metadata,
    } = body

    if (!priceId) {
      return Response.json({ error: 'Missing required field: priceId' }, { status: 400 })
    }

    if (!successUrl || !cancelUrl) {
      return Response.json(
        { error: 'Missing required fields: successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // Create subscription checkout session
    const result = await stripeService.createSubscriptionCheckout({
      priceId,
      customerId,
      email: email || session.user.email,
      name: name || session.user.name,
      successUrl,
      cancelUrl,
      trialPeriodDays,
      metadata: {
        ...metadata,
        userId: session.user.id,
      },
    })

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({
      success: true,
      sessionId: result.sessionId,
      url: result.url,
    })
  } catch (error) {
    console.error('Error creating subscription checkout:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
