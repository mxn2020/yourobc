// convex/convex.config.ts
/**
 * Convex Configuration
 *
 * Add Autumn component to your Convex app (only if AUTUMN_SECRET_KEY is configured)
 */

declare const process: { env: Record<string, string | undefined> }

import { defineApp } from 'convex/server';
import autumn from '@useautumn/convex/convex.config';

const app = defineApp();

// Only use Autumn component if AUTUMN_SECRET_KEY is configured
if (process.env.AUTUMN_SECRET_KEY) {
  app.use(autumn);
}

export default app;