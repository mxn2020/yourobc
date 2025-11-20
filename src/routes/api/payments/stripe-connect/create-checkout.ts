// src/routes/api/payments/stripe-connect/create-checkout.ts

/**
 * API Route: Create Stripe Connect Checkout Session
 *
 * POST /api/payments/stripe-connect/create-checkout
 * Creates a checkout session for payments to a connected account with application fee
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeConnectService } from '@/features/system/payments/providers/stripe-connect/services/StripeConnectService';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export const Route = createFileRoute('/api/payments/stripe-connect/create-checkout')({
  server: {
    handlers: {
      POST: handleCreateCheckout,
    },
  },
})

async function handleCreateCheckout({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    // Parse request body
    const body = await request.json()
    const {
      connectedAccountId,
      productId,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      metadata,
    } = body

    if (!connectedAccountId || !productId || !successUrl || !cancelUrl) {
      return Response.json(
        {
          error:
            'Missing required fields: connectedAccountId, productId, successUrl, cancelUrl',
        },
        { status: 400 }
      )
    }

    // Get account from Convex
    const account = await convex.query(api.lib.system.payments.stripe_connect.queries.getConnectedAccount, {
      accountId: connectedAccountId as Id<'connectedAccounts'>,
    })

    if (!account) {
      return Response.json({ error: 'Connected account not found' }, { status: 404 })
    }

    if (account.accountStatus !== 'active') {
      return Response.json(
        {
          error:
            'Connected account is not active. Account must complete onboarding first.',
        },
        { status: 400 }
      )
    }

    // Get product from Convex
    const product = await convex.query(api.lib.system.payments.stripe_connect.queries.getProduct, {
      productId: productId as Id<'clientProducts'>,
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.active) {
      return Response.json({ error: 'Product is not active' }, { status: 400 })
    }

    // Create checkout session
    const stripe = stripeConnectService()
    const checkoutSession = await stripe.createCheckoutSession(
      {
        connectedAccountId: account.stripeAccountId,
        productId,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        metadata,
      },
      product.stripePriceId!, // Non-null assertion - always set when product is created
      product.application_fee_percent
    )

    // Create payment record in Convex
    const paymentId = await convex.mutation(api.lib.system.payments.stripe_connect.mutations.createPayment, {
      connectedAccountId: connectedAccountId as Id<'connectedAccounts'>,
      productId: productId as Id<'clientProducts'>,
      customerEmail,
      customerName,
      paymentType: product.interval === 'one_time' ? 'one_time' : 'subscription',
      amount: product.amount,
      application_fee_amount: Math.round(
        (product.amount * product.application_fee_percent) / 100
      ),
      net_amount:
        product.amount -
        Math.round((product.amount * product.application_fee_percent) / 100),
      currency: product.currency,
      status: 'pending',
      metadata,
    })

    // Log event
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
      connectedAccountId: connectedAccountId as Id<'connectedAccounts'>,
      paymentId,
      eventType: 'payment_created',
      source: 'api_call',
      processed: true,
    })

    return Response.json({
      ...checkoutSession,
      paymentId,
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    )
  }
}
