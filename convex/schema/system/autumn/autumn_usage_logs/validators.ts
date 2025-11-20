// convex/schema/boilerplate/autumn/autumn_usage_logs/validators.ts
// Grouped validators for autumn usage logs module

import { v } from 'convex/values';

export const autumnUsageLogsValidators = {
  syncedToAutumn: v.boolean(),
} as const;
