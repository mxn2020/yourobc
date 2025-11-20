// src/routes/api/payments/stripe-connect/create-account.ts

/**
 * API Route: Create Stripe Connect Account
 *
 * POST /api/payments/stripe-connect/create-account
 * Creates a Stripe Connect Express account for a client
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { stripeConnectService } from '@/features/system/payments/providers/stripe-connect/services/StripeConnectService'
import { auth } from '@/features/system/auth/lib/auth-config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const Route = createFileRoute('/api/payments/stripe-connect/create-account')({
  server: {
    handlers: {
      POST: handleCreateAccount,
    },
  },
})

async function handleCreateAccount({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin role check here
    // For now, only allow authenticated users

    // Parse request body
    const body = await request.json()
    const { clientName, clientEmail, country, businessType, metadata } = body

    if (!clientName || !clientEmail) {
      return json(
        { error: 'Missing required fields: clientName, clientEmail' },
        { status: 400 }
      )
    }

    // Create Stripe Connect account
    const stripe = stripeConnectService()
    const account = await stripe.createConnectedAccount({
      clientName,
      clientEmail,
      country: country || 'US',
      businessType: businessType || 'individual',
      metadata,
    })

    // Store in Convex
    const convexAccountId = await convex.mutation(
      api.lib.system.payments.stripe_connect.mutations.upsertConnectedAccount,
      {
        clientName,
        clientEmail,
        stripeAccountId: account.id,
        accountType: 'express',
        accountStatus: 'pending',
        capabilities: {
          card_payments: account.capabilities?.card_payments,
          transfers: account.capabilities?.transfers,
        },
        charges_enabled: account.charges_enabled || false,
        payouts_enabled: account.payouts_enabled || false,
        details_submitted: account.details_submitted || false,
        onboarding_completed: false,
        default_currency: account.default_currency || undefined,
        metadata,
      }
    )

    // Log event
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
      connectedAccountId: convexAccountId,
      eventType: 'account_created',
      source: 'api_call',
      processed: true,
    })

    return json({
      success: true,
      accountId: convexAccountId,
      stripeAccountId: account.id,
      message: 'Connected account created successfully',
    })
  } catch (error) {
    console.error('Failed to create connected account:', error)
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to create connected account',
      },
      { status: 500 }
    )
  }
}