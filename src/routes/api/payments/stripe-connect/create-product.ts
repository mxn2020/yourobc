// src/routes/api/payments/stripe-connect/create-product.ts

/**
 * API Route: Create Product for Connected Account
 *
 * POST /api/payments/stripe-connect/create-product
 * Creates a product and price on a connected account
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { stripeConnectService } from '@/features/boilerplate/payments/providers/stripe-connect/services/StripeConnectService'
import { auth } from '@/features/boilerplate/auth/lib/auth-config'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/api/payments/stripe-connect/create-product')({
  server: {
    handlers: {
      POST: handleCreateProduct,
    },
  },
})

async function handleCreateProduct({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Get session from auth
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      connectedAccountId,
      name,
      description,
      amount,
      currency,
      interval,
      applicationFeePercent,
      metadata,
    } = body

    if (!connectedAccountId || !name || !amount || !currency) {
      return json(
        {
          error:
            'Missing required fields: connectedAccountId, name, amount, currency',
        },
        { status: 400 }
      )
    }

    // Get account from Convex
    const account = await convex.query(
      api.lib.boilerplate.payments.stripe_connect.queries.getConnectedAccount,
      {
        accountId: connectedAccountId as Id<'connectedAccounts'>,
      }
    )

    if (!account) {
      return json({ error: 'Connected account not found' }, { status: 404 })
    }

    // Create product in Stripe
    const stripe = stripeConnectService()
    const productResponse = await stripe.createProduct({
      connectedAccountId: account.stripeAccountId,
      name,
      description,
      amount,
      currency,
      interval: interval || 'one_time',
      applicationFeePercent:
        applicationFeePercent ||
        parseFloat(process.env.STRIPE_APPLICATION_FEE_PERCENT || '5'),
      metadata,
    })

    // Store product in Convex
    const convexProductId = await convex.mutation(
      api.lib.boilerplate.payments.stripe_connect.mutations.createProduct,
      {
        connectedAccountId: connectedAccountId as Id<'connectedAccounts'>,
        stripeProductId: productResponse.stripeProductId,
        stripePriceId: productResponse.stripePriceId,
        name,
        description,
        amount,
        currency,
        interval: interval || 'one_time',
        application_fee_percent: productResponse.applicationFeePercent,
        active: true,
        metadata,
      }
    )

    return json({
      success: true,
      productId: convexProductId,
      stripeProductId: productResponse.stripeProductId,
      stripePriceId: productResponse.stripePriceId,
      message: 'Product created successfully',
    })
  } catch (error) {
    console.error('Failed to create product:', error)
    return json(
      {
        error: error instanceof Error ? error.message : 'Failed to create product',
      },
      { status: 500 }
    )
  }
}