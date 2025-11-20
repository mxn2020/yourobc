// src/routes/api/payments/stripe/create-payment.ts

/**
 * API Route: Create One-Time Payment Checkout
 *
 * POST /api/payments/stripe/create-payment
 * Creates a Stripe checkout session for a one-time payment
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeService } from '@/features/system/payments/providers/stripe/services/StripeService';
import { auth } from '@/features/system/auth/lib/auth-config';

export const Route = createFileRoute('/api/payments/stripe/create-payment')({
  server: {
    handlers: {
      POST: handleCreatePayment,
    },
  },
})

async function handleCreatePayment({ request }: { request: Request }) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      amount,
      currency,
      description,
      customerId,
      email,
      name,
      successUrl,
      cancelUrl,
      metadata,
    } = body

    if (!amount) {
      return Response.json({ error: 'Missing required field: amount' }, { status: 400 })
    }

    if (!successUrl || !cancelUrl) {
      return Response.json(
        { error: 'Missing required fields: successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // Create one-time payment checkout session
    const result = await stripeService.createOneTimePaymentCheckout({
      amount,
      currency: currency || 'usd',
      description,
      customerId,
      email: email || session.user.email,
      name: name || session.user.name,
      successUrl,
      cancelUrl,
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
    console.error('Error creating payment checkout:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
