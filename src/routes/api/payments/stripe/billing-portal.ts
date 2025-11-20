// src/routes/api/payments/stripe/billing-portal.ts

/**
 * API Route: Create Billing Portal Session
 *
 * POST /api/payments/stripe/billing-portal
 * Creates a Stripe billing portal session
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeService } from '@/features/system/payments/providers/stripe/services/StripeService';
import { auth } from '@/features/system/auth/lib/auth-config';

export const Route = createFileRoute('/api/payments/stripe/billing-portal')({
  server: {
    handlers: {
      POST: handleCreateBillingPortal,
    },
  },
})

async function handleCreateBillingPortal({ request }: { request: Request }) {
  try {
    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { customerId, returnUrl } = body

    if (!customerId) {
      return Response.json({ error: 'Missing required field: customerId' }, { status: 400 })
    }

    // Create billing portal session
    const result = await stripeService.createBillingPortalSession({
      customerId,
      returnUrl: returnUrl || request.headers.get('referer') || '/',
    })

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 })
    }

    return Response.json({
      success: true,
      url: result.url,
    })
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
