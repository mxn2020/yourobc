// src/features/system/payments/providers/autumn-convex/README.md
# Autumn + Convex Provider

Use Autumn's Convex component for server-side subscription management with full type safety.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install @useautumn/convex
```

### 2. Configure Convex App
```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import autumn from "@useautumn/convex/convex.config";

const app = defineApp();
app.use(autumn);

export default app;
```

### 3. Set Up Autumn
```typescript
// convex/autumn.ts
import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return {
      customerId: identity.subject,
      customerData: {
        name: identity.name,
        email: identity.email,
      },
    };
  },
});

export const { 
  track, 
  cancel, 
  query, 
  attach, 
  check, 
  checkout, 
  usage,
  billingPortal 
} = autumn.api();
```

### 4. Environment Variables
```env
AUTUMN_SECRET_KEY=am_sk_xxxxxxxxxxxxx
VITE_CONVEX_URL=https://your-deployment.convex.cloud
USE_CONVEX_AUTUMN=true
```

## 🎨 Components

### PurchaseButton
```typescript
import { PurchaseButton } from '@/features/system/payments/providers/autumn-convex';

<PurchaseButton planId="pro" trialDays={14}>
  Upgrade to Pro
</PurchaseButton>
```

### BillingPortalButton
```typescript
import { BillingPortalButton } from '@/features/system/payments/providers/autumn-convex';

<BillingPortalButton>
  Manage Subscription
</BillingPortalButton>
```

### SubscriptionStatus
```typescript
import { SubscriptionStatus } from '@/features/system/payments/providers/autumn-convex';

<SubscriptionStatus />
```

### UsageDisplay
```typescript
import { UsageDisplay } from '@/features/system/payments/providers/autumn-convex';

<UsageDisplay 
  featureKey="ai_requests"
  featureName="AI Requests"
  unit="requests"
/>
```

## 🪝 Hooks

### useAutumnConvexCustomer
```typescript
import { useAutumnConvexCustomer } from '@/features/system/payments/providers/autumn-convex';

function MyComponent() {
  const { customer, subscription, features, isLoading } = useAutumnConvexCustomer();
  
  return <div>Plan: {subscription?.productName}</div>;
}
```

### useAutumnConvexCheckout
```typescript
import { useAutumnConvexCheckout } from '@/features/system/payments/providers/autumn-convex';

function UpgradeButton() {
  const { createCheckout } = useAutumnConvexCheckout();
  
  const handleClick = async () => {
    await createCheckout({
      planId: 'pro',
      trialDays: 14,
    });
  };
  
  return <button onClick={handleClick}>Upgrade</button>;
}
```

### useAutumnConvexFeatureAccess
```typescript
import { useAutumnConvexFeatureAccess } from '@/features/system/payments/providers/autumn-convex';

function MyFeature() {
  const { hasAccess, reason, remaining, isLoading } = useAutumnConvexFeatureAccess('ai_requests');
  
  if (!hasAccess) {
    return <div>Access denied: {reason}</div>;
  }
  
  return <div>Feature content</div>;
}
```

### useAutumnConvexUsage
```typescript
import { useAutumnConvexUsage } from '@/features/system/payments/providers/autumn-convex';

function AIChat() {
  const { trackUsage, getUsageStats } = useAutumnConvexUsage();
  
  const handleSendMessage = async () => {
    // Send message...
    await trackUsage('ai_requests', 1);
  };
  
  const stats = getUsageStats('ai_requests');
  
  return <div>Used {stats.currentUsage} of {stats.limit}</div>;
}
```

## ✅ Features

- ✅ Server-side subscription management
- ✅ Full Convex type safety
- ✅ Real-time subscription updates
- ✅ Usage-based billing
- ✅ Feature access control
- ✅ No webhooks needed
- ✅ Works with Convex auth

## 🔄 Migration from Better Auth

If migrating from Autumn + Better Auth:

1. Keep Better Auth for authentication
2. Add Autumn Convex component
3. Update environment: `USE_CONVEX_AUTUMN=true`
4. Use Autumn Convex hooks instead of Better Auth hooks
5. Both can coexist if needed

## 📚 Resources

- [Autumn Convex Docs](https://www.convex.dev/components/autumn)
- [Autumn Documentation](https://docs.useautumn.com)
- [Convex Documentation](https://docs.convex.dev)

---

**Server-side payments with Convex! 🚀**