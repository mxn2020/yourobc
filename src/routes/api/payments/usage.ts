// File: src/routes/api/payments/usage.ts
/**
 * API Route: Unified Usage Tracking
 *
 * POST /api/payments/usage - Track usage of a feature
 * GET /api/payments/usage - Get usage statistics
 *
 * Supports: Autumn (Better Auth), Autumn (Convex), Stripe Standard, Stripe Connect
 */

import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/features/boilerplate/auth/lib/auth-config';
import { detectActiveProvider } from './_utils/provider-detector';

export const Route = createFileRoute('/api/payments/usage')({
  server: {
    handlers: {
      POST: handleTrackUsage,
      GET: handleGetUsage,
    },
  },
});

interface TrackUsageRequest {
  featureKey: string;
  quantity?: number;
  unit?: string;
  context?: string;
  metadata?: Record<string, any>;
}

/**
 * POST /api/payments/usage
 * Tracks usage of a feature
 */
async function handleTrackUsage({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = (await request.json()) as TrackUsageRequest;
    const { featureKey, quantity = 1, unit, context, metadata } = body;

    // 3. Validate required fields
    if (!featureKey) {
      return Response.json(
        { error: 'Missing required field: featureKey' },
        { status: 400 }
      );
    }

    // 4. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(
      `[Usage Track] Using provider: ${type}, feature: ${featureKey}, quantity: ${quantity}`
    );

    // 5. Track usage
    await provider.trackUsage(featureKey, quantity, {
      unit,
      context,
      metadata: {
        ...metadata,
        userId: session.user.id,
        timestamp: Date.now(),
      },
    });

    // 6. Get updated usage stats
    const stats = await provider.getUsageStats(featureKey);

    // 7. Return success response
    return Response.json({
      success: true,
      message: 'Usage tracked successfully',
      stats: stats,
      provider: type,
    });
  } catch (error) {
    console.error('[Usage Track] Error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Feature access errors
      if (error.message.includes('limit exceeded') || error.message.includes('no access')) {
        return Response.json(
          {
            error: 'Feature usage limit exceeded or access denied',
            details: error.message,
          },
          { status: 403 }
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
        error: error instanceof Error ? error.message : 'Failed to track usage',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/usage?featureKey=xxx
 * Gets usage statistics for a feature or all features
 */
async function handleGetUsage({ request }: { request: Request }) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse query params
    const url = new URL(request.url);
    const featureKey = url.searchParams.get('featureKey') || undefined;

    // 3. Detect active provider
    const { provider, type } = detectActiveProvider();

    console.log(`[Usage Get] Using provider: ${type}, feature: ${featureKey || 'all'}`);

    // 4. Get usage stats
    const stats = await provider.getUsageStats(featureKey);

    // 5. Return stats
    return Response.json({
      success: true,
      stats: stats,
      provider: type,
    });
  } catch (error) {
    console.error('[Usage Get] Error:', error);

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
        error: error instanceof Error ? error.message : 'Failed to get usage stats',
      },
      { status: 500 }
    );
  }
}
