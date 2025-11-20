// src/features/system/payments/README.md
# 💳 Payments Module

A modular, provider-agnostic payment and subscription management system for your SaaS application.

## 📋 Overview

This payment system supports multiple payment providers through a unified interface:

- **Autumn + Better Auth** ✅ (Easiest - Direct plugin)
- **Autumn + Convex** (Coming soon)
- **Stripe Standard** (Coming soon)
- **Stripe Connect** (Coming soon - For client payments)

## 🚀 Quick Start

### 1. Choose Your Provider

#### Option A: Autumn + Better Auth (Recommended)

The easiest setup - just a Better Auth plugin!

**Install:**
```bash
npm install autumn-js
```

**Environment:**
```env
AUTUMN_SECRET_KEY=am_sk_xxxxxxxxxxxxx
```

**Better Auth Config:**
```typescript
// src/features/system/auth/lib/auth-config.ts
import { betterAuth } from 'better-auth';
import { autumnBetterAuthConfig } from '@/features/system/payments';

export const auth = betterAuth({
  // ... your auth config
  plugins: [
    autumnBetterAuthConfig, // ✅ Add this line
  ],
});
```

**Client Setup:**
```typescript
// src/routes/__root.tsx
import { AutumnProvider } from 'autumn-js/react';

function RootComponent() {
  return (
    <AutumnProvider betterAuthUrl={import.meta.env.VITE_BETTER_AUTH_URL}>
      <YourApp />
    </AutumnProvider>
  );
}
```

**That's it!** 🎉 Your payment system is ready.

### 2. Define Your Plans

Plans are already configured in `config/plans-config.ts`. Customize them:
```typescript
// src/features/system/payments/config/plans-config.ts
export const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    // ... customize your plans
  },
  // ... more plans
];
```

### 3. Use in Your App
```typescript
import { 
  PricingPage, 
  BillingPage,
  usePaymentProvider,
  useFeatureAccess,
  useUsageTracking,
} from '@/features/system/payments';

// Show pricing page
<Route path="/pricing" component={PricingPage} />

// Show billing dashboard
<Route path="/billing" component={BillingPage} />

// In your components
function MyFeature() {
  const { hasAccess } = useFeatureAccess('ai_requests');
  const { trackUsage } = useUsageTracking();

  const handleUseFeature = async () => {
    if (!hasAccess) {
      // Show upgrade prompt
      return;
    }

    // Use the feature
    await trackUsage('ai_requests', 1);
  };

  return <div>...</div>;
}
```

## 🎨 Components

### Provider-Agnostic Components

These work with ANY payment provider:

#### PricingPlans
```typescript
import { PricingPlans } from '@/features/system/payments';

<PricingPlans 
  currentPlanId={subscription?.planId}
  onSelectPlan={(planId) => createCheckout({ planId })}
/>
```

#### FeatureGate
```typescript
import { FeatureGate, useFeatureAccess } from '@/features/system/payments';

function ProtectedFeature() {
  const featureAccess = useFeatureAccess('advanced_analytics');

  return (
    <FeatureGate featureAccess={featureAccess}>
      <AnalyticsDashboard />
    </FeatureGate>
  );
}
```

#### UsageIndicator
```typescript
import { UsageIndicator, useUsageTracking } from '@/features/system/payments';

function UsageDisplay() {
  const { getUsageStats } = useUsageTracking();
  const stats = getUsageStats('ai_requests');

  return (
    <UsageIndicator
      stats={stats}
      featureName="AI Requests"
      unit="requests"
    />
  );
}
```

### Provider-Specific Components

#### Autumn Better Auth
```typescript
import { 
  PurchaseButton,
  BillingPortalButton,
  SubscriptionStatus,
  UsageDisplay,
} from '@/features/system/payments/providers/autumn-betterauth';

// Upgrade button
<PurchaseButton planId="pro" trialDays={14}>
  Upgrade to Pro
</PurchaseButton>

// Billing portal
<BillingPortalButton />

// Show subscription
<SubscriptionStatus />

// Show usage for a feature
<UsageDisplay 
  featureKey="ai_requests" 
  featureName="AI Requests"
  unit="requests"
/>
```

## 🪝 Hooks

### usePaymentProvider

