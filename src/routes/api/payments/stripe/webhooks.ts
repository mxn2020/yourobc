// src/routes/api/payments/stripe/webhooks.ts

/**
 * API Route: Stripe Webhooks
 *
 * POST /api/payments/stripe/webhooks
 * Handles webhook events from Stripe (subscriptions & payments)
 */

import { createFileRoute } from '@tanstack/react-router'
import { stripeService } from '@/features/boilerplate/payments/providers/stripe/services/StripeService'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type Stripe from 'stripe'
import { Id } from '@/convex/_generated/dataModel'

export const Route = createFileRoute('/api/payments/stripe/webhooks')({
  server: {
    handlers: {
      POST: handleStripeWebhook,
    },
  },
})

async function handleStripeWebhook({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Get raw body
    const body = await request.text()

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(body, signature)

    if (!event) {
      return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`)

    // Process based on event type
    switch (event.type) {
      // Customer events
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerUpdated(event.data.object as Stripe.Customer, convex)
        break

      // Checkout session events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, convex)
        break

      // Payment intent events
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent, convex)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, convex)
        break

      // Subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, convex)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, convex)
        break

      // Invoice events
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, convex)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, convex)
        break

      // Charge events
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge, convex)
        break

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// Webhook Event Handlers
// ============================================

/**
 * Handle customer created/updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer, convex: ConvexHttpClient) {
  console.log(`[Stripe Webhook] Processing customer: ${customer.id}`)

  const authUserId = customer.metadata?.userId || customer.metadata?.authUserId

  if (!authUserId) {
    console.warn(`[Stripe Webhook] Customer ${customer.id} has no userId/authUserId metadata`)
    return
  }

  await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.upsertCustomer, {
    stripeCustomerId: customer.id,
    email: customer.email || '',
    name: customer.name || undefined,
    metadata: customer.metadata,
  })
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  convex: ConvexHttpClient
) {
  console.log(`[Stripe Webhook] Processing checkout session: ${session.id}`)

  // If it's a subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    const subscription = await stripeService
      .getStripeInstance()
      .subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionUpdated(subscription, convex)
  }

  // If it's a payment checkout
  if (session.mode === 'payment' && session.payment_intent) {
    const paymentIntent = await stripeService
      .getStripeInstance()
      .paymentIntents.retrieve(session.payment_intent as string)
    await handlePaymentIntentSucceeded(paymentIntent, convex)
  }
}

/**
 * Maps Stripe subscription status to app's subscription status schema.
 * Stripe uses more granular statuses than our app schema supports.
 */
function mapStripeSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' {
  switch (stripeStatus) {
    case 'active':
    case 'canceled':
    case 'incomplete':
    case 'incomplete_expired':
    case 'past_due':
    case 'trialing':
    case 'unpaid':
      return stripeStatus
    // Map 'paused' to 'canceled' as it's not in our schema
    case 'paused':
      return 'canceled'
    default:
      // Exhaustive check - this should never happen with known Stripe status types
      console.warn(`Unexpected Stripe subscription status: ${stripeStatus}`)
      return 'unpaid'
  }
}

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  convex: ConvexHttpClient
) {
  console.log(`[Stripe Webhook] Processing subscription: ${subscription.id}`)

  const authUserId = subscription.metadata?.userId || subscription.metadata?.authUserId

  if (!authUserId) {
    console.warn(`[Stripe Webhook] Subscription ${subscription.id} has no userId/authUserId metadata`)
    return
  }

  // In API version 2025-10-29.clover, billing periods moved to subscription item level
  const subscriptionItem = subscription.items.data[0]
  const currentPeriodStart = subscriptionItem?.current_period_start
    ? subscriptionItem.current_period_start * 1000
    : Date.now()
  const currentPeriodEnd = subscriptionItem?.current_period_end
    ? subscriptionItem.current_period_end * 1000
    : Date.now()

  await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.upsertSubscription, {
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscriptionItem?.price.id || '',
    stripeProductId: (subscriptionItem?.price.product as string) || '',
    status: mapStripeSubscriptionStatus(subscription.status),
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at ? subscription.canceled_at * 1000 : undefined,
    trialStart: subscription.trial_start ? subscription.trial_start * 1000 : undefined,
    trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : undefined,
    metadata: subscription.metadata,
  })
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  convex: ConvexHttpClient
) {
  console.log(`[Stripe Webhook] Processing subscription deletion: ${subscription.id}`)

  await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.updateSubscriptionStatus, {
    stripeSubscriptionId: subscription.id,
    status: 'canceled',
    cancelAtPeriodEnd: false,
    canceledAt: Date.now(),
  })
}

/**
 * Handle payment intent succeeded
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  convex: ConvexHttpClient
) {
  console.log(`[Stripe Webhook] Processing payment intent succeeded: ${paymentIntent.id}`)

  const authUserId = paymentIntent.metadata?.userId || paymentIntent.metadata?.authUserId

  await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.upsertPayment, {
    stripeCustomerId: paymentIntent.customer as string | undefined,
    stripePaymentIntentId: paymentIntent.id,
    stripeChargeId: paymentIntent.latest_charge as string | undefined,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    description: paymentIntent.description || undefined,
    metadata: paymentIntent.metadata,
  })
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  convex: ConvexHttpClient
) {
  console.log(`[Stripe Webhook] Processing payment intent failed: ${paymentIntent.id}`)

  const authUserId = paymentIntent.metadata?.userId || paymentIntent.metadata?.authUserId

  await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.upsertPayment, {
    stripeCustomerId: paymentIntent.customer as string | undefined,
    stripePaymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'failed',
    description: paymentIntent.description || undefined,
    metadata: paymentIntent.metadata,
  })
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, convex: ConvexHttpClient) {
  console.log(`[Stripe Webhook] Processing invoice payment succeeded: ${invoice.id}`)

  // In API version 2025-10-29.clover, payment_intent has been moved to invoice.payments array
  const invoicePayment = invoice.payments?.data?.[0]
  if (invoicePayment?.payment) {
    const paymentIntentId = typeof invoicePayment.payment.payment_intent === 'string'
      ? invoicePayment.payment.payment_intent
      : invoicePayment.payment.payment_intent?.id

    if (paymentIntentId) {
      await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.updatePaymentStatus, {
        stripePaymentIntentId: paymentIntentId,
        status: 'succeeded',
      })
    }
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, convex: ConvexHttpClient) {
  console.log(`[Stripe Webhook] Processing invoice payment failed: ${invoice.id}`)

  // In API version 2025-10-29.clover, payment_intent has been moved to invoice.payments array
  const invoicePayment = invoice.payments?.data?.[0]
  if (invoicePayment?.payment) {
    const paymentIntentId = typeof invoicePayment.payment.payment_intent === 'string'
      ? invoicePayment.payment.payment_intent
      : invoicePayment.payment.payment_intent?.id

    if (paymentIntentId) {
      await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.updatePaymentStatus, {
        stripePaymentIntentId: paymentIntentId,
        status: 'failed',
      })
    }
  }

  // Update subscription if it's past due
  // In API version 2025-10-29.clover, subscription has been moved to invoice.parent.subscription_details.subscription
  const subscriptionId = invoice.parent?.subscription_details
    ? (typeof invoice.parent.subscription_details.subscription === 'string'
        ? invoice.parent.subscription_details.subscription
        : invoice.parent.subscription_details.subscription?.id)
    : undefined

  if (subscriptionId) {
    await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.updateSubscriptionStatus, {
      stripeSubscriptionId: subscriptionId,
      status: 'past_due',
    })
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge, convex: ConvexHttpClient) {
  console.log(`[Stripe Webhook] Processing charge refunded: ${charge.id}`)

  if (charge.payment_intent) {
    await convex.mutation(api.lib.boilerplate.payments.stripe.mutations.markPaymentRefunded, {
      stripePaymentIntentId: charge.payment_intent as string,
      refundAmount: charge.amount_refunded,
    })
  }
}
