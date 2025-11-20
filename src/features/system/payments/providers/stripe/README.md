# Stripe Standard Provider

Complete Stripe integration for SaaS subscriptions and one-time payments.

## Overview

The Stripe Standard provider handles regular subscription billing and one-time payments for SaaS applications. It is **not** for marketplace/platform payments - use `stripe-connect` for that.

### Use Cases

- ✅ **Regular SaaS subscriptions** - Monthly/annual billing
- ✅ **One-time payments** - Product purchases, upgrades
- ✅ **Billing portal** - Customer self-service
- ✅ **Trial periods** - Free trial conversions
- ❌ **Marketplace payments** - Use stripe-connect instead
- ❌ **Revenue sharing** - Use stripe-connect instead

---

## Quick Start

### 1. Environment Variables

Add to your `.env` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (for /api/stripe/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Basic Usage

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function PricingPage() {
  return (
    <div>
      <Stripe.CheckoutButton
        priceId="price_xxx"
        label="Subscribe Now"
        trialPeriodDays={14}
      />
    </div>
  );
}
```

---

## Components

### CheckoutButton

Initiates Stripe checkout for subscriptions or one-time payments.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

// Subscription checkout
<Stripe.CheckoutButton
  priceId="price_xxx"
  label="Subscribe to Pro"
  trialPeriodDays={14}
  successUrl="/dashboard?success=true"
  cancelUrl="/pricing"
/>

// One-time payment checkout
<Stripe.CheckoutButton
  amount={9900} // $99.00 in cents
  currency="usd"
  description="Premium Feature"
  label="Buy Now"
  successUrl="/success"
  cancelUrl="/pricing"
/>
```

**Props:**
- `priceId?` - Stripe price ID for subscriptions
- `amount?` - Amount in cents for one-time payments
- `currency?` - Currency code (default: 'usd')
- `description?` - Payment description
- `label?` - Button text
- `variant?` - Button style ('default' | 'outline' | 'ghost' | 'secondary')
- `size?` - Button size ('default' | 'sm' | 'lg')
- `successUrl?` - Redirect after successful payment
- `cancelUrl?` - Redirect after cancellation
- `trialPeriodDays?` - Free trial days
- `metadata?` - Custom metadata
- `onSuccess?` - Success callback
- `onError?` - Error callback

### SubscriptionStatus

Displays current subscription status with management options.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

<Stripe.SubscriptionStatus
  showDetails={true}
  showActions={true}
/>
```

**Features:**
- Status badge (Active, Trial, Past Due, Canceled)
- Current period dates
- Cancellation warning
- Cancel/Resume buttons
- Subscription ID display

**Props:**
- `showDetails?` - Show detailed info (default: true)
- `showActions?` - Show cancel/resume buttons (default: true)
- `className?` - Custom CSS class

### BillingPortalButton

Opens Stripe's hosted billing portal.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

<Stripe.BillingPortalButton
  label="Manage Billing"
  variant="outline"
  returnUrl="/settings"
/>
```

**Features:**
- Update payment methods
- View invoices
- Manage subscriptions
- Update billing details

**Props:**
- `label?` - Button text (default: 'Manage Billing')
- `variant?` - Button style
- `size?` - Button size
- `returnUrl?` - URL to return to after portal
- `className?` - Custom CSS class
- `onSuccess?` - Success callback
- `onError?` - Error callback

### PricingCard

Displays a pricing plan with features and checkout button.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

const plan = {
  id: 'pro',
  name: 'Pro Plan',
  description: 'For growing businesses',
  price: 2900, // $29.00
  currency: 'usd',
  interval: 'month',
  stripePriceId: 'price_xxx',
  active: true,
  features: [
    'Unlimited projects',
    'Priority support',
    'Advanced analytics',
  ],
};

<Stripe.PricingCard
  plan={plan}
  featured={true}
  trialPeriodDays={14}
/>
```

**Props:**
- `plan` - SubscriptionPlan object
- `featured?` - Highlight as recommended
- `trialPeriodDays?` - Free trial days
- `successUrl?` - Redirect after checkout
- `cancelUrl?` - Redirect after cancellation
- `className?` - Custom CSS class

---

## Hooks

### useStripeCustomer

Access customer data and Stripe customer ID.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function CustomerInfo() {
  const {
    customer,
    stripeCustomerId,
    exists,
    isLoading,
    user,
  } = Stripe.useStripeCustomer();

  if (isLoading) return <Loading />;
  if (!exists) return <div>No customer record</div>;

  return <div>Customer ID: {stripeCustomerId}</div>;
}
```

**Returns:**
- `customer` - Customer data from Convex
- `stripeCustomerId` - Stripe customer ID
- `exists` - Whether customer exists
- `isLoading` - Loading state
- `user` - Current auth user

### useStripeCheckout

Create checkout sessions for subscriptions and payments.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function SubscribeButton({ priceId }) {
  const {
    createSubscriptionCheckout,
    createPaymentCheckout,
    isCreating,
    error,
  } = Stripe.useStripeCheckout();

  const handleSubscribe = async () => {
    const result = await createSubscriptionCheckout({
      priceId,
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.href,
      trialPeriodDays: 14,
    });

    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <button onClick={handleSubscribe} disabled={isCreating}>
      {isCreating ? 'Loading...' : 'Subscribe'}
    </button>
  );
}
```

**Methods:**
- `createSubscriptionCheckout(options)` - Create subscription checkout
- `createPaymentCheckout(options)` - Create one-time payment checkout

**Returns:**
- `isCreating` - Creating checkout session
- `error` - Error message if any
- `stripeCustomerId` - Customer ID

### useStripeSubscription

Manage user subscriptions.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function SubscriptionManager() {
  const {
    subscription,
    isActive,
    isTrialing,
    willCancelAtPeriodEnd,
    currentPeriodEnd,
    cancelSubscription,
    resumeSubscription,
    isLoading,
  } = Stripe.useStripeSubscription();

  if (isLoading) return <Loading />;
  if (!subscription) return <div>No subscription</div>;

  return (
    <div>
      <p>Status: {subscription.status}</p>
      <p>Renews: {new Date(currentPeriodEnd).toLocaleDateString()}</p>

      {!willCancelAtPeriodEnd && (
        <button onClick={() => cancelSubscription()}>
          Cancel Subscription
        </button>
      )}

      {willCancelAtPeriodEnd && (
        <button onClick={() => resumeSubscription()}>
          Resume Subscription
        </button>
      )}
    </div>
  );
}
```

**Methods:**
- `cancelSubscription(immediate?)` - Cancel subscription
- `resumeSubscription()` - Resume canceled subscription

**Returns:**
- `subscription` - Subscription data
- `allSubscriptions` - All user subscriptions
- `stripeSubscriptionId` - Subscription ID
- `exists` - Has subscription
- `isActive` - Status is active
- `isTrialing` - Status is trialing
- `isCanceled` - Status is canceled
- `isPastDue` - Status is past_due
- `willCancelAtPeriodEnd` - Will cancel at period end
- `currentPeriodEnd` - Period end timestamp
- `currentPeriodStart` - Period start timestamp
- `isLoading` - Loading state
- `isCanceling` - Canceling in progress
- `isResuming` - Resuming in progress
- `error` - Error message

### useStripeBillingPortal

Access Stripe's hosted billing portal.

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function ManageBillingButton() {
  const {
    openBillingPortal,
    isOpening,
    hasCustomer,
  } = Stripe.useStripeBillingPortal();

  const handleClick = async () => {
    const result = await openBillingPortal();
    if (result.success && result.url) {
      window.location.href = result.url;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isOpening || !hasCustomer}
    >
      {isOpening ? 'Loading...' : 'Manage Billing'}
    </button>
  );
}
```

**Methods:**
- `openBillingPortal(returnUrl?)` - Open billing portal

**Returns:**
- `isOpening` - Opening portal
- `error` - Error message
- `stripeCustomerId` - Customer ID
- `hasCustomer` - Has customer record

---

## API Routes

All routes are automatically available at `/api/stripe/*`:

### POST /api/stripe/create-subscription
Create a subscription checkout session.

**Request:**
```json
{
  "priceId": "price_xxx",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/pricing",
  "trialPeriodDays": 14,
  "metadata": {
    "planId": "pro"
  }
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/create-payment
Create a one-time payment checkout session.

**Request:**
```json
{
  "amount": 9900,
  "currency": "usd",
  "description": "Premium Feature",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/pricing"
}
```

### POST /api/stripe/cancel-subscription
Cancel a subscription.

**Request:**
```json
{
  "subscriptionId": "sub_xxx",
  "cancelImmediately": false
}
```

### POST /api/stripe/resume-subscription
Resume a canceled subscription.

**Request:**
```json
{
  "subscriptionId": "sub_xxx"
}
```

### POST /api/stripe/billing-portal
Create billing portal session.

**Request:**
```json
{
  "customerId": "cus_xxx",
  "returnUrl": "https://app.com/settings"
}
```

### POST /api/stripe/webhooks
Handle Stripe webhook events.

**Handles:**
- `checkout.session.completed`
- `customer.created/updated`
- `customer.subscription.created/updated/deleted`
- `payment_intent.succeeded/failed`
- `invoice.payment_succeeded/failed`
- `charge.refunded`

---

## Database Schema

### stripeCustomers
- `userId` - Auth user ID
- `stripeCustomerId` - Stripe customer ID
- `email` - Customer email
- `name` - Customer name
- `metadata` - Custom metadata

### stripeSubscriptions
- `userId` - Auth user ID
- `stripeCustomerId` - Stripe customer ID
- `stripeSubscriptionId` - Stripe subscription ID
- `stripePriceId` - Stripe price ID
- `stripeProductId` - Stripe product ID
- `status` - Subscription status
- `currentPeriodStart` - Period start timestamp
- `currentPeriodEnd` - Period end timestamp
- `cancelAtPeriodEnd` - Will cancel at period end
- `canceledAt` - Cancellation timestamp
- `trialStart` - Trial start timestamp
- `trialEnd` - Trial end timestamp
- `metadata` - Custom metadata

### stripePayments
- `userId` - Auth user ID (optional)
- `stripeCustomerId` - Stripe customer ID (optional)
- `stripePaymentIntentId` - Payment intent ID
- `stripeChargeId` - Charge ID
- `amount` - Amount in cents
- `currency` - Currency code
- `status` - Payment status
- `description` - Payment description
- `refunded` - Is refunded
- `refundAmount` - Refund amount
- `refundDate` - Refund timestamp
- `metadata` - Custom metadata

---

## Webhook Setup

### 1. Local Development

Use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Copy the webhook signing secret to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Production

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Webhooks
2. Add endpoint: `https://yourapp.com/api/stripe/webhooks`
3. Select events:
   - `checkout.session.completed`
   - `customer.*`
   - `customer.subscription.*`
   - `payment_intent.*`
   - `invoice.payment_*`
   - `charge.refunded`
4. Copy webhook signing secret to production env

---

## Testing

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### Test Mode

All API keys starting with `pk_test_` and `sk_test_` are test mode.

---

## Examples

### Full Subscription Flow

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function SubscriptionFlow() {
  const { subscription, isActive } = Stripe.useStripeSubscription();

  // No subscription - show pricing
  if (!subscription) {
    return (
      <Stripe.PricingCard
        plan={proPlan}
        trialPeriodDays={14}
        featured={true}
      />
    );
  }

  // Active subscription - show management
  if (isActive) {
    return (
      <div>
        <Stripe.SubscriptionStatus showActions={true} />
        <Stripe.BillingPortalButton />
      </div>
    );
  }

  // Canceled/expired - show reactivation
  return (
    <div>
      <p>Your subscription has ended</p>
      <Stripe.CheckoutButton priceId={proPlan.stripePriceId} />
    </div>
  );
}
```

### Custom Checkout

```tsx
import { Stripe } from '@/features/boilerplate/payments';

function CustomCheckout() {
  const { createSubscriptionCheckout, isCreating } = Stripe.useStripeCheckout();

  const handleCheckout = async (plan) => {
    const result = await createSubscriptionCheckout({
      priceId: plan.stripePriceId,
      successUrl: `${window.location.origin}/success?plan=${plan.id}`,
      cancelUrl: window.location.href,
      trialPeriodDays: plan.trialDays,
      metadata: {
        planId: plan.id,
        source: 'pricing_page',
      },
    });

    if (result.success && result.url) {
      // Track analytics
      analytics.track('checkout_initiated', { plan: plan.id });

      // Redirect to Stripe
      window.location.href = result.url;
    }
  };

  return (
    <button onClick={() => handleCheckout(proPlan)} disabled={isCreating}>
      {isCreating ? 'Redirecting...' : 'Subscribe Now'}
    </button>
  );
}
```

---

## Troubleshooting

### "No customer ID found"
Make sure user is authenticated and customer record exists. Customer is created automatically on first checkout.

### "Invalid webhook signature"
Check that `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook endpoint secret.

### Checkout not redirecting
Ensure `successUrl` and `cancelUrl` are absolute URLs (include protocol and domain).

### Subscription not updating
Check webhook events are being received. Use Stripe Dashboard → Webhooks to see delivery status.

---

## Comparison: Stripe vs Stripe Connect

| Feature | Stripe Standard | Stripe Connect |
|---------|----------------|----------------|
| **Purpose** | SaaS subscriptions | Marketplace payments |
| **Use Case** | Your own billing | Client/vendor payments |
| **Revenue** | You receive 100% | Client receives, you take fee |
| **Billing Portal** | ✅ Yes | ❌ No |
| **Subscriptions** | ✅ Yes | ⚠️ Complex |
| **Setup** | Simple | Complex onboarding |
| **Recommended For** | Most SaaS apps | Platforms/marketplaces |

**When to use Stripe Standard:**
- Regular SaaS subscription billing
- Direct product sales
- Simple payment flows
- You are the merchant

**When to use Stripe Connect:**
- Multi-tenant platforms
- Marketplace with sellers
- Revenue sharing needed
- Clients need separate accounts

---

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Provider Issues**: Check `/docs/payments/` folder

---

*Last updated: 2025-11-04*