Main hook for provider-agnostic payment operations:
```typescript
import { usePaymentProvider } from '@/features/system/payments';

function MyComponent() {
  const {
    provider,           // Active provider type
    subscription,       // Current subscription
    createCheckout,     // Start checkout
    openBillingPortal,  // Open billing portal
    isLoading,
  } = usePaymentProvider();

  const handleUpgrade = async () => {
    await createCheckout({
      planId: 'pro',
      trialDays: 14,
      successUrl: '/billing?success=true',
      cancelUrl: '/pricing',
    });
  };

  return <button onClick={handleUpgrade}>Upgrade</button>;
}
```

### useFeatureAccess

Check if user has access to a feature:
```typescript
import { useFeatureAccess } from '@/features/system/payments';

function MyFeature() {
  const {
    hasAccess,
    reason,
    currentUsage,
    limit,
    remaining,
    isLoading,
  } = useFeatureAccess('ai_requests');

  if (!hasAccess) {
    return <UpgradePrompt reason={reason} />;
  }

  return <div>Feature content...</div>;
}
```

### useUsageTracking

Track and view usage:
```typescript
import { useUsageTracking } from '@/features/system/payments';

function AIChat() {
  const { trackUsage, getUsageStats } = useUsageTracking();

  const handleSendMessage = async () => {
    // Send message...
    
    // Track usage
    await trackUsage('ai_requests', 1);
  };

  // Get current usage
  const stats = getUsageStats('ai_requests');
  console.log(`Used ${stats.currentUsage} of ${stats.limit}`);

  return <div>...</div>;
}
```

### useActiveProvider

Detect which provider is active:
```typescript
import { useActiveProvider, useEnabledProviders } from '@/features/system/payments';

function PaymentSettings() {
  const activeProvider = useActiveProvider();
  const enabledProviders = useEnabledProviders();

  return (
    <div>
      <p>Active: {activeProvider}</p>
      <p>Available: {enabledProviders.join(', ')}</p>
    </div>
  );
}
```

## 📁 File Structure
```
src/features/system/payments/
├── types/                              # Shared types
│   ├── payment.types.ts               # Common payment interfaces
│   ├── provider.types.ts              # Provider interface
│   └── index.ts
│
├── config/                             # Configuration
│   ├── payment-config.ts              # Auto-detect providers
│   └── plans-config.ts                # Pricing plans
│
├── providers/                          # Payment provider implementations
│   ├── autumn-betterauth/             # ✅ Autumn + Better Auth
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── config/
│   │   ├── provider.ts
│   │   └── index.ts
│   │
│   ├── autumn-convex/                 # 🚧 Coming soon
│   ├── stripe-standard/               # 🚧 Coming soon
│   └── stripe-connect/                # 🚧 Coming soon
│
├── shared/                             # Shared across providers
│   ├── components/                    # Generic UI components
│   │   ├── PricingCard.tsx
│   │   ├── PricingPlans.tsx
│   │   ├── FeatureGate.tsx
│   │   ├── UpgradePrompt.tsx
│   │   └── UsageIndicator.tsx
│   └── hooks/                         # Generic hooks
│       ├── useActiveProvider.ts
│       └── usePaymentProvider.ts
│
├── pages/                              # Ready-to-use pages
│   ├── PricingPage.tsx
│   └── BillingPage.tsx
│
├── index.ts                            # Main exports
└── README.md
```

## 🔧 Configuration

The system auto-detects which providers are configured:
```typescript
// Detected from environment variables
AUTUMN_SECRET_KEY=am_sk_xxx           → Autumn + Better Auth ✅
USE_CONVEX_AUTUMN=true                → Autumn + Convex
STRIPE_SECRET_KEY=sk_xxx              → Stripe Standard
STRIPE_CONNECT_CLIENT_ID=ca_xxx       → Stripe Connect

// Manual override (optional)
PRIMARY_PAYMENT_PROVIDER=autumn-betterauth
```

### Payment Config
```typescript
import { PAYMENT_CONFIG } from '@/features/system/payments';

console.log(PAYMENT_CONFIG.primaryProvider);
// → 'autumn-betterauth'

console.log(PAYMENT_CONFIG.enabledProviders);
// → { 'autumn-betterauth': true, ... }
```

## 🎯 Usage Examples

### Example 1: Feature Gating
```typescript
import { useFeatureAccess, FeatureGate } from '@/features/system/payments';

function AdvancedFeature() {
  const featureAccess = useFeatureAccess('advanced_analytics');

  return (
    <FeatureGate 
      featureAccess={featureAccess}
      upgradeMessage="Upgrade to Pro to access advanced analytics"
    >
      <AnalyticsDashboard />
    </FeatureGate>
  );
}
```

