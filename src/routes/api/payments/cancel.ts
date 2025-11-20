// File: src/routes/api/payments/cancel.ts
/**
 * API Route: Unified Cancel Subscription
 *
 * POST /api/payments/cancel
 * Cancels subscription using the active payment provider
 *
 * Supports: Autumn (Better Auth), Autumn (Convex), Stripe Standard, Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/system/auth/lib/auth-config';
import { detectActiveProvider } from './_utils/provider-detector';

export const Route = createFileRoute('/api/payments/cancel')({
  server: {
    handlers: {
      POST: handleCancelSubscription,
    },
  },
});

interface CancelRequest {
  immediate?: boolean; // If true, cancel immediately. If false/undefined, cancel at period end
}

async function handleCancelSubscription({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = (await request.json()) as CancelRequest;
    const { immediate = false } = body;

    // 3. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(`[Cancel] Using provider: ${type}, immediate: ${immediate}`);

    // 4. Check if user has a subscription
    const subscription = await provider.getSubscription();

    if (!subscription) {
      return Response.json(
        {
          error: 'No active subscription found',
        },
        { status: 404 }
      );
    }

    // 5. Check if subscription is already cancelled
    if (subscription.status === 'cancelled') {
      return Response.json(
        {
          error: 'Subscription is already cancelled',
          subscription: {
            id: subscription.id,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          },
        },
        { status: 400 }
      );
    }

    // 6. Cancel subscription
    await provider.cancelSubscription(immediate);

    // 7. Get updated subscription
    const updatedSubscription = await provider.getSubscription();

    // 8. Return success response
    return Response.json({
      success: true,
      message: immediate
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the billing period',
      subscription: {
        id: updatedSubscription?.id,
        status: updatedSubscription?.status,
        cancelAtPeriodEnd: updatedSubscription?.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription?.currentPeriodEnd,
      },
      provider: type,
    });
  } catch (error) {
    console.error('[Cancel] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // No subscription errors
      if (
        error.message.includes('No subscription') ||
        error.message.includes('not found')
      ) {
        return Response.json(
          {
            error: 'No active subscription found',
            details: error.message,
          },
          { status: 404 }
        );
      }

      // Already cancelled errors
      if (error.message.includes('already cancelled')) {
        return Response.json(
          {
            error: 'Subscription is already cancelled',
            details: error.message,
          },
          { status: 400 }
        );
      }

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
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      },
      { status: 500 }
    );
  }
}
