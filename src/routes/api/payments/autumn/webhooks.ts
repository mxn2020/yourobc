// File: src/routes/api/payments/autumn/webhooks.ts
/**
 * API Route: Autumn Webhooks
 *
 * POST /api/payments/autumn/webhooks
 *
 * NOTE: Autumn webhooks are handled internally by the Autumn Convex component.
 * This endpoint is not needed for Autumn integration.
 *
 * Autumn automatically syncs subscription and payment data through its Convex integration.
 * See: /convex/lib/boilerplate/autumn.ts for the Autumn setup.
 *
 * How Autumn Works:
 * - Autumn integrates directly with Convex as a component
 * - All webhook events are processed automatically by Autumn
 * - Subscription data is stored in Convex tables managed by Autumn
 * - No manual webhook handling is required
 *
 * If you need to react to Autumn events in your app:
 * 1. Use Convex listeners/triggers on Autumn tables
 * 2. Use Autumn hooks on the client side (useAutumnCustomer, etc.)
 * 3. Query Autumn data directly from Convex functions
 *
 * For Autumn Better Auth integration, webhooks are also handled automatically
 * through the Better Auth plugin.
 */

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/payments/autumn/webhooks')({
  server: {
    handlers: {
      POST: handleAutumnWebhook,
    },
  },
});

async function handleAutumnWebhook({ request }: { request: Request }) {
  // This endpoint should not be called
  // Autumn handles webhooks internally
  return Response.json(
    {
      error: 'Autumn webhooks are handled internally by the Autumn Convex component',
      message:
        'No external webhook endpoint is needed. Autumn processes events automatically.',
      documentation: 'https://docs.useautumn.com/',
    },
    { status: 501 } // Not Implemented
  );
}
