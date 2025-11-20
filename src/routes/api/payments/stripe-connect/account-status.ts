// src/routes/api/payments/stripe-connect/account-status.ts

/**
 * API Route: Get Stripe Connect Account Status
 *
 * GET /api/payments/stripe-connect/account-status?accountId=xxx
 * Retrieves current status and capabilities of a Stripe Connect account
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { stripeConnectService } from '@/features/boilerplate/payments/providers/stripe-connect/services/StripeConnectService'
import { auth } from '@/features/boilerplate/auth/lib/auth-config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/api/payments/stripe-connect/account-status')({
  server: {
    handlers: {
      GET: handleGetAccountStatus,
    },
  },
})

async function handleGetAccountStatus({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get accountId from query params
    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')

    if (!accountId) {
      return json({ error: 'Missing accountId query parameter' }, { status: 400 })
    }

    // Get account from Convex
    const account = await convex.query(
      api.lib.boilerplate.payments.stripe_connect.queries.getConnectedAccount,
      {
        accountId: accountId as Id<'connectedAccounts'>,
      }
    )

    if (!account) {
      return json({ error: 'Account not found' }, { status: 404 })
    }

    // Get fresh status from Stripe
    const stripe = stripeConnectService()
    const accountStatus = await stripe.getAccountStatus(account.stripeAccountId)

    // Sync status back to Convex
    await convex.mutation(
      api.lib.boilerplate.payments.stripe_connect.mutations.updateAccountStatus,
      {
        accountId: accountId as Id<'connectedAccounts'>,
        accountStatus: accountStatus.status,
        charges_enabled: accountStatus.charges_enabled,
        payouts_enabled: accountStatus.payouts_enabled,
        details_submitted: accountStatus.details_submitted,
        onboarding_completed:
          accountStatus.charges_enabled && accountStatus.payouts_enabled,
        capabilities: accountStatus.capabilities,
      }
    )

    return json(accountStatus)
  } catch (error) {
    console.error('Failed to get account status:', error)
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to get account status',
      },
      { status: 500 }
    )
  }
}