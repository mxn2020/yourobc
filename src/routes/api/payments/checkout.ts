// File: src/routes/api/payments/checkout.ts
/**
 * API Route: Unified Checkout
 *
 * POST /api/payments/checkout
 * Creates a checkout session using the active payment provider
 *
 * Supports: Autumn (Better Auth), Autumn (Convex), Stripe Standard, Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/boilerplate/auth/lib/auth-config';
import { detectActiveProvider } from './_utils/provider-detector';
import type { CheckoutOptions } from '@/features/boilerplate/payments/types';

export const Route = createFileRoute('/api/payments/checkout')({
  server: {
    handlers: {
      POST: handleCheckout,
    },
  },
});

interface CheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
  metadata?: Record<string, any>;
}

async function handleCheckout({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = (await request.json()) as CheckoutRequest;
    const { planId, successUrl, cancelUrl, trialDays, metadata } = body;

    // 3. Validate required fields
    if (!planId) {
      return Response.json(
        { error: 'Missing required field: planId' },
        { status: 400 }
      );
    }

    // 4. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(`[Checkout] Using provider: ${type}`);

    // 5. Prepare checkout options
    const checkoutOptions: CheckoutOptions = {
      planId,
      successUrl,
      cancelUrl,
      trialDays,
      metadata: {
        ...metadata,
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
      },
    };

    // 6. Create checkout session
    const result = await provider.createCheckout(checkoutOptions);

    // 7. Handle result
    if (!result.success) {
      return Response.json(
        { error: result.error || 'Failed to create checkout session' },
        { status: 400 }
      );
    }

    // 8. Return success response
    return Response.json({
      success: true,
      url: result.url,
      sessionId: result.sessionId,
      provider: type,
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);

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

      // Provider not found errors
      if (error.message.includes('not found')) {
        return Response.json(
          {
            error: 'Invalid payment configuration',
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
