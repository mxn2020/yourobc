// File: src/routes/api/payments/portal.ts
/**
 * API Route: Unified Billing Portal
 *
 * POST /api/payments/portal
 * Opens the billing portal using the active payment provider
 *
 * Supports: Autumn (Better Auth), Autumn (Convex), Stripe Standard, Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/system/auth/lib/auth-config';
import { detectActiveProvider } from './_utils/provider-detector';

export const Route = createFileRoute('/api/payments/portal')({
  server: {
    handlers: {
      POST: handleBillingPortal,
    },
  },
});

interface PortalRequest {
  returnUrl?: string;
}

async function handleBillingPortal({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = (await request.json()) as PortalRequest;
    const returnUrl = body.returnUrl || request.headers.get('referer') || '/';

    // 3. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(`[Portal] Using provider: ${type}`);

    // 4. Open billing portal
    // Note: The provider's openBillingPortal might return void or throw if it handles redirect internally
    // For API consistency, we catch any result and format it appropriately
    await provider.openBillingPortal(returnUrl);

    // 5. If we reach here, the provider returned successfully
    // Some providers might return a URL, others might handle redirection differently
    return Response.json({
      success: true,
      message: 'Billing portal access initiated',
      provider: type,
    });
  } catch (error) {
    console.error('[Portal] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // No subscription errors
      if (
        error.message.includes('No subscription') ||
        error.message.includes('not found')
      ) {
        return Response.json(
          {
            error: 'No active subscription found. Please subscribe to a plan first.',
            details: error.message,
          },
          { status: 404 }
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
        error:
          error instanceof Error ? error.message : 'Failed to access billing portal',
      },
      { status: 500 }
    );
  }
}