### Example 2: Usage Tracking
```typescript
import { useUsageTracking, useFeatureAccess } from '@/features/system/payments';

function AIChat() {
  const { hasAccess, remaining } = useFeatureAccess('ai_requests');
  const { trackUsage } = useUsageTracking();

  const handleSendMessage = async (message: string) => {
    // Check access first
    if (!hasAccess) {
      toast.error('You have reached your AI request limit');
      return;
    }

    // Show warning if near limit
    if (remaining && remaining <= 5) {
      toast.warning(`Only ${remaining} AI requests remaining this month`);
    }

    // Send the message
    const response = await sendAIMessage(message);

    // Track usage
    await trackUsage('ai_requests', 1);

    return response;
  };

  return <ChatInterface onSendMessage={handleSendMessage} />;
}
```

### Example 3: Upgrade Flow
```typescript
import { usePaymentProvider } from '@/features/system/payments';
import { useToast } from '@/features/system/notifications';

function UpgradeButton() {
  const { createCheckout } = usePaymentProvider();
  const toast = useToast();

  const handleUpgrade = async () => {
    try {
      const result = await createCheckout({
        planId: 'pro',
        trialDays: 14,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
        metadata: {
          source: 'upgrade_button',
        },
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error('Failed to start checkout');
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      Upgrade to Pro - 14 Day Free Trial
    </button>
  );
}
```

### Example 4: Custom Pricing Page
```typescript
import { PricingCard, usePaymentProvider } from '@/features/system/payments';
import { DEFAULT_PLANS } from '@/features/system/payments/config/plans-config';

function CustomPricingPage() {
  const { subscription, createCheckout } = usePaymentProvider();

  return (
    <div className="grid grid-cols-3 gap-8">
      {DEFAULT_PLANS.filter(p => p.id !== 'free').map(plan => (
        <PricingCard
          key={plan.id}
          plan={plan}
          isCurrentPlan={subscription?.planId === plan.id}
          onSelectPlan={(planId) => createCheckout({ planId })}
        />
      ))}
    </div>
  );
}
```

## 🔌 Adding More Providers

To add a new payment provider:

1. Create provider directory:
```
providers/my-provider/
├── components/
├── hooks/
├── services/
├── provider.ts      # Implement PaymentProvider interface
└── index.ts
```

2. Implement `PaymentProvider` interface:
```typescript
import type { PaymentProvider } from '../../types';

export const myProvider: PaymentProvider = {
  name: 'My Provider',
  type: 'my-provider',
  
  async createCheckout(options) {
    // Implementation
  },
  
  // ... implement all methods
};
```

3. Add to config detection in `payment-config.ts`

4. Add to `usePaymentProvider` hook

5. Export from main index.ts

## 🎓 Best Practices

1. **Always check feature access before usage**
```typescript
const { hasAccess } = useFeatureAccess('feature_key');
if (!hasAccess) return <UpgradePrompt />;
```

2. **Track usage immediately after feature use**
```typescript
await useFeature();
await trackUsage('feature_key', 1);
```

3. **Use provider-agnostic components when possible**
```typescript
// ✅ Good - works with any provider
<PricingPlans />

// ❌ Avoid - provider-specific
<AutumnPricingPlans />
```

4. **Show usage indicators to users**
```typescript
<UsageIndicator 
  stats={getUsageStats('ai_requests')}
  featureName="AI Requests"
/>
```

## 🐛 Troubleshooting

### "No payment provider configured"

Make sure you have set up the environment variables and configured the provider:
```env
# For Autumn + Better Auth
AUTUMN_SECRET_KEY=am_sk_xxx
```

And added the plugin to Better Auth config.

### "Provider X not implemented"

The provider is not yet implemented. Current status:
- ✅ Autumn + Better Auth
- 🚧 Autumn + Convex (coming soon)
- 🚧 Stripe Standard (coming soon)
- 🚧 Stripe Connect (coming soon)

### Hooks not working

Make sure you're using hooks on the client-side and have wrapped your app with the provider:
```typescript
<AutumnProvider betterAuthUrl={...}>
  <App />
</AutumnProvider>
```

## 📚 Additional Resources

- [Autumn Documentation](https://docs.useautumn.com)
- [Better Auth Autumn Plugin](https://www.better-auth.com/docs/plugins/autumn)
- [Better Auth Documentation](https://www.better-auth.com)

## 🤝 Contributing

To add a new provider, see the "Adding More Providers" section above.

---

**Ready to accept payments! 🚀**
