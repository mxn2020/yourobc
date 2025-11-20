// src/routes/api/payments/stripe-connect/webhooks.ts

/**
 * API Route: Stripe Connect Webhooks
 *
 * POST /api/payments/stripe-connect/webhooks
 * Handles webhook events from Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { stripeConnectService } from '@/features/system/payments/providers/stripe-connect/services/StripeConnectService'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type Stripe from 'stripe'

export const Route = createFileRoute('/api/payments/stripe-connect/webhooks')({
  server: {
    handlers: {
      POST: handleStripeConnectWebhook,
    },
  },
})

// ============================================
// Main Webhook Handler
// ============================================

async function handleStripeConnectWebhook({ request }: { request: Request }) {
  try {
    const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Get raw body
    const body = await request.text()

    // Verify webhook signature
    const stripe = stripeConnectService()
    const event = stripe.verifyWebhookSignature(body, signature)

    // Log webhook event
    const eventId = await convex.mutation(
      api.lib.system.payments.stripe_connect.mutations.logConnectEvent,
      {
        eventType: 'webhook_received',
        stripeEventId: event.id,
        eventData: event.data,
        source: 'stripe_webhook',
        processed: false,
      }
    )

    // Process based on event type
    switch (event.type) {
      case 'account.updated': {
        await handleAccountUpdated(event.data.object as Stripe.Account, eventId)
        break
      }

      case 'payment_intent.succeeded': {
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
          event.account,
          eventId
        )
        break
      }

      case 'payment_intent.payment_failed': {
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
          event.account,
          eventId
        )
        break
      }

      case 'charge.succeeded': {
        await handleChargeSucceeded(event.data.object as Stripe.Charge, event.account, eventId)
        break
      }

      case 'charge.refunded': {
        await handleChargeRefunded(event.data.object as Stripe.Charge, event.account, eventId)
        break
      }

      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice,
          event.account,
          eventId
        )
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          event.account,
          eventId
        )
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          event.account,
          eventId
        )
        break
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`)
        await convex.mutation(
          api.lib.system.payments.stripe_connect.mutations.markEventProcessed,
          {
            eventId,
          }
        )
      }
    }

    return json({ received: true, eventId })
  } catch (error) {
    console.error('Webhook error:', error)
    return json(
      {
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 400 }
    )
  }
}

// ============================================
// Webhook Event Handlers
// ============================================

async function handleAccountUpdated(account: Stripe.Account, eventId: Id<'connectEvents'>) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    // Find connected account
    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: account.id,
      }
    )

    if (connectedAccount) {
      // Sync account status
      await convex.mutation(api.lib.system.payments.stripe_connect.mutations.syncAccountFromStripe, {
        accountId: connectedAccount._id,
        stripeAccountData: account,
      })

      await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
        eventId,
      })
    }
  } catch (error) {
    console.error('Error handling account.updated:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    // Find connected account
    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    // Update payment record
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.updatePaymentByStripeId, {
      stripePaymentIntentId: paymentIntent.id,
      status: 'succeeded',
    })

    // Log success event
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
      connectedAccountId: connectedAccount._id,
      eventType: 'payment_succeeded',
      source: 'stripe_webhook',
      processed: true,
    })

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.updatePaymentByStripeId, {
      stripePaymentIntentId: paymentIntent.id,
      status: 'failed',
    })

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
      connectedAccountId: connectedAccount._id,
      eventType: 'payment_failed',
      source: 'stripe_webhook',
      processed: true,
    })

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handleChargeSucceeded(
  charge: Stripe.Charge,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    // Try to find payment by payment intent
    if (charge.payment_intent && typeof charge.payment_intent === 'string') {
      await convex.mutation(api.lib.system.payments.stripe_connect.mutations.updatePaymentByStripeId, {
        stripePaymentIntentId: charge.payment_intent,
        stripeChargeId: charge.id,
      })
    }

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling charge.succeeded:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    if (charge.payment_intent && typeof charge.payment_intent === 'string') {
      const payment = await convex.query(
        api.lib.system.payments.stripe_connect.queries.getPaymentByStripeId,
        {
          stripePaymentIntentId: charge.payment_intent,
        }
      )

      if (payment) {
        await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markPaymentRefunded, {
          paymentId: payment._id,
          refund_amount: charge.amount_refunded,
        })

        await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
          connectedAccountId: connectedAccount._id,
          paymentId: payment._id,
          eventType: 'refund_created',
          source: 'stripe_webhook',
          processed: true,
        })
      }
    }

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling charge.refunded:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  const subscription = invoice.parent?.subscription_details?.subscription

  try {
    if (!accountId || !subscription) return

    // Extract subscription ID (could be string or Subscription object)
    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id
    if (!subscriptionId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    // This is a subscription payment
    // You might want to create a new payment record for each invoice
    // Or update the subscription payment record

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

/**
 * Maps Stripe subscription status to app's subscription status schema.
 * Stripe uses more granular statuses than our app schema supports.
 */
function mapStripeSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'past_due' | 'cancelled' | 'unpaid' {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled': // Stripe uses 'canceled' (one 'l')
      return 'cancelled' // App uses 'cancelled' (two 'l's)
    case 'unpaid':
      return 'unpaid'
    // Map other Stripe statuses to closest equivalent
    case 'incomplete':
    case 'incomplete_expired':
      return 'unpaid'
    case 'trialing':
      return 'active'
    case 'paused':
      return 'cancelled'
    default:
      // Exhaustive check - this should never happen with known Stripe status types
      console.warn(`Unexpected Stripe subscription status: ${stripeStatus}`)
      return 'unpaid'
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    const payments = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getPaymentsByAccount,
      {
        connectedAccountId: connectedAccount._id,
      }
    )

    const payment = payments.find((p) => p.stripeSubscriptionId === subscription.id)

    if (payment) {
      let periodEnd: number | undefined

      if (subscription.latest_invoice) {
        const stripe = stripeConnectService()
        const invoiceId =
          typeof subscription.latest_invoice === 'string'
            ? subscription.latest_invoice
            : subscription.latest_invoice.id

        const invoice = await stripe.getInvoice(invoiceId, accountId)
        periodEnd = invoice.period_end
      }

      await convex.mutation(
        api.lib.system.payments.stripe_connect.mutations.updateSubscriptionStatus,
        {
          paymentId: payment._id,
          subscription_status: mapStripeSubscriptionStatus(subscription.status),
          subscription_current_period_end: periodEnd ? periodEnd * 1000 : undefined,
        }
      )
    }

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  accountId: string | undefined,
  eventId: Id<'connectEvents'>
) {
  const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL!)

  try {
    if (!accountId) return

    const connectedAccount = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getConnectedAccountByStripeId,
      {
        stripeAccountId: accountId,
      }
    )

    if (!connectedAccount) return

    const payments = await convex.query(
      api.lib.system.payments.stripe_connect.queries.getPaymentsByAccount,
      {
        connectedAccountId: connectedAccount._id,
      }
    )

    const payment = payments.find((p) => p.stripeSubscriptionId === subscription.id)

    if (payment) {
      await convex.mutation(api.lib.system.payments.stripe_connect.mutations.updateSubscriptionStatus, {
        paymentId: payment._id,
        subscription_status: 'cancelled',
      })

      await convex.mutation(api.lib.system.payments.stripe_connect.mutations.logConnectEvent, {
        connectedAccountId: connectedAccount._id,
        paymentId: payment._id,
        eventType: 'subscription_cancelled',
        source: 'stripe_webhook',
        processed: true,
      })
    }

    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
    })
  } catch (error) {
    console.error('Error handling subscription.deleted:', error)
    await convex.mutation(api.lib.system.payments.stripe_connect.mutations.markEventProcessed, {
      eventId,
      error: (error as Error).message,
    })
  }
}