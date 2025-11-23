// convex/schema/system/audit_logs/audit_logs/types.ts
// Type extractions from validators for audit_logs module

import { Infer } from 'convex/values';
import { auditLogsFields, auditLogsValidators } from './validators';

export type AuditLogSource = Infer<typeof auditLogsValidators.source>;
export type AuditLogMetadata = Infer<typeof auditLogsFields.auditMetadata>;
