// src/features/system/payments/providers/autumn-betterauth/README.md
# Autumn + Better Auth Provider

The easiest payment provider - just a Better Auth plugin!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install autumn-js
```

### 2. Get Autumn API Key

1. Sign up at [useautumn.com](https://useautumn.com)
2. Connect your Stripe account
3. Create your pricing plans in the dashboard
4. Copy your secret API key (starts with `am_sk_`)

### 3. Environment Variables
```env
AUTUMN_SECRET_KEY=am_sk_xxxxxxxxxxxxx
```

### 4. Add to Better Auth
```typescript
// src/features/system/auth/lib/auth-config.ts
import { betterAuth } from 'better-auth';
import { autumnBetterAuthConfig } from '@/features/system/payments';

export const auth = betterAuth({
  database: /* ... */,
  
  plugins: [
    autumnBetterAuthConfig, // ✅ Add this
  ],
});
```

### 5. Wrap App with Provider
```typescript
// src/routes/__root.tsx
import { AutumnProvider } from 'autumn-js/react';

function RootComponent() {
  return (
    <AutumnProvider betterAuthUrl={import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000"}>
      <YourApp />
    </AutumnProvider>
  );
}
```

## 🎨 Components

### PurchaseButton
```typescript
import { PurchaseButton } from '@/features/system/payments/providers/autumn-betterauth';

<PurchaseButton 
  planId="pro" 
  trialDays={14}
  metadata={{ source: 'homepage' }}
>
  Upgrade to Pro
</PurchaseButton>
```

### BillingPortalButton
```typescript
import { BillingPortalButton } from '@/features/system/payments/providers/autumn-betterauth';

<BillingPortalButton>
  Manage Subscription
</BillingPortalButton>
```

### SubscriptionStatus
```typescript
import { SubscriptionStatus } from '@/features/system/payments/providers/autumn-betterauth';

<SubscriptionStatus />
```

### UsageDisplay
```typescript
import { UsageDisplay } from '@/features/system/payments/providers/autumn-betterauth';

<UsageDisplay 
  featureKey="ai_requests"
  featureName="AI Requests"
  unit="requests"
/>
```

## 🪝 Hooks

### useAutumnCustomer

Direct access to Autumn's customer data:
```typescript
import { useAutumnCustomer } from '@/features/system/payments/providers/autumn-betterauth';

function MyComponent() {
  const {
    customer,              // Full customer object
    attach,                // Start checkout
    check,                 // Check feature access
    track,                 // Track usage
    openBillingPortal,     // Open billing portal
    subscription,          // Current subscription
    isLoading,
  } = useAutumnCustomer();

  return <div>...</div>;
}
```

### useAutumnCheckout

Simplified checkout:
```typescript
import { useAutumnCheckout } from '@/features/system/payments/providers/autumn-betterauth';

function UpgradeButton() {
  const { createCheckout } = useAutumnCheckout();

  const handleClick = async () => {
    await createCheckout({
      planId: 'pro',
      trialDays: 14,
    });
  };

  return <button onClick={handleClick}>Upgrade</button>;
}
```

### useAutumnFeatureAccess

Check feature access:
```typescript
import { useAutumnFeatureAccess } from '@/features/system/payments/providers/autumn-betterauth';

function MyFeature() {
  const {
    hasAccess,
    reason,
    currentUsage,
    limit,
    remaining,
  } = useAutumnFeatureAccess('ai_requests');

  if (!hasAccess) {
    return <div>Access denied: {reason}</div>;
  }

  return <div>Feature content</div>;
}
```

### useAutumnUsage

Track and view usage:
```typescript
import { useAutumnUsage } from '@/features/system/payments/providers/autumn-betterauth';

function AIChat() {
  const { trackUsage, getUsageStats } = useAutumnUsage();

  const handleSendMessage = async () => {
    // Send message...
    await trackUsage('ai_requests', 1);
  };

  const stats = getUsageStats('ai_requests');

  return <div>Used {stats.currentUsage} of {stats.limit}</div>;
}
```

## 🔧 Configuration

### Customer Scope

By default, each user is a customer. For organization billing:
```typescript
import { autumnOrganizationConfig } from '@/features/system/payments';

export const auth = betterAuth({
  plugins: [
    organization(),
    autumnOrganizationConfig, // Bill per organization
  ],
});
```

For both user and organization:
```typescript
import { autumnDualConfig } from '@/features/system/payments';

export const auth = betterAuth({
  plugins: [
    organization(),
    autumnDualConfig, // Support both
  ],
});
```

## 📊 Define Plans in Autumn

In the Autumn dashboard, define your plans:
```typescript
// This is in Autumn's dashboard, not your code
const freePlan = {
  id: 'free',
  name: 'Free',
  features: [
    { id: 'ai_requests', limit: 10, interval: 'month' }
  ]
};

const proPlan = {
  id: 'pro',
  name: 'Pro',
  price: 4900, // $49.00
  interval: 'month',
  features: [
    { id: 'ai_requests', limit: 500, interval: 'month' }
  ]
};
```

Then use them in your app:
```typescript
<PurchaseButton planId="pro" />
```

## ✅ Features

- ✅ Auto-create customers on signup
- ✅ No webhooks required
- ✅ Subscription management
- ✅ Usage-based billing
- ✅ Feature flags
- ✅ Billing portal
- ✅ Trial periods
- ✅ Upgrades/downgrades
- ✅ Cancellations
- ✅ Payment method management

## 📚 Resources

- [Autumn Documentation](https://docs.useautumn.com)
- [Better Auth Plugin Docs](https://www.better-auth.com/docs/plugins/autumn)
- [Autumn Dashboard](https://app.useautumn.com)

---

**The easiest way to add payments! 🎉**