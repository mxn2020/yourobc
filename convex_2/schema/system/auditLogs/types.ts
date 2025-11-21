// convex/schema/system/system/auditLogs/types.ts
// Type extractions from validators for auditLogs module

import { Infer } from 'convex/values';
import { auditLogsValidators } from './validators';

// Extract types from validators
export type AuditLogEntityType = Infer<typeof auditLogsValidators.entityType>;
