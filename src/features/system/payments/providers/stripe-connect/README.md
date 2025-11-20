# Stripe Connect Integration

Complete Stripe Connect Express implementation for revenue sharing payments. This allows your clients to receive payments directly while you automatically collect an application fee (your percentage).

## Overview

This implementation uses **Stripe Connect Express** accounts, which are perfect for platforms that want to:
- Accept payments on behalf of clients
- Automatically collect application fees (platform commission)
- Minimize compliance burden (Stripe handles most of it)
- Provide a simple onboarding experience

## Architecture

```
Customer Payment ($100)
        ↓
Stripe Processing
        ↓
   ┌────────────┐
   │  Split:    │
   │  $95 → Client (connected account)
   │  $5  → You (application fee)
   └────────────┘
```

## Setup Guide

### 1. Stripe Dashboard Configuration

1. **Enable Stripe Connect**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to Connect → Settings
   - Enable Connect for your account

2. **Create Connect Platform**
   - In Connect settings, create a new platform
   - Choose "Express" as the account type
   - Note your Connect Client ID (starts with `ca_`)

3. **Get API Keys**
   - Go to Developers → API keys
   - Copy your Secret Key (starts with `sk_test_` or `sk_live_`)
   - Copy your Publishable Key (starts with `pk_test_` or `pk_live_`)

4. **Set up Webhooks**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/stripe-connect/webhooks`
   - Select events:
     - `account.updated`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.succeeded`
     - `charge.refunded`
     - `invoice.payment_succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret (starts with `whsec_`)

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Connect Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_CONNECT_CLIENT_ID=ca_your_connect_client_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_APPLICATION_FEE_PERCENT=5
```

### 3. Database Schema

The schema is already created in Convex. Deploy it:

```bash
npx convex dev
```

This creates four tables:
- `connectedAccounts` - Client Stripe Connect accounts
- `clientProducts` - Products/pricing for each client
- `clientPayments` - Payment records with fee tracking
- `connectEvents` - Audit trail of all events

## Usage

### Creating a Connected Account (Client Onboarding)

```typescript
// Admin dashboard - create account for client
const response = await fetch('/api/stripe-connect/create-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    clientName: 'John Doe Consulting',
    clientEmail: 'john@example.com',
    country: 'US',
    businessType: 'individual',
  }),
});

const { accountId, stripeAccountId } = await response.json();
```

### Generate Onboarding Link

```typescript
// After creating account, generate onboarding link
const response = await fetch('/api/stripe-connect/onboarding-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountId: 'xxx', // From previous step
    refreshUrl: 'https://yourapp.com/admin/connect/refresh',
    returnUrl: 'https://yourapp.com/admin/connect/complete',
  }),
});

const { url } = await response.json();

// Redirect client to this URL to complete onboarding
window.location.href = url;
```

### Check Account Status

```typescript
const response = await fetch(
  `/api/stripe-connect/account-status?accountId=${accountId}`
);

const status = await response.json();
// Returns: { accountId, status, charges_enabled, payouts_enabled, ... }
```

### Create a Product for Client

```typescript
const response = await fetch('/api/stripe-connect/create-product', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    connectedAccountId: 'xxx',
    name: 'Monthly Subscription',
    description: 'Premium membership',
    amount: 9900, // $99.00 in cents
    currency: 'usd',
    interval: 'month', // or 'one_time', 'day', 'week', 'year'
    applicationFeePercent: 5, // Optional, defaults to env variable
  }),
});

const { productId, stripePriceId } = await response.json();
```

### Create Checkout Session (Customer Payment)

```typescript
// Customer clicks "Buy" on client's product
const response = await fetch('/api/stripe-connect/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    connectedAccountId: 'xxx',
    productId: 'xxx',
    customerEmail: 'customer@example.com',
    customerName: 'Jane Smith',
    successUrl: 'https://clientsite.com/success',
    cancelUrl: 'https://clientsite.com/cancel',
    metadata: {
      orderId: '12345',
      customField: 'value',
    },
  }),
});

const { url, sessionId } = await response.json();

// Redirect customer to Stripe checkout
window.location.href = url;
```

## Convex Queries

