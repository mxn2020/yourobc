// src/routes/api/payments/stripe-connect/onboarding-link.ts

/**
 * API Route: Create Stripe Connect Onboarding Link
 *
 * POST /api/payments/stripe-connect/onboarding-link
 * Generates an onboarding link for a Stripe Connect Express account
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { stripeConnectService } from '@/features/system/payments/providers/stripe-connect/services/StripeConnectService'
import { auth } from '@/features/system/auth/lib/auth-config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/api/payments/stripe-connect/onboarding-link')({
  server: {
    handlers: {
      POST: handleCreateOnboardingLink,
    },
  },
})

async function handleCreateOnboardingLink({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { accountId, refreshUrl, returnUrl } = body

    if (!accountId || !refreshUrl || !returnUrl) {
      return json(
        { error: 'Missing required fields: accountId, refreshUrl, returnUrl' },
        { status: 400 }
      )
    }

    // Get account from Convex
    const account = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccount,
      {
        accountId: accountId as Id<'connectedAccounts'>,
      }
    )

    if (!account) {
      return json({ error: 'Account not found' }, { status: 404 })
    }

    // Create onboarding link
    const stripe = stripeConnectService()
    const accountLink = await stripe.createOnboardingLink({
      accountId: account.stripeAccountId,
      refreshUrl,
      returnUrl,
    })

    // Update Convex with link
    await convex.mutation(
      api.lib.system.payments.stripe_connect.mutations.updateOnboardingLink,
      {
        accountId: accountId as Id<'connectedAccounts'>,
        onboarding_link: accountLink.url,
        onboarding_link_expires_at: accountLink.expires_at,
      }
    )

    return json({
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
    })
  } catch (error) {
    console.error('Failed to create onboarding link:', error)
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to create onboarding link',
      },
      { status: 500 }
    )
  }
}