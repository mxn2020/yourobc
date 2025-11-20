// File: src/routes/api/payments/subscription.ts
/**
 * API Route: Unified Get Subscription
 *
 * GET /api/payments/subscription
 * Gets current user's subscription from the active payment provider
 *
 * Supports: Autumn (Better Auth), Autumn (Convex), Stripe Standard, Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/boilerplate/auth/lib/auth-config';
import { detectActiveProvider } from './_utils/provider-detector';

export const Route = createFileRoute('/api/payments/subscription')({
  server: {
    handlers: {
      GET: handleGetSubscription,
    },
  },
});

async function handleGetSubscription({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(`[Subscription] Using provider: ${type}`);

    // 3. Get subscription
    const subscription = await provider.getSubscription();

    // 4. Handle no subscription case
    if (!subscription) {
      return Response.json({
        success: true,
        subscription: null,
        provider: type,
        message: 'No active subscription found',
      });
    }

    // 5. Return subscription data
    return Response.json({
      success: true,
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        planName: subscription.planName,
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEndDate: subscription.trialEndDate,
        metadata: subscription.metadata,
      },
      provider: type,
    });
  } catch (error) {
    console.error('[Subscription] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Provider configuration errors
      if (error.message.includes('not configured')) {
        return Response.json(
          {
            error: 'Payment provider not configured. Please contact support.',
            details: error.message,
          },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get subscription',
      },
      { status: 500 }
    );
  }
}
