// convex/schema/boilerplate/autumn/autumn_usage_logs/types.ts
// Type extractions from validators for autumn usage logs module

import { Infer } from 'convex/values';
import { autumnUsageLogsValidators } from './validators';

// Extract types from validators
export type AutumnUsageLogSyncStatus = Infer<typeof autumnUsageLogsValidators.syncedToAutumn>;
