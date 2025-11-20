// src/routes/api/ai/models/test.ts

/**
 * API Route: Test AI Models Route
 *
 * GET /api/ai/models/test
 * Simple test endpoint to verify routing works
 */

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/ai/models/test')({
  server: {
    handlers: {
      GET: handleTestRoute,
    },
  },
})

async function handleTestRoute({ request }: { request: Request }) {
  try {
    return Response.json({
      success: true,
      message: 'Test route works!',
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