### Get All Connected Accounts

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const accounts = useQuery(api.lib.system.stripeConnect.queries.getAllConnectedAccounts);
```

### Get Active Accounts Only

```typescript
const activeAccounts = useQuery(
  api.lib.system.stripeConnect.queries.getActiveConnectedAccounts
);
```

### Get Account Payments

```typescript
const payments = useQuery(api.lib.system.stripeConnect.queries.getPaymentsByAccount, {
  connectedAccountId: accountId,
  limit: 50,
});
```

### Get Revenue Analytics

```typescript
const revenue = useQuery(api.lib.system.stripeConnect.queries.getAccountRevenue, {
  connectedAccountId: accountId,
  startDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
  endDate: Date.now(),
});

// Returns: { totalRevenue, totalFees, netRevenue, averagePayment, ... }
```

### Get Platform-Wide Revenue

```typescript
const platformRevenue = useQuery(
  api.lib.system.stripeConnect.queries.getPlatformRevenue,
  {
    startDate: startOfMonth,
    endDate: endOfMonth,
  }
);
```

## Fee Calculation

The application fee is automatically calculated:

- **Customer pays**: $100.00
- **Application fee (5%)**: $5.00 (goes to your platform account)
- **Client receives**: $95.00

Stripe's processing fees (~2.9% + $0.30) are deducted from the client's portion by default.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe-connect/create-account` | POST | Create Connect Express account |
| `/api/stripe-connect/onboarding-link` | POST | Generate onboarding URL |
| `/api/stripe-connect/account-status` | GET | Get account status & capabilities |
| `/api/stripe-connect/create-product` | POST | Create product/price for account |
| `/api/stripe-connect/create-checkout` | POST | Create checkout session with fee |
| `/api/stripe-connect/webhooks` | POST | Handle Stripe webhooks |

## Webhook Events Handled

- **account.updated**: Sync account status changes
- **payment_intent.succeeded**: Mark payment as successful
- **payment_intent.payment_failed**: Mark payment as failed
- **charge.succeeded**: Update payment with charge ID
- **charge.refunded**: Handle refunds
- **invoice.payment_succeeded**: Subscription payments
- **customer.subscription.*** : Subscription lifecycle

## Security Best Practices

1. **Never expose secret keys** - Only use in server-side code
2. **Verify webhook signatures** - Already implemented in webhook handler
3. **Validate user permissions** - Add admin role checks to sensitive endpoints
4. **Use HTTPS only** - Required for webhooks and payments
5. **Test with Stripe test mode** - Use test keys until ready for production

## Testing

### Test Mode

Use Stripe's test cards:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Workflow

1. Create a test connected account
2. Complete onboarding (Stripe pre-fills test data)
3. Create a test product
4. Make a test purchase
5. Check webhook logs in Stripe Dashboard
6. Verify payment appears in Convex

## Production Checklist

- [ ] Replace test API keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Add admin role authentication to API routes
- [ ] Set up proper error monitoring (Sentry, etc.)
- [ ] Review and adjust application fee percentage
- [ ] Test onboarding flow end-to-end
- [ ] Verify webhook signature validation
- [ ] Set up email notifications for account events
- [ ] Add rate limiting to public endpoints
- [ ] Configure CORS if needed for client sites

## Stripe Dashboard

Monitor your Connect platform:
- **Balance**: See application fees collected
- **Connect → Accounts**: View all connected accounts
- **Payments**: See all payments across all accounts
- **Webhooks**: Monitor webhook delivery and failures

## Support & Documentation

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Application Fees](https://stripe.com/docs/connect/charges#collecting-fees)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## Troubleshooting

### Webhooks not receiving

1. Check webhook URL is correct and accessible
2. Verify webhook secret in environment variables
3. Check Stripe Dashboard → Webhooks → Event logs
4. Ensure endpoint returns 200 status

### Account not becoming active

1. Check onboarding completion status
2. Verify all required information submitted
3. Check account status: `charges_enabled` and `payouts_enabled`
4. Review requirements in Stripe Dashboard

### Payment failing

1. Verify account is `active` status
2. Check product is `active`
3. Ensure price ID is correct
4. Test with Stripe test cards
5. Check Stripe Dashboard for detailed error

## Next Steps

The core functionality is complete. You may want to add:

1. **Frontend Components** - UI for admin dashboard and client checkout
2. **Email Notifications** - Alert clients of payments, issues
3. **Multi-client Support** - Scale to multiple clients if needed
4. **Custom Branding** - Add client logos, colors to checkout
5. **Payout Schedules** - Manage when clients receive funds
6. **Dispute Handling** - Handle chargebacks and disputes

---

**Ready to accept payments with revenue sharing! 🚀**
